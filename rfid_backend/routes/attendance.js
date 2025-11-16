const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Mock attendance records
let attendanceRecords = [];

// Store leave requests separately
let leaveRequests = [];

// Record attendance
router.post('/record', (req, res) => {
    const { studentId, date, status, type, reason } = req.body;
    
    if (!studentId || !date || !status) {
        return res.status(400).json({
            success: false,
            message: 'Please provide studentId, date, and status'
        });
    }
    
    const record = {
        id: attendanceRecords.length + 1,
        studentId,
        date,
        status, // 'present', 'absent', 'leave'
        type: type || 'regular', // 'regular', 'manual', 'duty_leave', 'medical_leave'
        reason: reason || '',
        timestamp: new Date().toISOString()
    };
    
    attendanceRecords.push(record);
    
    res.status(201).json({
        success: true,
        message: 'Attendance recorded successfully',
        data: record
    });
});

// Get attendance by student ID
router.get('/student/:studentId', (req, res) => {
    const { startDate, endDate } = req.query;
    let records = attendanceRecords.filter(r => r.studentId === req.params.studentId);
    
    if (startDate) {
        records = records.filter(r => new Date(r.date) >= new Date(startDate));
    }
    
    if (endDate) {
        records = records.filter(r => new Date(r.date) <= new Date(endDate));
    }
    
    res.json({
        success: true,
        count: records.length,
        data: records
    });
});

// Get attendance by date
router.get('/date/:date', (req, res) => {
    const records = attendanceRecords.filter(r => r.date === req.params.date);
    
    res.json({
        success: true,
        count: records.length,
        data: records
    });
});

// Get all attendance records
router.get('/', (req, res) => {
    res.json({
        success: true,
        count: attendanceRecords.length,
        data: attendanceRecords
    });
});

// Submit leave request with document data
router.post('/leave', (req, res) => {
    const { studentId, studentName, startDate, endDate, reason, type, sentTo, documentData, documentName } = req.body;
    
    console.log('Received leave request:', { studentId, studentName, startDate, endDate, reason, type, sentTo });
    
    if (!studentId || !startDate || !endDate || !reason || !type) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields (studentId, startDate, endDate, reason, type)'
        });
    }
    
    const leaveRequest = {
        id: leaveRequests.length + 1,
        studentId,
        studentName: studentName || 'Unknown Student',
        startDate,
        endDate,
        reason,
        type, // 'medical', 'duty', 'personal'
        sentTo: sentTo || 'all', // Which teacher to send to
        status: 'pending', // 'pending', 'approved', 'rejected'
        documentData: documentData || null, // Base64 encoded document
        documentName: documentName || null,
        submittedAt: new Date().toISOString()
    };
    
    leaveRequests.push(leaveRequest);
    
    console.log('✓ Leave request created:', leaveRequest.id, 'for', studentName, 'sent to', sentTo);
    
    res.status(201).json({
        success: true,
        message: 'Leave request submitted successfully',
        data: leaveRequest
    });
});

// Get all leave requests (for teachers)
router.get('/leave-requests', (req, res) => {
    res.json({
        success: true,
        count: leaveRequests.length,
        data: leaveRequests
    });
});

// Get leave requests for a specific teacher (sent directly or to all) - MUST be before /:studentId route
router.get('/leave-requests/teacher/:username', (req, res) => {
    const { username } = req.params;
    const requests = leaveRequests.filter(r => r.sentTo === 'all' || r.sentTo === username);
    res.json({
        success: true,
        count: requests.length,
        data: requests
    });
});

// Get leave requests by student ID
router.get('/leave-requests/:studentId', (req, res) => {
    const requests = leaveRequests.filter(r => r.studentId === req.params.studentId);
    
    res.json({
        success: true,
        count: requests.length,
        data: requests
    });
});

// Update leave request status (approve/reject)
router.put('/leave-requests/:id', (req, res) => {
    const { status, remarks } = req.body;
    const requestId = parseInt(req.params.id);
    
    const leaveRequest = leaveRequests.find(r => r.id === requestId);
    
    if (!leaveRequest) {
        return res.status(404).json({
            success: false,
            message: 'Leave request not found'
        });
    }
    
    leaveRequest.status = status;
    leaveRequest.remarks = remarks || '';
    leaveRequest.updatedAt = new Date().toISOString();
    
    res.json({
        success: true,
        message: 'Leave request updated successfully',
        data: leaveRequest
    });
});

// Get statistics
router.get('/stats/:studentId', (req, res) => {
    const records = attendanceRecords.filter(r => r.studentId === req.params.studentId);
    
    const totalClasses = records.length;
    const presentCount = records.filter(r => r.status === 'present' || r.type.includes('leave')).length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const leaveCount = records.filter(r => r.type.includes('leave')).length;
    
    const attendancePercentage = totalClasses > 0 
        ? Math.round((presentCount / totalClasses) * 100) 
        : 0;
    
    res.json({
        success: true,
        data: {
            totalClasses,
            presentCount,
            absentCount,
            leaveCount,
            attendancePercentage
        }
    });
});

