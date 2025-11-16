const db = require('./config/database');

async function checkRFID() {
    try {
        const result = await db.query('SELECT id, student_id, rfid_tag, department FROM students WHERE rfid_tag IS NOT NULL');
        const rows = Array.isArray(result[0]) ? result[0] : result;
        console.log('\nStudents with RFID tags:');
        console.log('========================');
        if (Array.isArray(rows)) {
            rows.forEach(r => {
                console.log(`ID: ${r.id} | Student: ${r.student_id} | RFID: ${r.rfid_tag} | Dept: ${r.department}`);
            });
            console.log(`\nTotal: ${rows.length} students`);
        } else {
            console.log('No rows returned or unexpected format');
            console.log(JSON.stringify(result, null, 2));
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkRFID();
