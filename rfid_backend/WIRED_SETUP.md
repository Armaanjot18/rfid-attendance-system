# 🔌 USB WIRED RFID SYSTEM - QUICK START

## What You Need
- Arduino Uno
- MFRC522 RFID Reader
- USB Cable
- RFID Cards

## Wiring (MFRC522 → Arduino)
```
SDA  → Pin 10
SCK  → Pin 13
MOSI → Pin 11
MISO → Pin 12
RST  → Pin 9
3.3V → 3.3V
GND  → GND
```

## Setup Steps

### 1. Upload Arduino Code
1. Open `arduino_rfid_code.ino` in Arduino IDE
2. Select: Tools → Board → Arduino Uno
3. Select: Tools → Port → Your COM port
4. Click Upload (→)

### 2. Find Your COM Port
- In Arduino IDE: Tools → Port (example: COM3)
- Update `serial-bridge.js` line 7 with your port

### 3. Start System
**Easy way:** Double-click `start-rfid-system.bat`

**Manual way:** Open 2 terminals:
```powershell
# Terminal 1
cd c:\Users\armaa\my\visual1\rfid_backend
node server.js

# Terminal 2  
cd c:\Users\armaa\my\visual1\rfid_backend
node serial-bridge.js
```

### 4. Test It!
- Scan RFID card
- Watch Serial Bridge terminal for confirmation
- Check `students.xlsx` for attendance update
- View on teacher portal

## Current RFID Tags
| Student | ID | RFID Tag |
|---------|-----|----------|
| Armaanjot Singh | STU-8814 | ECEAFB03 |
| Prabhdeep Singh | STU-7743 | E5F6G7H8 |
| Rajveer Singh | STU-7655 | I9J0K1L2 |

## Adding New Cards
1. Scan unknown card
2. Note UID from terminal
3. Add to `students.xlsx` → "RFID Tag" column
4. Save and scan again

## Troubleshooting
- **"Error opening serial port"** → Wrong COM port, update serial-bridge.js
- **"Cannot connect to server"** → Start backend server first
- **"RFID not found"** → Add UID to students.xlsx
- **Card not detected** → Check wiring, move card closer

## File Structure
```
rfid_backend/
├── server.js              ← Backend server
├── serial-bridge.js       ← USB reader (NEW!)
├── arduino_rfid_code.ino  ← Arduino firmware
├── start-rfid-system.bat  ← Start both servers
└── students.xlsx          ← Student data
```

## Advantages Over WiFi
✅ Simpler - No ESP8266 needed
✅ More reliable connection
✅ Easier debugging
✅ No WiFi configuration
✅ Works anywhere with USB

---
**Ready to go!** 🚀
