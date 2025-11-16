// Create fresh students.xlsx with RFID tags and all required columns
const xlsx = require('xlsx');
const path = require('path');

const students = [
    {
        'Student Name': 'Armaanjot Singh',
        'Student ID': 'STU-8814',
        'Department': 'ECE',
        'Last Access': 'Main Gate',
        'RFID Tag': 'C3BF2809',
        'Total Classes': 100,
        'Attended Classes': 85,
        'Attendance %': 85,
        'Prev Attendance %': 83,
        'PPS Total': 25,
        'PPS Attended': 22,
        'PPS %': 88,
        'Maths Total': 25,
        'Maths Attended': 20,
        'Maths %': 80,
        'Physics Total': 25,
        'Physics Attended': 23,
        'Physics %': 92
    },
    {
        'Student Name': 'Prabhdeep Singh',
        'Student ID': 'STU-7743',
        'Department': 'ECE',
        'Last Access': 'Main Gate',
        'RFID Tag': 'ECEAFB03',
        'Total Classes': 100,
        'Attended Classes': 90,
        'Attendance %': 90,
        'Prev Attendance %': 88,
        'PPS Total': 25,
        'PPS Attended': 24,
        'PPS %': 96,
        'Maths Total': 25,
        'Maths Attended': 22,
        'Maths %': 88,
        'Physics Total': 25,
        'Physics Attended': 24,
        'Physics %': 96
    },
    {
        'Student Name': 'Rajveer Singh',
        'Student ID': 'STU-7655',
        'Department': 'ECE',
        'Last Access': 'Main Gate',
        'RFID Tag': 'I9J0K1L2',
        'Total Classes': 100,
        'Attended Classes': 88,
        'Attendance %': 88,
        'Prev Attendance %': 86,
        'PPS Total': 25,
        'PPS Attended': 23,
        'PPS %': 92,
        'Maths Total': 25,
        'Maths Attended': 21,
        'Maths %': 84,
        'Physics Total': 25,
        'Physics Attended': 22,
        'Physics %': 88
    }
];

const worksheet = xlsx.utils.json_to_sheet(students);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');

const excelPath = path.join(__dirname, '..', 'students.xlsx');

try {
    xlsx.writeFile(workbook, excelPath);
    console.log('✅ Fresh students.xlsx created successfully!');
    console.log('📝 Students added:');
    students.forEach(s => {
        console.log(`   ${s['Student Name']} (${s['Student ID']}) - RFID: ${s['RFID Tag']}`);
    });
} catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Make sure students.xlsx is closed');
}
