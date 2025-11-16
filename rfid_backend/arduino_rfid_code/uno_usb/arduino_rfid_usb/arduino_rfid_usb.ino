#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// RFID Module pins
#define SS_PIN 10
#define RST_PIN 9

// LCD I2C address (0x27 is common, adjust if needed)
LiquidCrystal_I2C lcd(0x27, 16, 2);

MFRC522 rfid(SS_PIN, RST_PIN);

const String DEVICE_ID = "ARDUINO_MAIN_GATE";
const String LOCATION = "Main Gate";

// Map physical card UIDs to student RFID tags
String mapCardToStudent(String cardUID) {
  if (cardUID == "CC971405") return "Armaanjot Singh";
  if (cardUID == "C3BF2809") return "Prabhdeep Singh";
  if (cardUID == "8A5C4B12") return "Rajveer Singh";
  return "Unknown Card";
}

String mapCardToRFIDTag(String cardUID) {
  if (cardUID == "CC971405") return "RFID001";
  if (cardUID == "C3BF2809") return "RFID002";
  if (cardUID == "8A5C4B12") return "RFID003";
  return cardUID;
}

void displayWelcome() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("RFID Attendance");
  lcd.setCursor(0, 1);
  lcd.print("System Ready!");
  delay(2000);
}

void displayScan() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Scan Card...");
  lcd.setCursor(0, 1);
  lcd.print("Main Gate");
}

void displayCardData(String studentName, String cardUID) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Welcome!");
  lcd.setCursor(0, 1);
  
  // Display student name (truncate if too long)
  if (studentName.length() > 16) {
    lcd.print(studentName.substring(0, 16));
  } else {
    lcd.print(studentName);
  }
  
  delay(3000);
  
  // Show card UID
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Card UID:");
  lcd.setCursor(0, 1);
  lcd.print(cardUID);
  
  delay(2000);
}

void setup() {
  Serial.begin(9600);
  SPI.begin();
  rfid.PCD_Init();
  
  // Initialize I2C LCD (16 columns, 2 rows)
  lcd.init();
  lcd.backlight();
  
  // Display welcome message
  displayWelcome();
  
  Serial.println("=================================");
  Serial.println("  RFID Attendance System v2.0");
  Serial.println("  USB Serial Mode + I2C LCD");
  Serial.println("=================================");
  Serial.println("\nSystem Ready!");
  Serial.println("Waiting for RFID cards...");
  Serial.println("---------------------------------");
  
  displayScan();
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;
  
  // Read card UID
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  
  // Map physical card UID to student name and RFID tag
  String studentName = mapCardToStudent(uid);
  String studentTag = mapCardToRFIDTag(uid);
  
  // Display on LCD
  displayCardData(studentName, uid);
  
  // Send JSON data via Serial
  Serial.print("{\"studentName\":\"");
  Serial.print(studentName);
  Serial.print("\",\"rfidTag\":\"");
  Serial.print(studentTag);
  Serial.print("\",\"cardUID\":\"");
  Serial.print(uid);
  Serial.print("\",\"deviceId\":\"");
  Serial.print(DEVICE_ID);
  Serial.print("\",\"location\":\"");
  Serial.print(LOCATION);
  Serial.print("\",\"timestamp\":\"");
  Serial.print(millis());
  Serial.println("\"}");
  
  // Sound beep - buzz pin 8
  pinMode(8, OUTPUT);
  digitalWrite(8, HIGH);
  delay(100);
  digitalWrite(8, LOW);
  
  // Display success
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Attendance OK!");
  lcd.setCursor(0, 1);
  lcd.print("Access Granted");
  delay(2000);
  
  // Reset LCD to scanning state
  displayScan();
  
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  delay(2000);
}