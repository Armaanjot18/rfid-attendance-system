// ESP8266 (NodeMCU) + MFRC522 + SSD1306 OLED Attendance Client (Memory-Optimized)
// Posts scans to /api/attendance/rfid and shows status on 128x64 OLED.

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ------------ Feature Flags (set to 1 to enable) ------------
#define ENABLE_QUEUE 0          // offline queue for scans when WiFi down
#define QUEUE_CAPACITY 5        // max queued tags
#define VERBOSE 0               // verbose serial logs

// ------------ Pins / Hardware ------------
#define RF_SS_PIN 15   // D8 (SDA / SS)
#define RF_RST_PIN 0   // D3 (RST)
MFRC522 rfid(RF_SS_PIN, RF_RST_PIN);

#define OLED_ADDR 0x3C // I2C address
#define OLED_WIDTH 128
#define OLED_HEIGHT 64
Adafruit_SSD1306 display(OLED_WIDTH, OLED_HEIGHT, &Wire, -1);
bool displayReady = false;

// ------------ Configuration (EDIT) ------------
static const char WIFI_SSID[]     = "YOUR_WIFI_SSID";      // <-- change
static const char WIFI_PASSWORD[] = "YOUR_WIFI_PASSWORD";  // <-- change
static const char SERVER_HOST[]   = "192.168.1.100";       // backend IP LAN
static const uint16_t SERVER_PORT = 3000;                  // backend port
static const char ENDPOINT[]      = "/api/attendance/rfid";
static const char DEVICE_ID[]     = "ESP8266_GATE_1";
static const char LOCATION[]      = "North Wing";
static const char DEVICE_KEY[]    = "CHANGE_ME_OPTIONAL";  // must match RFID_DEVICE_KEY if used

// ------------ Timing ------------
static const unsigned long SCAN_DEBOUNCE_MS = 2500;
static const unsigned long WIFI_RETRY_MS = 10000;
unsigned long lastScanMs = 0;
unsigned long lastWifiCheck = 0;

// ------------ Queue (optional) ------------
#if ENABLE_QUEUE
struct QueuedScan { char tag[21]; unsigned long ms; };
QueuedScan scanQueue[QUEUE_CAPACITY];
uint8_t queueCount = 0;
void enqueueScan(const char *tag) {
  if (queueCount >= QUEUE_CAPACITY) return; // drop if full
  strncpy(scanQueue[queueCount].tag, tag, sizeof(scanQueue[queueCount].tag)-1);
  scanQueue[queueCount].tag[sizeof(scanQueue[queueCount].tag)-1] = '\0';
  scanQueue[queueCount].ms = millis();
  queueCount++;
  if (VERBOSE) Serial.println(F("[QUEUE] Stored scan"));
}
void flushQueue() {
  if (WiFi.status() != WL_CONNECTED || queueCount == 0) return;
  for (uint8_t i=0;i<queueCount;i++) {
    if (VERBOSE) Serial.printf("[QUEUE] Flushing %s\n", scanQueue[i].tag);
    // attempt post; ignore result
    WiFiClient client; HTTPClient http;
    char url[128];
    snprintf(url, sizeof(url), "http://%s:%u%s", SERVER_HOST, SERVER_PORT, ENDPOINT);
    if (http.begin(client, url)) {
      http.addHeader("Content-Type", "application/json");
      if (strlen(DEVICE_KEY) > 0) http.addHeader("X-DEVICE-KEY", DEVICE_KEY);
      char body[160];
      snprintf(body, sizeof(body), "{\"rfidTag\":\"%s\",\"deviceId\":\"%s\",\"location\":\"%s\"}", scanQueue[i].tag, DEVICE_ID, LOCATION);
      http.POST(body);
      http.end();
    }
  }
  queueCount = 0;
}
#endif

// ------------ Display Helpers ------------
void showLines(const char *l1, const char *l2 = nullptr, const char *l3 = nullptr, const char *l4 = nullptr) {
  if (!displayReady) return;
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,0);
  display.println(l1);
  if (l2 && *l2) display.println(l2);
  if (l3 && *l3) display.println(l3);
  if (l4 && *l4) display.println(l4);
  display.display();
}

