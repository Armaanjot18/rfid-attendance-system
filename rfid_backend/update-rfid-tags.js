// Update RFID tags for students
const xlsx = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, '..', 'students.xlsx');

console.log('=================================');
console.log('  Updating RFID Tags');
console.log('=================================\n');

try {
  // Read Excel file
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  console.log('Current students found:', data.length);
  console.log('');

  // Update RFID tags
  const updates = [
    { name: 'Prabhdeep Singh', rfid: 'ECEAFB03' },
    { name: 'Armaanjot Singh', rfid: 'C3BF2809' }
  ];

  let updateCount = 0;

  updates.forEach(update => {
    const student = data.find(s => 
      s['Student Name'] && s['Student Name'].toLowerCase().includes(update.name.toLowerCase())
    );

    if (student) {
      student['RFID Tag'] = update.rfid;
      console.log(`✓ Updated ${update.name}: ${update.rfid}`);
      updateCount++;
    } else {
      console.log(`✗ Not found: ${update.name}`);
    }
  });

  if (updateCount > 0) {
    // Convert back to worksheet
    const newWorksheet = xlsx.utils.json_to_sheet(data);
    workbook.Sheets[sheetName] = newWorksheet;

    // Save file
    xlsx.writeFile(workbook, excelPath);
    console.log('\n✅ Excel file updated successfully!');
    console.log(`📝 ${updateCount} RFID tag(s) updated`);
  } else {
    console.log('\n⚠️  No students found to update');
  }

  console.log('\n=================================');
  console.log('Updated RFID Tags:');
  console.log('=================================');
  updates.forEach(u => {
    console.log(`${u.name}: ${u.rfid}`);
  });

} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n💡 Make sure students.xlsx is closed and try again.');
}
