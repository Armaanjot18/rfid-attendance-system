// ESP8266 (NodeMCU) + MFRC522 + 16x2 I2C LCD Attendance Client (Memory-Optimized)
// Reduced dynamic String usage; char buffers + F() macros to lower IRAM pressure.

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ---- Feature Flags ----
#define ENABLE_QUEUE 0
#define QUEUE_CAPACITY 5
#define VERBOSE 0

// ---- RFID Pins ----
#define RF_SS_PIN 15   // D8
#define RF_RST_PIN 0   // D3
MFRC522 rfid(RF_SS_PIN, RF_RST_PIN);

// ---- LCD ----
#define LCD_ADDR 0x27
LiquidCrystal_I2C lcd(LCD_ADDR, 16, 2);

// ---- Config (EDIT THESE) ----
static const char WIFI_SSID[]     = "5G";           // <-- change
static const char WIFI_PASSWORD[] = "abcdefgh";     // <-- change
static const char SERVER_HOST[]   = "192.168.1.100"; // backend IP
static const uint16_t SERVER_PORT = 3000;            // backend port
static const char ENDPOINT[]      = "/api/attendance/rfid";
static const char DEVICE_ID[]     = "ESP8266_GATE_LCD";
static const char LOCATION[]      = "North Wing";
static const char DEVICE_KEY[]    = "CHANGE_ME_OPTIONAL"; // must match RFID_DEVICE_KEY if used

// ---- Timing ----
static const unsigned long SCAN_DEBOUNCE_MS = 2500;
static const unsigned long WIFI_RETRY_MS = 10000;
unsigned long lastScanMs = 0;
unsigned long lastWifiCheck = 0;

// ---- Queue (optional) ----
#if ENABLE_QUEUE
struct QueuedScan { char tag[21]; unsigned long ms; };
QueuedScan scanQueue[QUEUE_CAPACITY];
uint8_t queueCount = 0;
void enqueueScan(const char *tag) {
  if (queueCount >= QUEUE_CAPACITY) return;
  strncpy(scanQueue[queueCount].tag, tag, sizeof(scanQueue[queueCount].tag)-1);
  scanQueue[queueCount].tag[sizeof(scanQueue[queueCount].tag)-1] = '\0';
  scanQueue[queueCount].ms = millis();
  queueCount++;
  if (VERBOSE) Serial.println(F("[QUEUE] Stored"));
}
void flushQueue() {
  if (WiFi.status() != WL_CONNECTED || queueCount == 0) return;
  for (uint8_t i=0;i<queueCount;i++) {
    WiFiClient client; HTTPClient http;
    char url[128]; snprintf(url, sizeof(url), "http://%s:%u%s", SERVER_HOST, SERVER_PORT, ENDPOINT);
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

// ---- Helpers ----
void lcdMsg(const char *l1, const char *l2 = nullptr) {
  lcd.clear();
  char line1[17]; char line2[17];
  if (l1) { strncpy(line1, l1, 16); line1[16]='\0'; } else line1[0]='\0';
  if (l2) { strncpy(line2, l2, 16); line2[16]='\0'; } else line2[0]='\0';
  lcd.setCursor(0,0); lcd.print(line1);
  lcd.setCursor(0,1); lcd.print(line2);
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  lcdMsg("WiFi:", WIFI_SSID);
  Serial.print(F("Connecting to ")); Serial.println(WIFI_SSID);
  uint8_t dots=0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
    if (dots++ % 6 == 0) lcdMsg("WiFi retry", WIFI_SSID);
  }
  Serial.println();
  Serial.println(F("WiFi OK"));
  char ip[24]; snprintf(ip, sizeof(ip), "%s", WiFi.localIP().toString().c_str());
  lcdMsg("WiFi OK", ip);
  delay(700);
}

bool readTagHex(char *out, size_t outSize) {
  if (!rfid.PICC_IsNewCardPresent()) return false;
  if (!rfid.PICC_ReadCardSerial()) return false;
  size_t idx=0;
  for (byte i=0; i<rfid.uid.size && (idx+2) < outSize; i++) {
    byte v = rfid.uid.uidByte[i];
    if (v < 0x10 && idx < outSize-1) out[idx++]='0';
    const char *hex = "0123456789ABCDEF";
    if (idx < outSize-1) out[idx++] = hex[v >> 4];
    if (idx < outSize-1) out[idx++] = hex[v & 0x0F];
  }
  out[idx]='\0';
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  return true;
}

bool postRFID(const char *tag) {
  if (WiFi.status() != WL_CONNECTED) return false;
  WiFiClient client; HTTPClient http;
  char url[128]; snprintf(url, sizeof(url), "http://%s:%u%s", SERVER_HOST, SERVER_PORT, ENDPOINT);
  if(!http.begin(client, url)) return false;
  http.addHeader("Content-Type", "application/json");
  if (strlen(DEVICE_KEY) > 0) http.addHeader("X-DEVICE-KEY", DEVICE_KEY);
  char body[160];
  snprintf(body, sizeof(body), "{\"rfidTag\":\"%s\",\"deviceId\":\"%s\",\"location\":\"%s\"}", tag, DEVICE_ID, LOCATION);
  int code = http.POST(body);
  if (VERBOSE) Serial.printf("POST %s -> %d\n", url, code);
  bool ok=false;
  if (code > 0) {
    String resp = http.getString();
    if (VERBOSE) Serial.println(resp);
    ok = (code == 201 || resp.indexOf("\"success\":true") != -1);
  }
  http.end();
  return ok;
}

void setup() {
  Serial.begin(115200);
  delay(150);
  lcd.init();
  lcd.backlight();
  lcdMsg("RFID LCD", "Boot...");
  connectWiFi();
  SPI.begin();
  rfid.PCD_Init();
  lcdMsg("Ready","Scan card");
  Serial.println(F("RFID Ready"));
}

void loop() {
  if (millis() - lastWifiCheck > WIFI_RETRY_MS) {
    lastWifiCheck = millis();
    if (WiFi.status() != WL_CONNECTED) {
      lcdMsg("WiFi lost","Reconnect");
      connectWiFi();
    }
#if ENABLE_QUEUE
    flushQueue();
#endif
  }

  char tag[21];
  if (readTagHex(tag, sizeof(tag))) {
    unsigned long now = millis();
    if (now - lastScanMs < SCAN_DEBOUNCE_MS) return;
    lastScanMs = now;
    Serial.print(F("Tag: ")); Serial.println(tag);
    lcdMsg("Sending...", tag);
    bool ok = postRFID(tag);
    if (!ok) {
#if ENABLE_QUEUE
      enqueueScan(tag);
#endif
    }
    lcdMsg(ok ? "Scan OK" : "Scan FAIL", tag);
    delay(1100);
    lcdMsg("Ready","Scan card");
  }
}