void initDisplay() {
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println(F("[DISPLAY] Init failed - continuing headless"));
    displayReady = false;
    return;
  }
  displayReady = true;
  showLines("RFID WiFi", "Booting...");
}

void showScanResult(const char *tag, bool ok) {
  char line[24];
  snprintf(line, sizeof(line), "%s", tag);
  showLines(ok ? "Scan OK" : "Scan FAIL", line);
}

// ------------ WiFi ------------
void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print(F("Connecting to "));
  Serial.println(WIFI_SSID);
  uint8_t dots=0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print('.');
    if (dots++ % 6 == 0) {
      char retry[16]; snprintf(retry, sizeof(retry), "Retry %u", dots/6);
      showLines("WiFi...", WIFI_SSID, retry);
    }
  }
  Serial.println();
  Serial.println(F("WiFi connected"));
  Serial.print(F("IP: ")); Serial.println(WiFi.localIP());
  char ip[24]; snprintf(ip, sizeof(ip), "%s", WiFi.localIP().toString().c_str());
  showLines("WiFi OK", ip, "Ready");
}

// ------------ RFID ------------
bool readTagHex(char *out, size_t outSize) {
  if (!rfid.PICC_IsNewCardPresent()) return false;
  if (!rfid.PICC_ReadCardSerial()) return false;
  size_t idx = 0;
  for (byte i=0; i<rfid.uid.size && (idx+2) < outSize; i++) {
    byte val = rfid.uid.uidByte[i];
    if (val < 0x10) {
      if (idx < outSize-1) out[idx++] = '0';
    }
    const char *hex = "0123456789ABCDEF";
    if (idx < outSize-1) out[idx++] = hex[val >> 4];
    if (idx < outSize-1) out[idx++] = hex[val & 0x0F];
  }
  out[idx] = '\0';
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  return true;
}

// ------------ POST Attendance ------------
bool postRFID(const char *tag) {
  if (WiFi.status() != WL_CONNECTED) return false;
  WiFiClient client;
  HTTPClient http;
  char url[128];
  snprintf(url, sizeof(url), "http://%s:%u%s", SERVER_HOST, SERVER_PORT, ENDPOINT);
  if(!http.begin(client, url)) return false;
  http.addHeader("Content-Type", "application/json");
  if (strlen(DEVICE_KEY) > 0) http.addHeader("X-DEVICE-KEY", DEVICE_KEY);
  char body[160];
  snprintf(body, sizeof(body), "{\"rfidTag\":\"%s\",\"deviceId\":\"%s\",\"location\":\"%s\"}", tag, DEVICE_ID, LOCATION);
  int code = http.POST(body);
  if (VERBOSE) Serial.printf("POST %s -> %d\n", url, code);
  bool ok = false;
  if (code > 0) {
    String resp = http.getString(); // kept as String to parse quickly; could stream if needed
    if (VERBOSE) Serial.println(resp);
    ok = (code == 201 || resp.indexOf("\"success\":true") != -1);
  }
  http.end();
  return ok;
}

// ------------ Setup ------------
void setup() {
  Serial.begin(115200);
  delay(150);
  initDisplay();
  connectWiFi();
  SPI.begin();
  rfid.PCD_Init();
  Serial.println(F("RFID Ready"));
  showLines("Ready", "Scan card...");
}

// ------------ Loop ------------
void loop() {
  // WiFi health check
  if (millis() - lastWifiCheck > WIFI_RETRY_MS) {
    lastWifiCheck = millis();
    if (WiFi.status() != WL_CONNECTED) {
      showLines("WiFi lost", "Reconnecting...");
      connectWiFi();
    }
#if ENABLE_QUEUE
    flushQueue();
#endif
  }

  char tag[21];
  if (readTagHex(tag, sizeof(tag))) {
    unsigned long now = millis();
    if (now - lastScanMs < SCAN_DEBOUNCE_MS) return; // debounce
    lastScanMs = now;
    Serial.print(F("Tag: ")); Serial.println(tag);
    showLines("Sending", tag);
    bool ok = postRFID(tag);
    if (!ok) {
#if ENABLE_QUEUE
      enqueueScan(tag);
#endif
    }
    showScanResult(tag, ok);
  }
}
