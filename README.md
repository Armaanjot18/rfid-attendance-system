# RFID-Based Attendance Management System

A comprehensive IoT-based attendance system using Arduino RFID readers, Node.js backend, and MySQL database for educational institutions.

## 🌟 Features

- **Automated Attendance**: Contactless RFID card scanning with instant database recording
- **Multi-Role Dashboards**: Separate interfaces for students, teachers, and administrators
- **Subject-Specific Tracking**: Individual attendance monitoring for each subject (Maths, PPS, Physics)
- **AI Risk Detection**: Intelligent algorithms flag students with attendance below 65%
- **Club Management**: Duty assignment system with progress tracking and updates
- **Leave Requests**: Digital leave application and approval workflow
- **Real-Time Analytics**: Live charts, statistics, and attendance trends
- **PDF Export**: One-click report generation for compliance and meetings
- **Dual Storage**: MySQL primary database with Excel backup for reliability

## 🔧 Technology Stack

### Hardware
- Arduino Uno / ESP8266
- MFRC522 RFID Reader
- RFID Cards/Tags
- Optional: LCD Display (16x2)

### Backend
- Node.js with Express.js
- MySQL 8.0 Database
- JWT Authentication
- SerialPort for Arduino communication
- ExcelJS for backup data

### Frontend
- Vanilla HTML5/CSS3/JavaScript
- Chart.js for data visualization
- Responsive design with CSS Grid
- Auto-refresh intervals for real-time updates

## 📁 Project Structure

```
visual1/
├── rfid_backend/
│   ├── arduino_rfid_code/        # Arduino firmware
│   │   ├── uno_usb/              # Arduino Uno USB version
│   │   └── esp8266_wifi/         # ESP8266 WiFi version
│   ├── config/
│   │   └── database.js           # MySQL connection pool
│   ├── database/
│   │   ├── schema.sql            # Database structure
│   │   └── seed.sql              # Sample data
│   ├── routes/
│   │   ├── auth.js               # Authentication
│   │   ├── students.js           # Student endpoints
│   │   ├── attendance.js         # Attendance recording
│   │   └── clubs.js              # Club duties management
│   ├── scripts/
│   │   └── initDatabase.js       # DB initialization
│   ├── utils/
│   │   └── excelHandler.js       # Excel backup handler
│   ├── serial-bridge.js          # Arduino communication
│   └── server.js                 # Main server
├── student-portal.html           # Student dashboard
├── pps-teacher-dashboard.html    # PPS teacher interface
├── maths-teacher-dashboard.html  # Maths teacher interface
├── club-portal.html              # Club management portal
└── index.html                    # Landing page
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server 8.0+
- Arduino IDE (for hardware setup)
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/rfid-attendance-system.git
cd rfid-attendance-system
```

2. **Install dependencies**
```bash
cd rfid_backend
npm install
```

3. **Configure database**
Create `.env` file in `rfid_backend/`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=access_control_portal
DB_PORT=3306
JWT_SECRET=your_secret_key_here
PORT=3000
```

4. **Initialize database**
```bash
npm run initdb
```

5. **Start the server**
```bash
npm start
```

### Arduino Setup

1. **Install required libraries** in Arduino IDE:
   - MFRC522 by GithubCommunity
   - SPI (built-in)

2. **Upload firmware**:
   - For Arduino Uno: `rfid_backend/arduino_rfid_code/uno_usb/arduino_rfid_usb/arduino_rfid_usb.ino`
   - For ESP8266: `rfid_backend/arduino_rfid_code/esp8266_wifi/esp8266_rfid_wifi/esp8266_rfid_wifi.ino`

3. **Wire connections**:
```
MFRC522 → Arduino Uno
SDA    → Pin 10
SCK    → Pin 13
MOSI   → Pin 11
MISO   → Pin 12
IRQ    → Not connected
GND    → GND
RST    → Pin 9
3.3V   → 3.3V
```

4. **Configure COM port** in `serial-bridge.js` (default: COM7)

## 📖 Usage

### Default Credentials

**Admin Users:**
- Username: `admin` / Password: `admin123`
- Username: `club-admin` / Password: `club123`

**Teachers:**
- PPS Teacher: Check `seed.sql` for credentials
- Maths Teacher: Check `seed.sql` for credentials

**Students:**
- Students can login using their roll numbers

### RFID Card Mapping

Add your RFID card UIDs in `arduino_rfid_code/uno_usb/arduino_rfid_usb.ino`:

```cpp
String mapCardToStudent(String uid) {
  if (uid == "CC971405") return "RFID001"; // Armaanjot Singh
  if (uid == "C3BF2809") return "RFID002"; // Prabhdeep Singh
  // Add your cards here
  return uid;
}
```

### Accessing Dashboards

1. **Student Portal**: `http://localhost:3000/student-portal.html`
   - View attendance statistics
   - Check club duties
   - Submit leave requests

2. **Teacher Dashboard**: `http://localhost:3000/pps-teacher-dashboard.html`
   - Monitor student attendance
   - Approve leave requests
   - Export PDF reports
   - View at-risk students

3. **Club Portal**: `http://localhost:3000/club-portal.html`
   - Assign duties to members
   - Track progress updates
   - Manage club activities

## 🔍 Key Features Explained

### AI Risk Detection
Automatically flags students as "at-risk" based on:
- Attendance below 65% (critical risk)
- Attendance drop >10% from previous period
- Risk score calculation and prioritization

### Subject-Specific Tracking
Each subject maintains separate statistics:
- Total classes conducted
- Classes attended
- Attendance percentage
- Historical trends

### Club Duties System
- Duty assignment with priorities (low/medium/high)
- Status tracking (pending/in-progress/completed)
- Progress updates from students
- Real-time notifications

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - New user registration

### Students
- `GET /api/students` - Get all students with attendance
- `GET /api/students/:id` - Get specific student
- `POST /api/students` - Add new student

### Attendance
- `POST /api/attendance` - Record attendance (manual/RFID)
- `GET /api/attendance/:studentId` - Get student attendance history

### Clubs
- `GET /api/clubs/student/:studentId/duties` - Get assigned duties
- `POST /api/clubs/duties/:dutyId/updates` - Submit duty update

## 📊 Database Schema

Main tables:
- `users` - Authentication and user profiles
- `students` - Student information
- `teachers` - Teacher information
- `attendance` - Attendance records
- `subjects` - Subject master data
- `clubs` - Club information
- `club_duties` - Duty assignments
- `leave_requests` - Leave applications

## 🐛 Troubleshooting

### Common Issues

1. **Server won't start**: Check if MySQL is running and credentials in `.env` are correct
2. **RFID not working**: Verify COM port in `serial-bridge.js` and Arduino connection
3. **Database errors**: Run `npm run initdb` to reinitialize
4. **Excel backup errors**: Ensure `data/` folder has write permissions

### Debug Mode

Enable detailed logging:
```bash
NODE_ENV=development npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- MFRC522 Library by GithubCommunity
- Chart.js for beautiful visualizations
- Express.js framework
- MySQL team for robust database

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Email: your.email@example.com

## 🔮 Future Enhancements

- [ ] Mobile app for students and teachers
- [ ] Biometric authentication integration
- [ ] SMS/Email notifications
- [ ] Parent portal access
- [ ] Advanced analytics and ML predictions
- [ ] Multi-language support
- [ ] Cloud deployment guide

---

**Made with ❤️ for educational institutions**
