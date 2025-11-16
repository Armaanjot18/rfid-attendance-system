// ESP8266 (NodeMCU) + MFRC522 RFID WiFi Attendance
// Sends scans directly to backend REST endpoint /api/attendance/rfid
// Requirements:
//   - Board: NodeMCU 1.0 (ESP-12E Module)
//   - Libraries: MFRC522 (miguelbalboa), ArduinoJson (optional), ESP8266WiFi (builtin)
//   - Wiring: 3.3V ONLY for MFRC522. Use level shifting if needed.
//       SDA  -> D8 (GPIO15)
//       SCK  -> D5 (GPIO14)
//       MOSI -> D7 (GPIO13)
//       MISO -> D6 (GPIO12)
//       RST  -> D3 (GPIO0)
//       3.3V -> 3V3
//       GND  -> GND
//   - Optional buzzer on D2
// Configure WiFi and server details below.

#include <ESP8266WiFi.h>
#include <SPI.h>
#include <MFRC522.h>

// --- RFID Pins (adjust if needed) ---
#define SS_PIN 15  // D8
#define RST_PIN 0  // D3

MFRC522 rfid(SS_PIN, RST_PIN);

// --- WiFi Credentials ---
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// --- Server Config ---
const char* SERVER_HOST = "192.168.1.100"; // Change to your PC/server IP
const uint16_t SERVER_PORT = 3000;          // Match backend PORT
const char* ENDPOINT = "/api/attendance/rfid";
const char* DEVICE_ID = "ESP8266_GATE_1";
const char* LOCATION = "North Wing";
// Optional device key (set RFID_DEVICE_KEY in backend .env). Leave empty if not used.
const char* DEVICE_KEY = "CHANGE_ME_OPTIONAL";

// --- Timing ---
unsigned long lastScanMs = 0;
const unsigned long SCAN_DEBOUNCE_MS = 2500; // Prevent rapid duplicate submissions

WiFiClient client;

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    if (++retries > 40) {
      Serial.println("\nRestarting due to WiFi timeout.");
      ESP.restart();
    }
  }
  Serial.print("\nWiFi connected. IP: ");
  Serial.println(WiFi.localIP());
}

bool postRFID(const String& tagHex) {
  // Build JSON manually (avoid extra lib)
  String json = "{\"rfidTag\":\"" + tagHex + "\",\"deviceId\":\"" + DEVICE_ID + "\",\"location\":\"" + LOCATION + "\"}";

  if (!client.connect(SERVER_HOST, SERVER_PORT)) {
    Serial.println("[HTTP] Connection failed");
    return false;
  }

  // Construct HTTP request
  String request = String("POST ") + ENDPOINT + " HTTP/1.1\r\n";
  request += String("Host: ") + SERVER_HOST + "\r\n";
  request += "Content-Type: application/json\r\n";
  if (strlen(DEVICE_KEY) > 0) {
    request += String("X-DEVICE-KEY: ") + DEVICE_KEY + "\r\n";
  }
  request += String("Content-Length: ") + json.length() + "\r\n";
  request += "Connection: close\r\n\r\n";
  request += json;

  client.print(request);

  // Basic response read
  unsigned long start = millis();
  while (!client.available() && millis() - start < 4000) {
    delay(50);
  }
  while (client.available()) {
    String line = client.readStringUntil('\n');
    Serial.println(line);
  }
  client.stop();
  return true;
}

String readTagHex() {
  if (!rfid.PICC_IsNewCardPresent()) return "";
  if (!rfid.PICC_ReadCardSerial()) return "";
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  return uid;
}

void buzzOk() {
  pinMode(D2, OUTPUT);
  digitalWrite(D2, HIGH);
  delay(90);
  digitalWrite(D2, LOW);
}

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println();
  Serial.println("==============================");
  Serial.println(" ESP8266 RFID WiFi Attendance ");
  Serial.println("==============================");
  connectWiFi();
  SPI.begin();
  rfid.PCD_Init();
  Serial.println("RFID Ready. Scan a card...");
}

void loop() {
  String tag = readTagHex();
  if (tag.length() > 0) {
    unsigned long now = millis();
    if (now - lastScanMs < SCAN_DEBOUNCE_MS) {
      Serial.println("Scan ignored (debounce)." );
      return;
    }
    lastScanMs = now;
    Serial.print("Tag: "); Serial.println(tag);
    if (postRFID(tag)) {
      Serial.println("[OK] Sent to server.");
      buzzOk();
    } else {
      Serial.println("[ERR] Failed to send.");
    }
  }
}
