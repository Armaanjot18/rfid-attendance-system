const XLSX = require('xlsx');
const path = require('path');

// Path to Excel file
const excelPath = path.join(__dirname, '../students.xlsx');

// Read the Excel file
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

// Update Armaanjot Singh's RFID tag
data.forEach(row => {
    if (row['Student ID'] === 'STU-8814' || row['Student Name'] === 'Armaanjot Singh') {
        row['RFID Tag'] = 'ECEAFB03';
        console.log('✓ Updated RFID tag for Armaanjot Singh: ECEAFB03');
    }
    
    // Add sample RFID tags for other students (optional)
    if (row['Student ID'] === 'STU-7743') {
        row['RFID Tag'] = row['RFID Tag'] || 'E5F6G7H8';
    }
    if (row['Student ID'] === 'STU-7655') {
        row['RFID Tag'] = row['RFID Tag'] || 'I9J0K1L2';
    }
});

// Write back to Excel
const newWorksheet = XLSX.utils.json_to_sheet(data);
const newWorkbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Students');
XLSX.writeFile(newWorkbook, excelPath);

console.log('✓ Excel file updated successfully!');
console.log('File location:', excelPath);
console.log('\nRFID Mappings:');
data.forEach(row => {
    if (row['RFID Tag']) {
        console.log(`  ${row['Student Name']}: ${row['RFID Tag']}`);
    }
});
