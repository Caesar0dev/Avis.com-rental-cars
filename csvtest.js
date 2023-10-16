const fs = require('fs');
const csv = require('csv-parser');

const csvFilePath = 'location origin.csv';

fs.createReadStream(csvFilePath)
    .pipe(csv({ separator: ',', headers: false }))
    .on('data', (row) => {
        const name = row[0];
        const school = row[1];
        const age = row[2];
        const location = row[3];
        
        console.log("name: ", name);
        console.log("school: ", school);
        console.log("age: ", age);
        console.log("location: ", location);
    })
    .on('end', () => {
        console.log('CSV file processing complete.');
    });
