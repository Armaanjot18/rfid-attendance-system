const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get student's club memberships and duties
router.get('/student/:studentId/duties', async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Get student's clubs and duties
        const [duties] = await db.query(`
            SELECT 
                cd.id as duty_id,
                cd.duty_title,
                cd.duty_description,
                cd.assigned_date,
                cd.due_date,
                cd.priority,
                cd.status,
                c.club_name,
                c.club_code,
                cm.position,
                COUNT(cdu.id) as update_count
            FROM club_duties cd
            JOIN clubs c ON cd.club_id = c.id
            JOIN club_members cm ON c.id = cm.club_id AND cm.student_id = cd.student_id
            LEFT JOIN club_duty_updates cdu ON cd.id = cdu.duty_id
            JOIN students s ON cd.student_id = s.id
            WHERE s.student_id = ? AND cm.status = 'active'
            GROUP BY cd.id, c.id, cm.position
            ORDER BY 
                CASE cd.status 
                    WHEN 'pending' THEN 1 
                    WHEN 'in_progress' THEN 2 
                    WHEN 'completed' THEN 3 
                END,
                cd.due_date ASC
        `, [studentId]);
        
        res.json({
            success: true,
            duties: duties
        });
    } catch (error) {
        console.error('Error fetching club duties:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch club duties',
            error: error.message
        });
    }
});

// Submit duty update
router.post('/duties/:dutyId/updates', async (req, res) => {
    try {
        const { dutyId } = req.params;
        const { studentId, updateMessage, updateType, newStatus } = req.body;
        
        if (!updateMessage) {
            return res.status(400).json({
                success: false,
                message: 'Update message is required'
            });
        }
        
        // Get student's database ID from student_id
        const [students] = await db.query(
            'SELECT id FROM students WHERE student_id = ?',
            [studentId]
        );
        
        if (!students || students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        const studentDbId = students[0].id;
        
        // Insert update
        await db.query(`
            INSERT INTO club_duty_updates (duty_id, student_id, update_message, update_type)
            VALUES (?, ?, ?, ?)
        `, [dutyId, studentDbId, updateMessage, updateType || 'progress']);
        
        // Update duty status if provided
        if (newStatus) {
            await db.query(`
                UPDATE club_duties 
                SET status = ? 
                WHERE id = ? AND student_id = ?
            `, [newStatus, dutyId, studentDbId]);
        }
        
        res.json({
            success: true,
            message: 'Update submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting duty update:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit update',
            error: error.message
        });
    }
});

// Get updates for a specific duty
router.get('/duties/:dutyId/updates', async (req, res) => {
    try {
        const { dutyId } = req.params;
        
        const [updates] = await db.query(`
            SELECT 
                cdu.id,
                cdu.update_message,
                cdu.update_type,
                cdu.created_at,
                u.name as student_name
            FROM club_duty_updates cdu
            JOIN students s ON cdu.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE cdu.duty_id = ?
            ORDER BY cdu.created_at DESC
        `, [dutyId]);
        
        res.json({
            success: true,
            updates: updates
        });
    } catch (error) {
        console.error('Error fetching duty updates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch updates',
            error: error.message
        });
    }
});

// Create new duty (for club portal/heads)
router.post('/duties', async (req, res) => {
    try {
        const { clubId, studentId, dutyTitle, dutyDescription, dueDate, priority, assignedBy } = req.body;
        
        if (!clubId || !studentId || !dutyTitle) {
            return res.status(400).json({
                success: false,
                message: 'Club ID, student ID, and duty title are required'
            });
        }
        
        // Get student's database ID
        const [students] = await db.query(
            'SELECT id FROM students WHERE student_id = ?',
            [studentId]
        );
        
        if (!students || students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        const studentDbId = students[0].id;
        const currentDate = new Date().toISOString().split('T')[0];
        
        await db.query(`
            INSERT INTO club_duties (club_id, student_id, duty_title, duty_description, assigned_date, due_date, priority, assigned_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [clubId, studentDbId, dutyTitle, dutyDescription, currentDate, dueDate, priority || 'medium', assignedBy]);
        
        res.json({
            success: true,
            message: 'Duty assigned successfully'
        });
    } catch (error) {
        console.error('Error creating duty:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create duty',
            error: error.message
        });
    }
});

module.exports = router;