// RFID-based attendance (for ESP32/Arduino integration)
router.post('/rfid', async (req, res) => {
    const { rfidTag, deviceId, location } = req.body;
    // Optional device key security check
    const requiredKey = process.env.RFID_DEVICE_KEY;
    if (requiredKey && requiredKey.trim().length > 0) {
        const providedKey = req.header('X-DEVICE-KEY');
        if (!providedKey || providedKey !== requiredKey) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized device (invalid or missing X-DEVICE-KEY)'
            });
        }
    }
    
    if (!rfidTag) {
        return res.status(400).json({
            success: false,
            message: 'RFID tag is required'
        });
    }
    
    try {
        // Import database and excelHandler
        const db = require('../config/database');
        const excelHandler = require('../utils/excelHandler');
        
        // First, find student by RFID in MySQL database
        const result = await db.query(
            'SELECT s.id, s.student_id, s.rfid_tag, s.department, s.semester, u.name FROM students s JOIN users u ON s.user_id = u.id WHERE s.rfid_tag = ?',
            [rfidTag]
        );
        
        // Handle both array and object responses from mysql2
        const students = Array.isArray(result[0]) ? result[0] : [result[0]];
        console.log(`[RFID] Query result for ${rfidTag}:`, students.length, 'students found');
        
        let student = students && students.length > 0 && students[0].id ? students[0] : null;
        
        // If not found in MySQL, try Excel as fallback
        if (!student) {
            const excelStudents = excelHandler.readFromExcel();
            const excelStudent = excelStudents.find(s => s.rfidTag && s.rfidTag.toUpperCase() === rfidTag.toUpperCase());
            
            if (!excelStudent) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found for this RFID tag',
                    rfidTag: rfidTag
                });
            }
            
            // Use Excel data - need to look up actual database ID
            const [dbStudent] = await db.query(
                'SELECT s.id FROM students s WHERE s.student_id = ?',
                [excelStudent.id]
            );
            
            student = {
                id: dbStudent && dbStudent[0] ? dbStudent[0].id : null,
                student_id: excelStudent.id,
                name: excelStudent.name,
                department: excelStudent.department,
                rfid_tag: excelStudent.rfidTag
            };
            
            if (!student.id) {
                return res.status(404).json({
                    success: false,
                    message: 'Student exists in Excel but not in database',
                    rfidTag: rfidTag
                });
            }
        }
        
        // Store attendance in MySQL database (student.id is the integer primary key)
        const currentDate = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toTimeString().split(' ')[0];
        
        await db.query(
            'INSERT INTO attendance (student_id, subject_id, teacher_id, attendance_date, attendance_time, status, rfid_scan) VALUES (?, 7, NULL, ?, ?, ?, TRUE)',
            [student.id, currentDate, currentTime, 'present']
        );
        
        // Store RFID log in MySQL
        await db.query(
            'INSERT INTO rfid_logs (rfid_tag, student_id, location, device_id, scan_type) VALUES (?, ?, ?, ?, ?)',
            [rfidTag, student.id, location || 'Main Gate', deviceId || 'DEVICE-01', 'attendance']
        );
        
        // Also update Excel file for backward compatibility
        const excelStudents = excelHandler.readFromExcel();
        const excelStudent = excelStudents.find(s => s.id === student.student_id || s.rfidTag === rfidTag);
        
        if (excelStudent) {
            // Update subject-specific attendance (Maths)
            excelStudent.mathsAttended = (excelStudent.mathsAttended || 0) + 1;
            excelStudent.mathsTotal = (excelStudent.mathsTotal || 0) + 1;
            excelStudent.mathsPercentage = Math.round((excelStudent.mathsAttended / excelStudent.mathsTotal) * 100);
            
            // Update overall attendance
            excelStudent.attendedClasses = (excelStudent.attendedClasses || 0) + 1;
            excelStudent.totalClasses = (excelStudent.totalClasses || 0) + 1;
            excelStudent.attendance = Math.round((excelStudent.attendedClasses / excelStudent.totalClasses) * 100);
            
            excelStudent.access = location || 'Main Gate';
            
            const allStudents = excelStudents.map(s => 
                s.id === excelStudent.id ? excelStudent : s
            );
            excelHandler.writeToExcel(allStudents);
        }
        
        // Create in-memory record
        const record = {
            id: attendanceRecords.length + 1,
            studentId: student.student_id,
            studentName: student.name,
            rfidTag: rfidTag,
            date: currentDate,
            time: currentTime,
            status: 'present',
            type: 'rfid',
            deviceId: deviceId || 'unknown',
            location: location || 'unknown',
            timestamp: new Date().toISOString()
        };
        
        attendanceRecords.push(record);
        
        // Log to console
        console.log(`✓ RFID Attendance: ${student.name} (${student.student_id}) at ${location || 'unknown location'}`);
        console.log(`  Stored in MySQL database and Excel file`);
        
        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            data: {
                studentId: student.student_id,
                studentName: student.name,
                department: student.department,
                time: currentTime,
                location: location,
                deviceId: deviceId,
                rfidTag: rfidTag,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('RFID attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing RFID attendance',
            error: error.message
        });
    }
});

module.exports = router;
