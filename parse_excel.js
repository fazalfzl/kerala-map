const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('d:/kerala/data/kerala_delers.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log('Total rows:', data.length);
console.log('Columns:', Object.keys(data[0] || {}));
console.log('\nFirst 3 rows:');
console.log(JSON.stringify(data.slice(0, 3), null, 2));

// Save full data
fs.writeFileSync('d:/kerala/data/dealers_data.json', JSON.stringify(data, null, 2));
console.log('\nFull data saved to dealers_data.json');
