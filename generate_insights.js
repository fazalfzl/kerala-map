const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('d:/kerala/data/kerala_delers.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

// District name mapping (Excel -> HTML ID)
// Keys should be uppercase for case-insensitive matching
const districtMapping = {
    'TRIVANDRUM': 'thiruvananthapuram',
    'THIRUVANANTHAPURAM': 'thiruvananthapuram',
    'KOLLAM': 'kollam',
    'PATHANAMTHITTA': 'pathanamthitta',
    'ALAPPUZHA': 'alappuzha',
    'KOTTAYAM': 'kottayam',
    'IDUKKI': 'idukki',
    'ERNAKULAM': 'ernakulam',
    'THRISSUR': 'thrissur',
    'PALAKKAD': 'palakkad',
    'MALAPPURAM': 'malappuram',
    'CALICUT': 'kozhikode',
    'KOZHIKODE': 'kozhikode',
    'WAYANAD': 'wayanad',
    'KANNUR': 'kannur',
    'KASARGOD': 'kasaragod',
    'KASARAGOD': 'kasaragod'
};

const insights = {};

// Refactored loop to handle metadata correctly

const processedDistricts = {};
let currentDistrictMetadata = null;

data.forEach(row => {
    if (row.District) {
        // New district starting.
        // Process previous district if exists
        if (currentDistrictMetadata && dealerSales.length > 0) {
            const name = currentDistrictMetadata.District;
            const normalizedName = name.trim().toUpperCase();
            const districtId = districtMapping[normalizedName];

            if (districtId) {
                insights[districtId] = processDistrict(name, dealerSales, currentDistrictMetadata);
            } else {
                console.warn(`Warning: No mapping found for district '${name}'`);
            }
        }

        // Reset for new district
        currentDistrictMetadata = row;
        dealerSales = [];
    } else if (row['NAME OF DEALERS'] && row[' SALES IN YEAR ']) {
        dealerSales.push(row[' SALES IN YEAR ']);
    }
});

// Process the very last district
if (currentDistrictMetadata && dealerSales.length > 0) {
    const name = currentDistrictMetadata.District;
    const normalizedName = name.trim().toUpperCase();
    const districtId = districtMapping[normalizedName];

    if (districtId) {
        insights[districtId] = processDistrict(name, dealerSales, currentDistrictMetadata);
    } else {
        console.warn(`Warning: No mapping found for district '${name}'`);
    }
}

function processDistrict(name, sales, metadata) {
    const totalSales = sales.reduce((sum, s) => sum + s, 0);
    const sortedSales = [...sales].sort((a, b) => b - a);
    const top3 = sortedSales.slice(0, 3);

    // Parse values
    const parseValue = (val) => {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        const str = String(val).replace(/[L,₹\s]/g, '').trim();
        return parseFloat(str) * 100000; // Assuming 'L' means Lakhs
    };

    const monthlyTarget = parseValue(metadata[' MONTHLY TARGET SALE ']);
    const currentSales = parseValue(metadata['Current Sales']);
    const achievement = monthlyTarget > 0 ? (currentSales / monthlyTarget * 100).toFixed(1) : 0;

    return {
        name: name.charAt(0) + name.slice(1).toLowerCase(),
        population: metadata['TOTAL POPULATION'] || 'N/A',
        dealerCount: sales.length,
        totalSales: totalSales.toFixed(2),
        monthlyTarget: monthlyTarget.toFixed(2),
        currentSales: currentSales.toFixed(2),
        achievement: achievement + '%',
        top3Sales: top3.map(s => s.toFixed(2)),
        top3Percentages: top3.map(s => ((s / totalSales) * 100).toFixed(1) + '%')
    };
}

// Output as JS file to avoid CORS
const jsContent = `window.districtInsights = ${JSON.stringify(insights, null, 2)};`;
fs.writeFileSync('d:/kerala/data/district_insights.js', jsContent);

console.log('District insights generated successfully!');
console.log('Districts processed:', Object.keys(insights).length);
console.log('Keys:', Object.keys(insights).join(', '));
