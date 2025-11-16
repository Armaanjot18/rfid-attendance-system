// Test RFID scan simulation
const axios = require('axios');

const SERVER_URL = 'http://localhost:3000/api/attendance/rfid';

// Test data for 4 students
const testScans = [
    { rfidTag: 'RFID001', deviceId: 'DEVICE-01', location: 'Main Gate', student: 'Armaanjot Singh' },
    { rfidTag: 'RFID002', deviceId: 'DEVICE-01', location: 'Main Gate', student: 'Prabhdeep Singh' },
    { rfidTag: 'RFID003', deviceId: 'DEVICE-01', location: 'IT Lab', student: 'Rajveer Singh' },
    { rfidTag: 'RFID004', deviceId: 'DEVICE-02', location: 'Library', student: 'Gursheen Kaur' }
];

console.log('🔬 RFID System Test\n');
console.log('This simulates RFID scans from hardware\n');
console.log('='.repeat(50));

async function simulateScan(scanData) {
    try {
        console.log(`\n📡 Simulating scan for ${scanData.student}...`);
        console.log(`   RFID Tag: ${scanData.rfidTag}`);
        console.log(`   Location: ${scanData.location}`);
        
        const response = await axios.post(SERVER_URL, {
            rfidTag: scanData.rfidTag,
            deviceId: scanData.deviceId,
            location: scanData.location
        });
        
        if (response.data.success) {
            console.log('   ✅ Success!');
            console.log(`   Student: ${response.data.data.studentName}`);
            console.log(`   Department: ${response.data.data.department}`);
            console.log(`   Time: ${response.data.data.time}`);
        } else {
            console.log('   ❌ Failed:', response.data.message);
        }
        
    } catch (error) {
        if (error.response) {
            console.log('   ❌ Error:', error.response.data.message);
        } else if (error.code === 'ECONNREFUSED') {
            console.log('   ❌ Cannot connect to server. Make sure it\'s running on port 3000');
            process.exit(1);
        } else {
            console.log('   ❌ Error:', error.message);
        }
    }
}

async function runTests() {
    console.log('\n📋 Testing all 4 students...\n');
    
    for (const scan of testScans) {
        await simulateScan(scan);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between scans
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('\n✅ Test complete!');
    console.log('\n💡 Check the dashboards to see real-time updates:');
    console.log('   - PPS Dashboard: http://localhost:3000/../pps-teacher-dashboard.html');
    console.log('   - Maths Dashboard: http://localhost:3000/../maths-teacher-dashboard.html');
    console.log('   - Teacher Dashboard: http://localhost:3000/../teacher-data-access.html\n');
}

// Run tests
runTests();
