# Database Setup Instructions

## MySQL Installation

### Windows:
1. Download MySQL from https://dev.mysql.com/downloads/installer/
2. Install MySQL Server
3. Set root password during installation
4. Start MySQL service

### Verify Installation:
```powershell
mysql --version
```

## Database Setup Steps

### 1. Create Database and Tables
```powershell
# Login to MySQL
mysql -u root -p

# Run the schema file
source C:/Users/armaa/my/visual1/rfid_backend/database/schema.sql

# Run the seed data
source C:/Users/armaa/my/visual1/rfid_backend/database/seed.sql
```

OR using command line directly:
```powershell
mysql -u root -p < C:\Users\armaa\my\visual1\rfid_backend\database\schema.sql
mysql -u root -p < C:\Users\armaa\my\visual1\rfid_backend\database\seed.sql
```

### 2. Install MySQL Driver for Node.js
```powershell
cd C:\Users\armaa\my\visual1\rfid_backend
npm install mysql2
```

### 3. Configure Environment Variables

Create or update `.env` file in `rfid_backend/` folder:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=access_control_portal

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# RFID Configuration
SERIAL_PORT=COM3
BAUD_RATE=9600
```

### 4. Update server.js to use MySQL

Replace the auth routes import in `server.js`:
```javascript
// Old:
const authRoutes = require('./routes/auth');

// New:
const authRoutes = require('./routes/auth-mysql');
```

### 5. Test Database Connection

Create a test file or update server.js to include:
```javascript
const db = require('./config/database');

// Test connection on startup
db.testConnection().then(connected => {
    if (connected) {
        console.log('✅ Database ready');
    } else {
        console.error('❌ Database connection failed');
    }
});
```

### 6. Start the Server
```powershell
cd C:\Users\armaa\my\visual1\rfid_backend
npm start
```

## Database Structure

### Main Tables:
- **users**: All system users (students, teachers, admins)
- **students**: Student-specific information
- **teachers**: Teacher-specific information
- **departments**: Department details
- **subjects**: Course subjects
- **attendance**: Daily attendance records
- **clubs**: Student clubs
- **club_members**: Club membership
- **leave_requests**: Student leave applications
- **rfid_logs**: RFID scan logs
- **sessions**: Class timetable
- **notifications**: User notifications
- **system_settings**: Application settings

## Sample Credentials (from seed data)

### Students:
- Username: `armaanjo` | Password: `armaan123`
- Username: `prabhdeep` | Password: `prabh123`
- Username: `rajveer` | Password: `rajveer123`

### Teachers:
- Username: `science-user` | Password: `password`
- Username: `maths-user` | Password: `password`
- Username: `it-teacher` | Password: `password`

## Common MySQL Commands

```sql
-- View all databases
SHOW DATABASES;

-- Use database
USE access_control_portal;

-- View all tables
SHOW TABLES;

-- View table structure
DESCRIBE users;

-- View data
SELECT * FROM users;
SELECT * FROM students;
SELECT * FROM attendance;

-- Count records
SELECT COUNT(*) FROM users;
SELECT role, COUNT(*) FROM users GROUP BY role;
```

## Troubleshooting

### Connection refused:
- Check if MySQL service is running
- Verify DB_HOST and DB_PORT in .env

### Authentication error:
- Reset MySQL root password
- Update DB_PASSWORD in .env

### Table doesn't exist:
- Run schema.sql file again
- Check database name in USE statement

### Port already in use:
- Change PORT in .env file
- Update frontend API_URL accordingly
