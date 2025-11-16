const db = require('./config/database');

async function testQuery() {
    try {
        console.log('\nTesting RFID query...');
        const [students] = await db.query(
            'SELECT s.id, s.student_id, s.rfid_tag, s.department, s.semester, u.name FROM students s JOIN users u ON s.user_id = u.id WHERE s.rfid_tag = ?',
            ['RFID002']
        );
        
        console.log('Query returned:', students);
        console.log('First student:', students && students[0]);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testQuery();
