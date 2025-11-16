#include <SPI.h>
#include <MFRC522.h>
#include <LiquidCrystal_I2C.h> 

// --- Pin Definitions ---
#define SS_PIN 10
#define RST_PIN 9
#define RELAY_PIN 7         // Digital Pin connected to the Relay Input pin

// --- Hardware Initialization ---
MFRC522 mfrc522(SS_PIN, RST_PIN);  
// LCD Initialization: Address 0x27, 16 columns, 2 rows
LiquidCrystal_I2C lcd(0x27, 16, 2); 

// --- Configuration Data ---
// Structure to hold student data
struct Student {
  String uid;
  String name;
};

// Defined UIDs for Armaanjot Singh and Prabhdeep Singh
const int NUM_STUDENTS = 2;
Student students[NUM_STUDENTS] = {
  {"CC971405", "Armaanjot Singh"}, 
  {"C3BF2809", "Prabhdeep Singh"}  
};
// --------------------------

// Variables for reading the card
int readsuccess;
byte readcard[4];
char str[32] = "";
String StrUID;

// Timing variables for display and lock control
long lastScanTime = 0; 
const int displayDuration = 3000;   // Display welcome message for 3 seconds
const int lockOpenDuration = 1000;  // Keep the lock open for 1 second

// ====================================================================
// --- FUNCTION PROTOTYPES (Needed if functions are defined below loop) ---
int getid();
String lookupName(String uid);
void array_to_string(byte array[], unsigned int len, char buffer[]);
// ====================================================================

void setup() {
  Serial.begin(9600); 

  // Initialize Relay Pin (set as output and ensure door is locked initially)
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); 
  
  // Initialize RFID Reader and SPI
  SPI.begin();       
  mfrc522.PCD_Init(); 

  // Initialize the LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print(" Access Control");
  lcd.setCursor(0, 1);
  lcd.print(" Initializing...");
  delay(2000);
  
  // Setup Serial output for logging
  Serial.println("CLEARDATA");
  Serial.println("LABEL,Time Elapsed (s),Access Status,Student Name,RFID UID"); 
}

// ====================================================================
void loop() {
  
  // --- Timer Check: Lock and Display ---
  if (millis() - lastScanTime >= lockOpenDuration) {
    digitalWrite(RELAY_PIN, HIGH); // Lock the door 
  }

  if (millis() - lastScanTime >= displayDuration) {
    lcd.setCursor(0, 0);
    lcd.print("Scan Card to    ");
    lcd.setCursor(0, 1);
    lcd.print("attendence      ");
  }
  // -------------------------------------

  // Read the UID
  readsuccess = getid();
  
  if(readsuccess){
    lastScanTime = millis(); // Reset scan timer
    
    long elapsedSeconds = millis() / 1000; 
    String studentName = lookupName(StrUID);
    String status;

    // --- Access Control and LCD Display Logic ---
    lcd.clear();
    
    if (studentName.equals("UNKNOWN STUDENT")) {
        // --- DENIED ACCESS ---
        status = "DENIED";
        lcd.setCursor(0, 0);
        lcd.print("ACCESS DENIED!");
        lcd.setCursor(0, 1);
        lcd.print("Unknown Card");
        
        digitalWrite(RELAY_PIN, HIGH); 
    } else {
        // --- GRANTED ACCESS ---
        status = "GRANTED";
        
        digitalWrite(RELAY_PIN, LOW); // Unlock the door 

        lcd.setCursor(0, 0);
        lcd.print("Present");
        lcd.setCursor(0, 1);
        
        if (studentName.length() > 16) {
            lcd.print(studentName.substring(0, 16)); 
        } else {
            lcd.print(studentName);
        }
    }
    // ----------------------------------------------------

    // Log the transaction to Serial Monitor
    Serial.println( (String) "DATA," + elapsedSeconds + "," + status + "," + studentName + "," + StrUID );
    
    delay(200); 
  }
}

// ====================================================================
// --- Helper Functions Definitions ---

// Function to find the name based on the scanned UID
String lookupName(String uid) {
  for (int i = 0; i < NUM_STUDENTS; i++) {
    if (students[i].uid.equalsIgnoreCase(uid)) { 
      return students[i].name; 
    }
  }
  return "UNKNOWN STUDENT"; 
}

// Function to read the 4-byte UID and convert to a hex string
int getid(){  
  if(!mfrc522.PICC_IsNewCardPresent()){
    return 0;
  }
  if(!mfrc522.PICC_ReadCardSerial()){
    return 0;
  }
  
  for(int i=0; i<4; i++){
    readcard[i] = mfrc522.uid.uidByte[i];
  }
  
  array_to_string(readcard, 4, str);
  StrUID = String(str).substring(0, 8);
  
  mfrc522.PICC_HaltA(); 
  return 1;
}

// Function to convert a byte array to a hex string
void array_to_string(byte array[], unsigned int len, char buffer[])
{
  for (unsigned int i = 0; i < len; i++)
  {
      byte nib1 = (array[i] >> 4) & 0x0F;
      byte nib2 = (array[i] >> 0) & 0x0F;
      buffer[i*2+0] = nib1  < 0xA ? '0' + nib1  : 'A' + nib1  - 0xA;
      buffer[i*2+1] = nib2  < 0xA ? '0' + nib2  : 'A' + nib2  - 0xA;
  }
  buffer[len*2] = '\0';
}