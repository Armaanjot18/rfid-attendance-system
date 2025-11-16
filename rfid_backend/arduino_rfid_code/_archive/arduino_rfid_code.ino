// Arduino Uno + MFRC522 RFID (USB Serial Communication)
// Wired connection - No WiFi needed!

#include <SPI.h>
#include <MFRC522.h>

// RFID Module pins
#define SS_PIN 10
#define RST_PIN 9

MFRC522 rfid(SS_PIN, RST_PIN);

const String DEVICE_ID = "ARDUINO_MAIN_GATE";
const String LOCATION = "Main Gate";

void setup() {
  Serial.begin(9600);
  SPI.begin();
  rfid.PCD_Init();
  
  Serial.println("=================================");
  Serial.println("  RFID Attendance System v2.0");
  Serial.println("  USB Serial Mode (Wired)");
  Serial.println("=================================");
  Serial.println("\nSystem Ready!");
  Serial.println("Waiting for RFID cards...");
  Serial.println("---------------------------------");
}

void loop() {
  // Check for new card
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }
  
  // Read card
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }
  
  // Get UID
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  
  // Send data over serial as JSON
  Serial.print("{\"rfidTag\":\"");
  Serial.print(uid);
  Serial.print("\",\"deviceId\":\"");
  Serial.print(DEVICE_ID);
  Serial.print("\",\"location\":\"");
  Serial.print(LOCATION);
  Serial.println("\"}");
  
  // Beep (if buzzer connected to pin 8)
  pinMode(8, OUTPUT);
  digitalWrite(8, HIGH);
  delay(100);
  digitalWrite(8, LOW);
  
  // Stop reading
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  
  delay(2000); // Prevent multiple scans
}
