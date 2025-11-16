// Serial Bridge - Reads RFID data from Arduino USB and sends to server
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const axios = require('axios');

const SERVER_URL = 'http://localhost:3000/api/attendance/rfid';

// Auto-detect Arduino port or manually set it
const ARDUINO_PORT = 'COM7'; // Change if needed: COM3, COM4, COM5, etc.
const BAUD_RATE = 9600;

console.log('=================================');
console.log('  Arduino RFID Serial Bridge');
console.log('=================================\n');

// Open serial port
const port = new SerialPort({ 
  path: ARDUINO_PORT, 
  baudRate: BAUD_RATE 
}, (err) => {
  if (err) {
    console.error('❌ Error opening serial port:', err.message);
    console.log('\n📋 Available COM ports:');
    listPorts();
    process.exit(1);
  }
});

// Parse data line by line
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

port.on('open', () => {
  console.log('✅ Connected to Arduino on', ARDUINO_PORT);
  console.log('📡 Listening for RFID scans...\n');
  console.log('---------------------------------');
});

// Handle incoming data
parser.on('data', async (line) => {
  line = line.trim();
  
  // Check if it's JSON data (RFID scan)
  if (line.startsWith('{') && line.endsWith('}')) {
    try {
      const data = JSON.parse(line);
      
      console.log('\n🔍 RFID Detected!');
      console.log('   Tag:', data.rfidTag);
      console.log('   Device:', data.deviceId);
      console.log('   Location:', data.location);
      
      // Send to server
      const response = await axios.post(SERVER_URL, data);
      
      if (response.data.success) {
        console.log('✅ Attendance Marked!');
        console.log('   Student:', response.data.data.studentName);
        console.log('   ID:', response.data.data.studentId);
        console.log('   Department:', response.data.data.department);
        console.log('   Time:', new Date().toLocaleTimeString());
      } else {
        console.log('❌ Failed:', response.data.message);
      }
      
    } catch (error) {
      if (error.response) {
        console.log('❌ Server Error:', error.response.data.message);
      } else if (error.code === 'ECONNREFUSED') {
        console.log('❌ Cannot connect to server. Is it running on port 3000?');
      } else {
        console.log('❌ Error:', error.message);
      }
    }
    console.log('---------------------------------');
    
  } else {
    // Debug messages from Arduino
    console.log('[Arduino]', line);
  }
});

// Handle errors
port.on('error', (err) => {
  console.error('❌ Serial Port Error:', err.message);
});

port.on('close', () => {
  console.log('\n⚠️  Serial port closed');
  process.exit(0);
});

// List available COM ports
async function listPorts() {
  const { SerialPort } = require('serialport');
  const ports = await SerialPort.list();
  
  if (ports.length === 0) {
    console.log('   No ports found. Connect Arduino and try again.');
  } else {
    ports.forEach((port) => {
      console.log(`   ${port.path} - ${port.manufacturer || 'Unknown'}`);
    });
    console.log('\n💡 Update ARDUINO_PORT in serial-bridge.js with correct port');
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down...');
  port.close();
});

console.log('📌 Press Ctrl+C to exit\n');
