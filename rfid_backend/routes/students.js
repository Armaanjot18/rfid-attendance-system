const express = require('express');
const router = express.Router();
const excelHandler = require('../utils/excelHandler');
const db = require('../config/database');

// Get all students with real-time attendance from MySQL
router.get('/', async (req, res) => {
    try {
        // Fetch students with attendance statistics from database
        const sql = `
            SELECT 
                s.id as student_id,
                s.roll_number AS id,
                u.name,
                s.department,
                s.semester,
                s.rfid_tag,
                COUNT(a.id) as totalClasses,
                SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END) as attendedClasses
            FROM students s
            INNER JOIN users u ON s.user_id = u.id
            LEFT JOIN attendance a ON s.id = a.student_id
            GROUP BY s.id, s.roll_number, u.name, s.department, s.semester, s.rfid_tag
        `;
        
        const results = await db.query(sql);
        
        // Handle mysql2 returning either array or object
        const rows = Array.isArray(results[0]) ? results[0] : [results[0]];
        
        const students = rows.map(row => {
            const totalClasses = row.totalClasses || 0;
            const attendedClasses = row.attendedClasses || 0;
            const attendance = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;
            
            return {
                name: row.name,
                id: row.id,
                department: row.department,
                semester: row.semester,
                rfidTag: row.rfid_tag,
                totalClasses: totalClasses,
                attendedClasses: attendedClasses,
                attendance: attendance,
                prevAttendance: attendance, // For now, use same value
                access: 'N/A'
            };
        });
        
        res.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        console.error('Error fetching students from MySQL:', error);
        // Fallback to Excel if database fails
        const students = excelHandler.readFromExcel();
        res.json({
            success: true,
            count: students.length,
            data: students,
            fallback: true
        });
    }
});

// Get students by department (place before ID route to avoid route conflict)
router.get('/department/:dept', async (req, res) => {
    const deptParam = req.params.dept;
    try {
        // Try MySQL first (exact match on department column in students table)
        const sql = `SELECT student_id AS id, roll_number, department, semester, rfid_tag,
                            name AS student_name
                     FROM students WHERE LOWER(department) = LOWER(?)`;
        const results = await db.query(sql, [deptParam]);
        let formatted = results.map(r => ({
            name: r.student_name || r.name,
            id: r.id,
            department: r.department,
            semester: r.semester,
            rfidTag: r.rfid_tag,
            // Placeholder attendance fields (could be computed later)
            totalClasses: 0,
            attendedClasses: 0,
            attendance: 0,
            prevAttendance: 0
        }));

        // If MySQL returned nothing, fallback to Excel (legacy data)
        if (formatted.length === 0) {
            const excelStudents = excelHandler.readFromExcel();
            formatted = excelStudents.filter(s => s.department && s.department.toLowerCase() === deptParam.toLowerCase());
        }

        res.json({ success: true, count: formatted.length, data: formatted });
    } catch (err) {
        console.error('Dept fetch error:', err.message);
        // Hard fallback to Excel if DB error
        const excelStudents = excelHandler.readFromExcel();
        const filtered = excelStudents.filter(s => s.department && s.department.toLowerCase() === deptParam.toLowerCase());
        res.json({ success: true, count: filtered.length, data: filtered, fallback: true });
    }
});

// Get student by ID
router.get('/:id', (req, res) => {
    // Skip if path starts with 'department' which should have been handled above
    if (req.params.id.toLowerCase() === 'department') {
        return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }
    const students = excelHandler.readFromExcel();
    const student = students.find(s => s.id === req.params.id);
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }
    res.json({ success: true, data: student });
});

// Add new student
router.post('/', (req, res) => {
    const { name, id, department } = req.body;
    
    if (!name || !id || !department) {
        return res.status(400).json({
            success: false,
            message: 'Please provide name, id, and department'
        });
    }
    
    const students = excelHandler.readFromExcel();
    
    // Check if student already exists
    if (students.find(s => s.id === id)) {
        return res.status(409).json({
            success: false,
            message: 'Student with this ID already exists'
        });
    }
    
    const newStudent = {
        name,
        id,
        department,
        access: 'N/A',
        attendance: 0,
        prevAttendance: 0,
        totalClasses: 0,
        attendedClasses: 0
    };
    
    const added = excelHandler.addStudent(newStudent);
    
    if (added) {
        res.status(201).json({
            success: true,
            message: 'Student added successfully',
            data: newStudent
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Failed to add student to Excel'
        });
    }
});

// Update student
router.put('/:id', (req, res) => {
    const updatedStudent = excelHandler.updateStudent(req.params.id, req.body);
    
    if (!updatedStudent) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }
    
    res.json({
        success: true,
        message: 'Student updated successfully',
        data: updatedStudent
    });
});

// Delete student
router.delete('/:id', (req, res) => {
    const students = excelHandler.readFromExcel();
    const student = students.find(s => s.id === req.params.id);
    
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }
    
    const deleted = excelHandler.deleteStudent(req.params.id);
    
    if (deleted) {
        res.json({
            success: true,
            message: 'Student deleted successfully',
            data: student
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Failed to delete student from Excel'
        });
    }
});

// Update subject-specific attendance
router.post('/:id/subject-attendance', (req, res) => {
    const { subject, attendedClasses, totalClasses } = req.body;
    
    if (!subject || attendedClasses === undefined || totalClasses === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Please provide subject, attendedClasses, and totalClasses'
        });
    }
    
    const students = excelHandler.readFromExcel();
    const student = students.find(s => s.id === req.params.id);
    
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }
    
    // Update subject-specific attendance
    const subjectLower = subject.toLowerCase();
    const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;
    
    const updates = {};
    
    if (subjectLower === 'pps') {
        updates.ppsTotal = totalClasses;
        updates.ppsAttended = attendedClasses;
        updates.ppsPercentage = percentage;
    } else if (subjectLower === 'mathematics' || subjectLower === 'maths') {
        updates.mathsTotal = totalClasses;
        updates.mathsAttended = attendedClasses;
        updates.mathsPercentage = percentage;
    } else if (subjectLower === 'physics') {
        updates.physicsTotal = totalClasses;
        updates.physicsAttended = attendedClasses;
        updates.physicsPercentage = percentage;
    } else {
        return res.status(400).json({
            success: false,
            message: 'Invalid subject. Must be PPS, Mathematics, or Physics'
        });
    }
    
    const updated = excelHandler.updateStudent(req.params.id, updates);
    
    if (updated) {
        const updatedStudent = excelHandler.readFromExcel().find(s => s.id === req.params.id);
        res.json({
            success: true,
            message: `${subject} attendance updated successfully`,
            data: updatedStudent
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Failed to update student attendance'
        });
    }
});

// Get student by RFID tag (for ESP32/Arduino)
router.get('/rfid/:rfidTag', (req, res) => {
    const students = excelHandler.readFromExcel();
    const student = students.find(s => s.rfidTag && s.rfidTag.toUpperCase() === req.params.rfidTag.toUpperCase());
    
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found for this RFID tag'
        });
    }
    
    res.json({
        success: true,
        data: student
    });
});

// Download Excel file
router.get('/export/excel', (req, res) => {
    const filePath = excelHandler.getExcelFilePath();
    res.download(filePath, 'students.xlsx', (err) => {
        if (err) {
            res.status(500).json({
                success: false,
                message: 'Error downloading file'
            });
        }
    });
});

module.exports = router;
