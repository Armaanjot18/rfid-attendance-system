const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Use the root-level students.xlsx file
const EXCEL_FILE_PATH = path.join(__dirname, '../../students.xlsx');

class ExcelHandler {
    constructor() {
        // No need to create data directory since we're using root-level Excel file
        this.initializeExcelFile();
    }

    initializeExcelFile() {
        if (!fs.existsSync(EXCEL_FILE_PATH)) {
            // Create initial Excel file with sample data including subject-specific attendance
            const initialData = [
                {
                    'Student Name': 'Armaanjot Singh',
                    'Student ID': 'STU-8814',
                    'RFID Tag': 'RFID001',
                    'Department': 'Computer Science Engineering',
                    'Last Access': 'Main Gate',
                    'Total Classes': 20,
                    'Attended Classes': 19,
                    'Attendance %': 95,
                    'Prev Attendance %': 92,
                    'PPS Total': 20,
                    'PPS Attended': 18,
                    'PPS %': 90,
                    'Maths Total': 20,
                    'Maths Attended': 19,
                    'Maths %': 95,
                    'Physics Total': 20,
                    'Physics Attended': 20,
                    'Physics %': 100
                },
                {
                    'Student Name': 'Prabhdeep Singh',
                    'Student ID': 'STU-7743',
                    'RFID Tag': 'RFID002',
                    'Department': 'Computer Science Engineering',
                    'Last Access': 'Main Gate',
                    'Total Classes': 20,
                    'Attended Classes': 12,
                    'Attendance %': 62,
                    'Prev Attendance %': 75,
                    'PPS Total': 20,
                    'PPS Attended': 10,
                    'PPS %': 50,
                    'Maths Total': 20,
                    'Maths Attended': 13,
                    'Maths %': 65,
                    'Physics Total': 20,
                    'Physics Attended': 14,
                    'Physics %': 70
                },
                {
                    'Student Name': 'Rajveer Singh',
                    'Student ID': 'STU-7655',
                    'RFID Tag': 'RFID003',
                    'Department': 'Information Technology',
                    'Last Access': 'IT Lab',
                    'Total Classes': 20,
                    'Attended Classes': 18,
                    'Attendance %': 89,
                    'Prev Attendance %': 88,
                    'PPS Total': 20,
                    'PPS Attended': 17,
                    'PPS %': 85,
                    'Maths Total': 20,
                    'Maths Attended': 19,
                    'Maths %': 95,
                    'Physics Total': 20,
                    'Physics Attended': 18,
                    'Physics %': 90
                },
                {
                    'Student Name': 'Gursheen Kaur',
                    'Student ID': 'STU-9999',
                    'RFID Tag': 'RFID004',
                    'Department': 'Computer Science Engineering',
                    'Last Access': 'Library',
                    'Total Classes': 20,
                    'Attended Classes': 18,
                    'Attendance %': 92,
                    'Prev Attendance %': 90,
                    'PPS Total': 20,
                    'PPS Attended': 18,
                    'PPS %': 90,
                    'Maths Total': 20,
                    'Maths Attended': 19,
                    'Maths %': 95,
                    'Physics Total': 20,
                    'Physics Attended': 18,
                    'Physics %': 90
                }
            ];

            this.writeToExcel(initialData);
            console.log('Excel file initialized at:', EXCEL_FILE_PATH);
        }
    }

    readFromExcel() {
        try {
            const workbook = XLSX.readFile(EXCEL_FILE_PATH);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            // Convert Excel format to app format
            return data.map(row => ({
                name: row['Student Name'],
                id: row['Student ID'],
                department: row['Department'],
                access: row['Last Access'],
                totalClasses: row['Total Classes'],
                attendedClasses: row['Attended Classes'],
                attendance: row['Attendance %'],
                prevAttendance: row['Prev Attendance %'],
                rfidTag: row['RFID Tag'] || null, // Support for RFID integration
                // Subject-specific attendance
                ppsTotal: row['PPS Total'] || 0,
                ppsAttended: row['PPS Attended'] || 0,
                ppsPercentage: row['PPS %'] || 0,
                mathsTotal: row['Maths Total'] || 0,
                mathsAttended: row['Maths Attended'] || 0,
                mathsPercentage: row['Maths %'] || 0,
                physicsTotal: row['Physics Total'] || 0,
                physicsAttended: row['Physics Attended'] || 0,
                physicsPercentage: row['Physics %'] || 0
            }));
        } catch (error) {
            console.error('Error reading Excel file:', error);
            return [];
        }
    }

    writeToExcel(data) {
        try {
            // Convert app format to Excel format
            const excelData = data.map(student => ({
                'Student Name': student.name || student['Student Name'],
                'Student ID': student.id || student['Student ID'],
                'Department': student.department || student['Department'],
                'Last Access': student.access || student['Last Access'],
                'RFID Tag': student.rfidTag || student['RFID Tag'] || '', // Add RFID tag column
                'Total Classes': student.totalClasses || student['Total Classes'],
                'Attended Classes': student.attendedClasses || student['Attended Classes'],
                'Attendance %': student.attendance || student['Attendance %'],
                'Prev Attendance %': student.prevAttendance || student['Prev Attendance %'],
                'PPS Total': student.ppsTotal || student['PPS Total'] || 0,
                'PPS Attended': student.ppsAttended || student['PPS Attended'] || 0,
                'PPS %': student.ppsPercentage || student['PPS %'] || 0,
                'Maths Total': student.mathsTotal || student['Maths Total'] || 0,
                'Maths Attended': student.mathsAttended || student['Maths Attended'] || 0,
                'Maths %': student.mathsPercentage || student['Maths %'] || 0,
                'Physics Total': student.physicsTotal || student['Physics Total'] || 0,
                'Physics Attended': student.physicsAttended || student['Physics Attended'] || 0,
                'Physics %': student.physicsPercentage || student['Physics %'] || 0
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
            XLSX.writeFile(workbook, EXCEL_FILE_PATH);
            
            return true;
        } catch (error) {
            console.error('Error writing to Excel file:', error);
            return false;
        }
    }

    updateStudent(studentId, updates) {
        try {
            const students = this.readFromExcel();
            const index = students.findIndex(s => s.id === studentId);
            
            if (index !== -1) {
                students[index] = { ...students[index], ...updates };
                this.writeToExcel(students);
                return students[index];
            }
            
            return null;
        } catch (error) {
            console.error('Error updating student:', error);
            return null;
        }
    }

    addStudent(student) {
        try {
            const students = this.readFromExcel();
            students.push(student);
            this.writeToExcel(students);
            return student;
        } catch (error) {
            console.error('Error adding student:', error);
            return null;
        }
    }

    deleteStudent(studentId) {
        try {
            const students = this.readFromExcel();
            const filtered = students.filter(s => s.id !== studentId);
            this.writeToExcel(filtered);
            return true;
        } catch (error) {
            console.error('Error deleting student:', error);
            return false;
        }
    }

    getExcelFilePath() {
        return EXCEL_FILE_PATH;
    }
}

module.exports = new ExcelHandler();
