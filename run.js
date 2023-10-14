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
var start_date = null;
let end_date = null;
// let index = 0;

for (let i = 1; i < 31; i++) {
    // console.log(">>> ", i);
    // const start_date = new Date(givenDate);
    const newDate = new Date(givenDate);
    newDate.setDate(newDate.getDate() + i);
    const startDate = newDate.toISOString().split('T')[0];
    start_date = startDate.split("-")[1] + "/" + startDate.split("-")[2] + "/" + startDate.split("-")[0];
    newDate.setDate(newDate.getDate() + 330);
    const endDate = newDate.toISOString().split('T')[0];
    end_date = endDate.split("-")[1] + "/" + endDate.split("-")[2] + "/" + endDate.split("-")[0];
    
    for (row in lines) {
        const searchKeyMiddle = lines[row].split("/");
        searchKey = searchKeyMiddle[searchKeyMiddle.length - 1].split(",")[0];
        // console.log("start date >>> ", start_date);
        // console.log("end date >>> ", end_date);
        // console.log("searchKey >>> ", searchKey);
        
        // index = index + 1;
        // console.log("------------", index, "---------------");

        ///////////////////////////// put here the scraping code

        /////////////////////////////
    }
}
///////////////////// preparation end ////////////////////////

async function launchBrowser(start_date, end_date, searchKey) {

    // console.log("start date >>> ", start_date);
    let Digital_Token = null;
    let RecaptchaResponse = null;
    let Cookie = null;
    let newResponse = null;
    let BasicPayload = null;
    let NewPayload = null;

    const browser = await puppeteer.launch({
        headless: false, // Use the new Headless mode
        // ... other options
    });

    // Rest of your code using the browser instance
    const page = await browser.newPage();

    // Listen for the request event
    page.on('response', async (response) => {
        const request = response.request();
        if (request.resourceType() === 'xhr') {
            if (request.url().includes('https://www.avis.com/webapi/reservation/vehicles')) {
                try {
                    const responseBody = await response.json(); // or response.text() if it's not a JSON response
                    console.log('AJAX Response:', responseBody);
                } catch (error) {
                    console.error('Failed to read response body:', error);
                }
            }
        }
    });

    // Navigate to a page that triggers AJAX requests
    await page.goto('https://www.avis.com/en/home', {
        timeout: 300000
    });

    // Delay function
    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    
    // Delay for 10 seconds
    await delay(3000); // 10,000 milliseconds = 10 seconds
    console.log('step 1')
    // /html/body/div[4]/section/div[2]/div[1]/span
    let modalXPath = '/html/body/div[4]/section/div[2]/div[1]/span';
    try {
        const [modalClose] = await page.$x(modalXPath);
        await modalClose.click({timeout:300000});
    } catch (error) {
        console.log(error);
    }
    
    // Delay for 10 seconds
    await delay(3000); // 10,000 milliseconds = 10 seconds

    let secModalXPath = '/html/body/div[4]/section/div[1]/div[1]/span';
    try {
        const [secModalClose] = await page.$x(secModalXPath);
        await secModalClose.click({timeout:300000});
    } catch (error) {
        console.log(error);
    }

    await page.waitForSelector('#PicLoc_value', {timeout: 300000});
    await page.type('#PicLoc_value', 'shr');
    await page.$eval('#from', (element) => {
        element.value = '11/01/2023';
    });
    
    // Delay for 10 seconds
    await delay(3000); // 10,000 milliseconds = 10 seconds

    // const endDateField = await page.waitForSelector('#to', {timeout: 300000});
    // console.log('step 2', endDateField)
    // await endDateField.click({timeout: 300000});
    
    // // Delay for 10 seconds
    // await delay(3000); // 10,000 milliseconds = 10 seconds

    // const endDateXPath = '/html/body/div[9]/div/div/div/div/div[3]/table/tbody/tr[4]/td[5]/a';
    // const [end_day] = await page.$x(endDateXPath);
    // await end_day.click({timeout: 300000});
    
    await page.$eval('#to', (element) => {
        element.value = '10/24/2024';
    });
    // Delay for 10 seconds
    await delay(3000); // 10,000 milliseconds = 10 seconds

    const findButton = await page.waitForSelector('#res-home-select-car', {timeout: 300000});
    await findButton.click({timeout: 300000});
    console.log(">>> submit button clicked successfully !!!");
    
    await browser.close();
}

launchBrowser()
    .then(res => console.info('end---> ', res))
    .catch(err => console.error('err--->', err));
