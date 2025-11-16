# ESP32/Arduino Integration with Excel Attendance System

## Overview
Connect ESP32 or Arduino devices (with RFID/fingerprint/card readers) to automatically update attendance in the Excel sheet through the backend API.

## Architecture

```
ESP32/Arduino → WiFi → Backend API → Excel File (students.xlsx)
     ↓
  RFID Reader
```

## Hardware Requirements

### Option 1: ESP32 (Recommended)
- **ESP32 Dev Board** - Has built-in WiFi
- **MFRC522 RFID Reader Module**
- **RFID Cards/Tags**
- **Jumper Wires**
- **USB Cable** for programming

### Option 2: Arduino + WiFi Module
- **Arduino Uno/Mega**
- **ESP8266 WiFi Module** or **Arduino WiFi Shield**
- **MFRC522 RFID Reader**
- **RFID Cards/Tags**
- **Jumper Wires**

## Pin Connections

### ESP32 + MFRC522 RFID Module
```
MFRC522    →    ESP32
SDA (SS)   →    GPIO 5
SCK        →    GPIO 18
MOSI       →    GPIO 23
MISO       →    GPIO 19
IRQ        →    Not connected
GND        →    GND
RST        →    GPIO 22
3.3V       →    3.3V
```

### Arduino Uno + MFRC522
```
MFRC522    →    Arduino Uno
SDA (SS)   →    Pin 10
SCK        →    Pin 13
MOSI       →    Pin 11
MISO       →    Pin 12
IRQ        →    Not connected
GND        →    GND
RST        →    Pin 9
3.3V       →    3.3V
```

## Backend API Endpoints

### 1. Mark Attendance
```
POST /api/attendance/rfid
Headers: 
  Content-Type: application/json
  Authorization: Bearer YOUR_TOKEN (optional)
  
Body:
{
  "rfidTag": "A1B2C3D4",
  "deviceId": "ESP32_01",
  "location": "Main Gate"
}
```

### 2. Get Student by RFID
```
GET /api/students/rfid/:rfidTag
Returns student details for the scanned RFID tag
```

## ESP32 Arduino Code

### Install Required Libraries
1. Open Arduino IDE
2. Go to **Sketch → Include Library → Manage Libraries**
3. Install:
   - `MFRC522` by GithubCommunity
   - `WiFi` (built-in for ESP32)
   - `HTTPClient` (built-in for ESP32)
   - `ArduinoJson` by Benoit Blanchon

### Complete ESP32 Code

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend API URL
const char* serverUrl = "http://192.168.1.100:3000/api/attendance/rfid";

// RFID pins
#define SS_PIN 5
#define RST_PIN 22

// Device identification
const char* deviceId = "ESP32_GATE_01";
const char* location = "Main Gate";

MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();
  
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.println("Ready to scan RFID cards...");
}

void loop() {
  // Look for new cards
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }
  
  // Select one of the cards
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }
  
  // Read RFID tag UID
  String rfidTag = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    rfidTag += String(rfid.uid.uidByte[i], HEX);
  }
  rfidTag.toUpperCase();
  
  Serial.println("Card detected: " + rfidTag);
  
  // Send to backend
  sendAttendance(rfidTag);
  
  // Halt PICC
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  
  delay(2000); // Prevent multiple scans
}

void sendAttendance(String rfidTag) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["rfidTag"] = rfidTag;
    doc["deviceId"] = deviceId;
    doc["location"] = location;
    
    String requestBody;
    serializeJson(doc, requestBody);
    
    Serial.println("Sending: " + requestBody);
    
    int httpResponseCode = http.POST(requestBody);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
      
      // Parse response
      StaticJsonDocument<512> responseDoc;
      deserializeJson(responseDoc, response);
      
      if (responseDoc["success"]) {
        Serial.println("✓ Attendance marked successfully!");
        const char* studentName = responseDoc["data"]["studentName"];
        Serial.println("Student: " + String(studentName));
        
        // Optional: Add LED/Buzzer feedback here
        blinkLED(2); // Success indication
      } else {
        Serial.println("✗ Error: " + String(responseDoc["message"].as<const char*>()));
        blinkLED(5); // Error indication
      }
    } else {
      Serial.println("Error on HTTP request: " + String(httpResponseCode));
      blinkLED(5);
    }
    
    http.end();
  } else {
    Serial.println("WiFi disconnected!");
  }
}

