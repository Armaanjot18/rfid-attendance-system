# RFID Backend

Backend server for the Access Control Portal System.

## Installation

1. Navigate to the backend directory:
```bash
cd rfid_backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
- Copy `.env` file and update the values as needed
- Change `JWT_SECRET` to a secure random string in production

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

### RFID System (Hardware Integration):
```bash
start-rfid-system.bat
```
This will start both the backend server and the serial bridge for Arduino/ESP32 RFID readers.

The server will start on `http://localhost:3000`

## Real-Time Data Flow

**Hardware → Backend → MySQL → Frontend**

1. **RFID Hardware** (Arduino/ESP32) scans RFID tag
2. **Serial Bridge** (`serial-bridge.js`) reads from USB port (COM7 by default)
3. **Backend API** receives data at `POST /api/attendance/rfid`
4. **MySQL Database** stores attendance record in real-time
5. **Frontend Dashboards** auto-refresh every 5 seconds to display updated data

### Testing RFID Integration

Simulate RFID scan without hardware:
```bash
curl -X POST http://localhost:3000/api/attendance/rfid -H "Content-Type: application/json" -d "{\"rfidTag\":\"RFID001\",\"deviceId\":\"DEVICE-01\",\"location\":\"Main Gate\"}"
```

This will mark attendance for the student with RFID001 tag.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/verify` - Verify JWT token

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `GET /api/students/department/:dept` - Get students by department
- `POST /api/students` - Add new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Attendance
- `POST /api/attendance/record` - Record attendance
- `GET /api/attendance/student/:studentId` - Get attendance by student
- `GET /api/attendance/date/:date` - Get attendance by date
- `GET /api/attendance` - Get all attendance records
- `POST /api/attendance/leave` - Submit leave request
- `GET /api/attendance/stats/:studentId` - Get attendance statistics
- `POST /api/attendance/rfid` - Submit RFID scan (wired serial bridge, ESP32, ESP8266)

## Default Credentials

### Student
- Username: `student-user`
- Password: `password`

### Teacher
- Username: `science-user`
- Password: `password`

## Tech Stack
- Node.js
- Express.js
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- CORS enabled for cross-origin requests

## Arduino Sketches Layout

Open and compile a single sketch folder at a time in the Arduino IDE. Do not open the parent `arduino_rfid_code` folder, or the IDE will try to compile multiple `.ino` files.

- `arduino_rfid_code/uno_usb/` → USB serial bridge version for Arduino Uno/Mega
- `arduino_rfid_code/esp8266_wifi/` → WiFi version for NodeMCU (ESP8266)

Archived example files have been moved to `arduino_rfid_code/_archive/` to avoid duplicate compilation.

## ESP8266 / WiFi RFID Integration

You can use an ESP8266 (NodeMCU) with an MFRC522 RFID module to send scans over WiFi directly to the backend.

### 1. Hardware Wiring (3.3V logic)
| MFRC522 | ESP8266 (NodeMCU) |
|---------|-------------------|
| SDA     | D8 (GPIO15)       |
| SCK     | D5 (GPIO14)       |
| MOSI    | D7 (GPIO13)       |
| MISO    | D6 (GPIO12)       |
| RST     | D3 (GPIO0)        |
| 3.3V    | 3V3               |
| GND     | GND               |

Do NOT use 5V on the MFRC522 with NodeMCU.

### 2. Required Arduino Libraries
- `MFRC522` (miguelbalboa) for RFID
- `ESP8266WiFi` (bundled with board package)
- (Optional) `ArduinoJson` if you prefer structured JSON building

### 3. Board Setup
Install ESP8266 board support via Arduino IDE Board Manager: add URL `http://arduino.esp8266.com/stable/package_esp8266com_index.json` in Preferences.

### 4. Sketch
File: `arduino_rfid_code/esp8266_rfid_wifi.ino`
Configure:
```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_HOST = "192.168.1.100"; // your backend host IP
const uint16_t SERVER_PORT = 3000;          // match PORT in .env
```

If you set `RFID_DEVICE_KEY` in `.env`, also set `DEVICE_KEY` in the sketch and the header `X-DEVICE-KEY` will be sent.

### 5. Backend Security (Optional)
Set `RFID_DEVICE_KEY` in `.env` to any secret string. The `/api/attendance/rfid` route will then require header:
```
X-DEVICE-KEY: <your-secret>
```

### 6. Testing a Scan
1. Start backend: `npm run dev`.
2. Flash the ESP8266 sketch.
3. Open Serial Monitor @ 115200 baud.
4. Scan a card; you should see HTTP response lines including status `201`.
5. Check attendance: `GET /api/attendance` or per student via `GET /api/attendance/student/:id`.

### 7. CORS / Network Notes
The backend already enables CORS. For WiFi devices on the same LAN, ensure the server host is the machine's LAN IP (e.g., `192.168.1.50`). If using a different subnet or mobile hotspot, adjust firewall rules to allow inbound port `3000`.

### 8. Fallback Serial Mode
The original `arduino_rfid_code.ino` still works via USB serial bridge if WiFi is not available.

### 9. Common Issues
- Tag reads repeat quickly: adjust `SCAN_DEBOUNCE_MS` in the sketch.
- 401 Unauthorized: missing or wrong `X-DEVICE-KEY`.
- Connection fails: confirm server IP and that PC firewall allows incoming on PORT.
- Random resets: ensure stable 3.3V supply; MFRC522 can draw current spikes.

### 10. Future Enhancements
- Switch to HTTPS with self-signed certificate
- WebSocket push for real-time dashboard updates
- OTA firmware update endpoint

---
