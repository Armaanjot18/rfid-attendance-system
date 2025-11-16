// Check current attendance in Excel
const excelHandler = require('./utils/excelHandler');

console.log('\n╔════════════════════════════════════════════╗');
console.log('║     Current Attendance Status              ║');
console.log('╚════════════════════════════════════════════╝\n');

const students = excelHandler.readFromExcel();

students.forEach(student => {
    console.log(`📌 ${student.name} (${student.id})`);
    console.log(`   RFID: ${student.rfidTag}`);
    console.log(`   Attended: ${student.attendedClasses}/${student.totalClasses}`);
    console.log(`   Percentage: ${student.attendance}%`);
    console.log(`   Last Access: ${student.access}`);
    console.log('');
});

console.log('─────────────────────────────────────────────');
console.log('👉 Ready! Now scan your RFID card...\n');
