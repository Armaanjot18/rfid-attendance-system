// List all available COM ports
const { SerialPort } = require('serialport');

console.log('\n📋 Checking for COM Ports...\n');

SerialPort.list().then(ports => {
  if (ports.length === 0) {
    console.log('❌ No COM ports found!');
    console.log('\n💡 Make sure:');
    console.log('   1. Arduino is connected via USB');
    console.log('   2. USB drivers are installed');
    console.log('   3. Arduino IDE Serial Monitor is CLOSED\n');
  } else {
    console.log('✅ Available COM Ports:\n');
    ports.forEach((port, index) => {
      console.log(`   ${index + 1}. ${port.path}`);
      console.log(`      Manufacturer: ${port.manufacturer || 'Unknown'}`);
      if (port.vendorId) console.log(`      Vendor ID: ${port.vendorId}`);
      if (port.productId) console.log(`      Product ID: ${port.productId}`);
      console.log('');
    });
    
    console.log('💡 Update serial-bridge.js line 9:');
    console.log(`   const ARDUINO_PORT = '${ports[0].path}'; // Use your Arduino port\n`);
  }
}).catch(err => {
  console.error('❌ Error:', err.message);
});
