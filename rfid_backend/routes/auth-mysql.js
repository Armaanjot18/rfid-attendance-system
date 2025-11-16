const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Login endpoint with MySQL
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username and password'
            });
        }

        // Find user with role from database
        const user = await db.queryOne(
            `SELECT u.*, 
                    s.student_id, s.department as student_dept, s.semester, s.rfid_tag,
                    t.teacher_id, t.department as teacher_dept, t.designation
             FROM users u
             LEFT JOIN students s ON u.id = s.user_id AND u.role = 'student'
             LEFT JOIN teachers t ON u.id = t.user_id AND u.role = 'teacher'
             WHERE u.username = ? AND u.is_active = TRUE`,
            [username]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        let isPasswordValid = false;
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            // Hashed password
            isPasswordValid = await bcrypt.compare(password, user.password);
        } else {
            // Plain text (for development - will hash on first login)
            isPasswordValid = password === user.password;
            
            // Hash the password for future logins
            if (isPasswordValid) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await db.query(
                    'UPDATE users SET password = ? WHERE id = ?',
                    [hashedPassword, user.id]
                );
            }
        }

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Prepare user response based on role
        const userResponse = {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role
        };

        if (user.role === 'student') {
            userResponse.studentId = user.student_id;
            userResponse.department = user.student_dept;
            userResponse.semester = user.semester;
            userResponse.rfidTag = user.rfid_tag;
        } else if (user.role === 'teacher') {
            userResponse.teacherId = user.teacher_id;
            userResponse.department = user.teacher_dept;
            userResponse.designation = user.designation;
        }

        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, password, role, name, email, phone, ...roleSpecificData } = req.body;

        if (!username || !password || !role || !name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const existingUser = await db.queryOne(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Use transaction for user and role-specific data
        const result = await db.transaction(async (connection) => {
            // Insert user
            const [userResult] = await connection.execute(
                'INSERT INTO users (username, password, role, name, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
                [username, hashedPassword, role, name, email, phone]
            );

            const userId = userResult.insertId;

            // Insert role-specific data
            if (role === 'student') {
                await connection.execute(
                    'INSERT INTO students (user_id, student_id, department, semester) VALUES (?, ?, ?, ?)',
                    [userId, roleSpecificData.student_id, roleSpecificData.department, roleSpecificData.semester]
                );
            } else if (role === 'teacher') {
                await connection.execute(
                    'INSERT INTO teachers (user_id, teacher_id, department, designation) VALUES (?, ?, ?, ?)',
                    [userId, roleSpecificData.teacher_id, roleSpecificData.department, roleSpecificData.designation]
                );
            }

            return userId;
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: result
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// Verify token middleware
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({
            success: false,
            message: 'No token provided'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        req.user = decoded;
        next();
    });
}

// Protected route example
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await db.queryOne(
            `SELECT u.*, 
                    s.student_id, s.department as student_dept, s.semester,
                    t.teacher_id, t.department as teacher_dept, t.designation
             FROM users u
             LEFT JOIN students s ON u.id = s.user_id
             LEFT JOIN teachers t ON u.id = t.user_id
             WHERE u.id = ?`,
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove password from response
        delete user.password;

        res.json({
            success: true,
            user: user
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
