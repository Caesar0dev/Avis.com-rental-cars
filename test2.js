const puppeteer = require('puppeteer');

let givenDate = process.argv[2];

let start_date = null;
let end_date = null;
// let index = 0;


  
for (let i = 0; i < 30; i++) {
    // console.log(">>> ", i);
    // const start_date = new Date(givenDate);
    const newDate = new Date(givenDate+"-01");
    newDate.setDate(newDate.getDate() + i);
    const startDate = newDate.toISOString().split('T')[0];
    start_date = startDate.split("-")[1] + "/" + startDate.split("-")[2] + "/" + startDate.split("-")[0];
    newDate.setDate(newDate.getDate() + 330);
    const endDate = newDate.toISOString().split('T')[0];
    end_date = endDate.split("-")[1] + "/" + endDate.split("-")[2] + "/" + endDate.split("-")[0];
    
    console.log(">>> ", start_date);
    
    
}
