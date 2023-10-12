const puppeteer = require('puppeteer');
// var cookie = require('cookie-parse');
const fs = require('fs');
const e = require("express");

let givenDate = process.argv[2];

// Read the text file
const filePath = 'location origin.csv';
const text = fs.readFileSync(filePath, 'utf8');

// Perform scraping logic on the text data
// Here's an example of counting the number of lines in the text file
const lines = text.split('\n');

let searchKey = null;
let index = 0;

for (let i = 1; i < 31; i++) {
    console.log(">>> ", i);
    // const start_date = new Date(givenDate);
    const newDate = new Date(givenDate);
    newDate.setDate(newDate.getDate() + i);
    const startDate = newDate.toISOString().split('T')[0];
    const start_date = startDate.split("-")[1] + "/" + startDate.split("-")[2] + "/" + startDate.split("-")[0];
    newDate.setDate(newDate.getDate() + 330);
    const endDate = newDate.toISOString().split('T')[0];
    const end_date = endDate.split("-")[1] + "/" + endDate.split("-")[2] + "/" + endDate.split("-")[0];
    
    for (row in lines) {
        const searchKeyMiddle = lines[row].split("/");
        searchKey = searchKeyMiddle[searchKeyMiddle.length - 1].split(",")[0];
        console.log("start date >>> ", start_date);
        console.log("end date >>> ", end_date);
        console.log("searchKey >>> ", searchKey);
        
        index = index + 1;
        console.log("------------", index, "---------------");

        // put here the scraping code

        /////////////////////////////
    }
}