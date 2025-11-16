# Arduino Uno RFID Attendance Setup Guide
## ⚡ USB Wired Connection (No WiFi Required!)

## Hardware Required

1. **Arduino Uno** (or compatible board)
2. **MFRC522 RFID Reader Module**
3. **USB Cable** (Type A to Type B - usually comes with Arduino)
4. **RFID Cards/Tags** (13.56MHz Mifare)
5. **Jumper Wires**
6. **Breadboard** (optional but recommended)
7. **Buzzer** (optional - for audio feedback)

**✅ Much simpler than WiFi - no ESP8266 needed!**

## Wiring Diagram

### MFRC522 RFID Module → Arduino Uno
```
MFRC522 Pin  →  Arduino Pin
--------------------------------
SDA (SS)     →  Digital 10
SCK          →  Digital 13
MOSI         →  Digital 11
MISO         →  Digital 12
IRQ          →  Not connected
GND          →  GND
RST          →  Digital 9
3.3V         →  3.3V
```

### Optional: Buzzer
```
Buzzer (+)   →  Digital 8
Buzzer (-)   →  GND
```

### USB Connection
```
Arduino USB  →  PC USB Port (COM3, COM4, etc.)
```

## Power Supply Notes
- Arduino powered via USB (no external power needed)
- USB provides 5V to Arduino
- Arduino provides 3.3V to MFRC522
- Simple and reliable!

## Software Setup

### Step 1: Install Arduino IDE
1. Download from: https://www.arduino.cc/en/software
2. Install for Windows

### Step 2: Install Required Libraries
Open Arduino IDE → Tools → Manage Libraries, then install:
1. **MFRC522** by GithubCommunity
2. **SoftwareSerial** (usually pre-installed)

### Step 3: Upload to Arduino
**No configuration needed! Code is ready to use.**
1. Connect Arduino Uno to PC via USB
2. In Arduino IDE:
   - Tools → Board → Arduino Uno
   - Tools → Port → Select your COM port (COM3, COM4, etc.)
3. Click Upload button (→)
4. Wait for "Done uploading" message

### Step 4: Install Serial Bridge Dependencies
1. Open Command Prompt or PowerShell
2. Navigate to rfid_backend folder:
   ```
   cd c:\Users\armaa\my\visual1\rfid_backend
   ```
3. Install required packages:
   ```
   npm install serialport @serialport/parser-readline axios
   ```

### Step 5: Find Your Arduino COM Port
1. In Arduino IDE: Tools → Port
2. Note the COM port (example: COM3, COM4, COM5)
3. Open `serial-bridge.js` and update line 7:
   ```javascript
   const ARDUINO_PORT = 'COM3'; // Change to your COM port
   ```

### Step 6: Start Everything
**You need 2 terminal windows:**

**Terminal 1 - Backend Server:**
```powershell
cd c:\Users\armaa\my\visual1\rfid_backend
node server.js
```

**Terminal 2 - Serial Bridge:**
```powershell
cd c:\Users\armaa\my\visual1\rfid_backend
node serial-bridge.js
```

You should see:
```
=================================
  Arduino RFID Serial Bridge
=================================

✅ Connected to Arduino on COM3
📡 Listening for RFID scans...
```

## Testing

### Test 1: Scan a Card
1. Make sure both servers are running (backend + serial bridge)
2. Place RFID card near reader
3. Serial Bridge terminal should show:
   ```
   🔍 RFID Detected!
      Tag: ECEAFB03
      Device: ARDUINO_MAIN_GATE
      Location: Main Gate
   ✅ Attendance Marked!
      Student: Armaanjot Singh
      Time: 10:30:25 AM
   ```

### Test 2: Verify in Excel
1. Open `students.xlsx`
2. Check "Attended Classes" column increased
3. Check "Last Access" shows current time

### Test 3: Check Teacher Portal
1. Open browser: `teacher-data-access.html`
2. Login with teacher credentials
3. See real-time attendance updates

## Current RFID Tags in System

| Student Name | Student ID | RFID Tag |
|-------------|-----------|----------|
| Armaanjot Singh | STU-8814 | ECEAFB03 |
| Prabhdeep Singh | STU-7743 | E5F6G7H8 |
| Rajveer Singh | STU-7655 | I9J0K1L2 |

## Troubleshooting

### Serial Bridge Can't Connect
- Check COM port in Device Manager (Windows Key + X → Device Manager → Ports)
- Close Arduino IDE Serial Monitor (can't use same port twice)
- Update `ARDUINO_PORT` in serial-bridge.js
- Run: `node serial-bridge.js` to see available ports

### RFID Not Detecting Cards
- Check all MFRC522 wiring connections
- Verify MFRC522 has 3.3V power
- Try different cards (must be 13.56MHz Mifare)
- Card should be within 3-5cm of reader

### Server Connection Failed
- Verify backend server is running in Terminal 1
- Check serial bridge is running in Terminal 2
- Visit `http://localhost:3000` in browser to verify server

### USB Connection Issues
- Try different USB cable
- Restart Arduino (unplug and plug back in)
- Check USB drivers installed (usually automatic)
- Try different USB port on PC

### Wrong Student or "RFID not found"
1. Scan the card and note the UID from Serial Monitor
2. Open `students.xlsx`
3. Add/update the UID in "RFID Tag" column for correct student
4. Save Excel file
5. Try scanning again

## Adding New Students/Cards

1. Scan the new card (watch Serial Bridge terminal)
2. Note the UID from output (example: `A1B2C3D4`)
3. Open `students.xlsx`
4. Find the student's row
5. Enter the UID in "RFID Tag" column
6. Save file
7. Scan again to test - student name should appear!

## System Flow

```
[RFID Card] → [MFRC522 Reader] → [Arduino Uno] → [USB Cable]
                                                        ↓
                                              [Serial Bridge (Node.js)]
                                                        ↓
                                              [Backend Server:3000]
                                                        ↓
                                                  [students.xlsx]
                                                        ↓
                                         [Teacher Portal / Student Portal]
```

**Advantages of Wired Connection:**
✅ No WiFi setup required
✅ More reliable connection
✅ Simpler hardware (no ESP8266)
✅ Easier to debug
✅ Lower cost
✅ No network configuration

## Features

✅ Real-time attendance marking
✅ WiFi connectivity
✅ Automatic Excel update
✅ Student name verification
✅ Audio feedback (if buzzer connected)
✅ Serial Monitor logs for debugging
✅ Connection retry on failures

## Next Steps

1. Wire all components according to diagram
2. Upload code to Arduino
3. Test with known RFID cards (ECEAFB03, E5F6G7H8, I9J0K1L2)
4. Add more student RFID tags to Excel
5. Mount at main gate or entrance
6. Monitor attendance on teacher portal

## Support

If you encounter issues:
1. Check Serial Monitor for error messages
2. Verify all wiring connections
3. Ensure backend server is running
4. Check students.xlsx has correct RFID tags
5. Test internet connectivity

---
**Created:** November 2025
**Version:** 1.0
**Compatible with:** Arduino Uno, Mega, Nano (with pin adjustments)