void blinkLED(int times) {
  // Optional: Connect LED to GPIO 2 for visual feedback
  pinMode(2, OUTPUT);
  for (int i = 0; i < times; i++) {
    digitalWrite(2, HIGH);
    delay(100);
    digitalWrite(2, LOW);
    delay(100);
  }
}
```

## Arduino Uno + ESP8266 Code

```cpp
#include <SPI.h>
#include <MFRC522.h>
#include <SoftwareSerial.h>

// RFID pins
#define SS_PIN 10
#define RST_PIN 9

// ESP8266 pins
#define ESP_RX 2
#define ESP_TX 3

MFRC522 rfid(SS_PIN, RST_PIN);
SoftwareSerial esp8266(ESP_RX, ESP_TX);

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverIP = "192.168.1.100";
const int serverPort = 3000;

void setup() {
  Serial.begin(9600);
  esp8266.begin(115200);
  SPI.begin();
  rfid.PCD_Init();
  
  // Configure ESP8266
  sendCommand("AT+RST", 2000);
  sendCommand("AT+CWMODE=1", 1000);
  sendCommand("AT+CWJAP=\"" + String(ssid) + "\",\"" + String(password) + "\"", 5000);
  
  Serial.println("Ready to scan RFID cards...");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return;
  }
  
  String rfidTag = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    rfidTag += String(rfid.uid.uidByte[i], HEX);
  }
  rfidTag.toUpperCase();
  
  Serial.println("Card: " + rfidTag);
  sendAttendanceHTTP(rfidTag);
  
  rfid.PICC_HaltA();
  delay(2000);
}

void sendAttendanceHTTP(String rfidTag) {
  String postData = "{\"rfidTag\":\"" + rfidTag + "\",\"deviceId\":\"ARDUINO_01\",\"location\":\"Lab\"}";
  
  String cmd = "AT+CIPSTART=\"TCP\",\"" + String(serverIP) + "\"," + String(serverPort);
  sendCommand(cmd, 2000);
  
  String httpRequest = "POST /api/attendance/rfid HTTP/1.1\r\n";
  httpRequest += "Host: " + String(serverIP) + "\r\n";
  httpRequest += "Content-Type: application/json\r\n";
  httpRequest += "Content-Length: " + String(postData.length()) + "\r\n\r\n";
  httpRequest += postData;
  
  cmd = "AT+CIPSEND=" + String(httpRequest.length());
  sendCommand(cmd, 1000);
  esp8266.print(httpRequest);
  
  delay(2000);
  sendCommand("AT+CIPCLOSE", 1000);
}

void sendCommand(String cmd, int timeout) {
  esp8266.println(cmd);
  long int time = millis();
  while ((time + timeout) > millis()) {
    while (esp8266.available()) {
      Serial.write(esp8266.read());
    }
  }
}
```

## Setup Steps

### 1. Hardware Setup
1. Connect RFID module to ESP32/Arduino according to pin diagram
2. Power the ESP32 via USB or external power supply

### 2. Configure Code
1. Update WiFi credentials (`ssid` and `password`)
2. Update `serverUrl` with your computer's IP address
   - Find your IP: Open CMD → type `ipconfig` → look for IPv4 Address
   - Example: `http://192.168.1.100:3000/api/attendance/rfid`

### 3. Upload Code
1. Connect ESP32/Arduino to computer via USB
2. Select correct board in Arduino IDE: **Tools → Board → ESP32 Dev Module**
3. Select correct COM port: **Tools → Port → COM X**
4. Click **Upload** button

### 4. Configure Backend
Backend needs RFID endpoint - see next section

## Testing

### 1. Open Serial Monitor
- Arduino IDE → Tools → Serial Monitor
- Set baud rate to 115200 (ESP32) or 9600 (Arduino)

### 2. Scan RFID Card
- Place card near RFID reader
- Watch Serial Monitor for output
- Check Excel file for attendance update

### 3. Troubleshooting
- **WiFi not connecting**: Check SSID/password
- **HTTP error 404**: Check API endpoint URL
- **No card detected**: Check RFID wiring
- **Server unreachable**: Check firewall, use computer's local IP

## Next Steps
1. Map RFID tags to students in Excel
2. Add RFID column to students.xlsx
3. Update backend to handle RFID attendance
4. Deploy to production

## Security Notes
- Use HTTPS in production
- Add authentication token
- Encrypt RFID data
- Use secure WiFi network
