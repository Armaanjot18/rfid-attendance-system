const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock database (in production, use a real database)
const users = [
    {
        id: 1,
        username: 'student-user',
        password: 'password', // Plain text for development
        role: 'student',
        name: 'John Doe',
        studentId: 'STU-001'
    },
    {
        id: 6,
        username: 'armaanjo',
        password: 'armaan123',
        role: 'student',
        name: 'Armaanjot Singh',
        studentId: 'STU-8814'
    },
    {
        id: 7,
        username: 'prabhdeep',
        password: 'prabh123',
        role: 'student',
        name: 'Prabhdeep Singh',
        studentId: 'STU-7743'
    },
    {
        id: 8,
        username: 'rajveer',
        password: 'rajveer123',
        role: 'student',
        name: 'Rajveer Singh',
        studentId: 'STU-7655'
    },
    {
        id: 2,
        username: 'science-user',
        password: 'password', // Plain text for development
        role: 'teacher',
        name: 'Prof. Smith',
        teacherId: 'TCH-001',
        department: 'Applied Science',
        subject: 'Science'
    },
    {
        id: 3,
        username: 'pps-teacher',
        password: 'pps123', // Plain text for development
        role: 'teacher',
        name: 'Prof. Johnson',
        teacherId: 'TCH-002',
        department: 'Computer Science',
        subject: 'PPS'
    },
    {
        id: 4,
        username: 'maths-teacher',
        password: 'maths123', // Plain text for development
        role: 'teacher',
        name: 'Prof. Williams',
        teacherId: 'TCH-003',
        department: 'Mathematics',
        subject: 'Mathematics'
    },
    {
        id: 5,
        username: 'physics-teacher',
        password: 'physics123', // Plain text for development
        role: 'teacher',
        name: 'Prof. Anderson',
        teacherId: 'TCH-004',
        department: 'Physics',
        subject: 'Physics'
    }
];

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, password, and role'
            });
        }

        // Find user
        const user = users.find(u => u.username === username && u.role === role);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password (simplified for development)
        // Check if password is plain text or hashed
        let isPasswordValid = false;
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            // Password is hashed, use bcrypt
            isPasswordValid = await bcrypt.compare(password, user.password);
        } else {
            // Password is plain text (development only)
            isPasswordValid = password === user.password;
        }
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error - JWT_SECRET not set'
            });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user data (excluding password)
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Register endpoint (for adding new users)
router.post('/register', async (req, res) => {
    try {
        const { username, password, role, name } = req.body;

        if (!username || !password || !role || !name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const existingUser = users.find(u => u.username === username);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            id: users.length + 1,
            username,
            password: hashedPassword,
            role,
            name,
            ...(role === 'student' ? { studentId: `STU-${String(users.length + 1).padStart(3, '0')}` } : {}),
            ...(role === 'teacher' ? { teacherId: `TCH-${String(users.length + 1).padStart(3, '0')}` } : {})
        };

        users.push(newUser);

        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        res.json({
            success: true,
            message: 'Token is valid',
            user: decoded
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
});

module.exports = router;
