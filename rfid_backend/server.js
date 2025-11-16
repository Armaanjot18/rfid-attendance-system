const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import database (will test connection on import)
const db = require('./config/database');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit for file uploads
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Import routes (switch auth to MySQL-backed implementation)
const authRoutes = require('./routes/auth-mysql');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const clubRoutes = require('./routes/clubs');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/clubs', clubRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Access Control Portal API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            students: '/api/students',
            attendance: '/api/attendance'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    
    // Test database connection
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
        console.warn('⚠️  Server running but database not connected');
    }
});

module.exports = app;
