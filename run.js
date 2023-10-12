const puppeteer = require('puppeteer');
// var cookie = require('cookie-parse');
const fs = require('fs');
const e = require("express");

const start_date = process.argv[2];
const givenDate = new Date(start_date);
const newDate = new Date(givenDate);
newDate.setDate(givenDate.getDate() + 330);
const formattedDate = newDate.toISOString().split('T')[0];
const end_date = formattedDate.split("-")[1] + "/" + formattedDate.split("-")[2] + "/" + formattedDate.split("-")[0];

// Read the text file
const filePath = 'location origin.csv';
const text = fs.readFileSync(filePath, 'utf8');

// Perform scraping logic on the text data
// Here's an example of counting the number of lines in the text file
const lines = text.split('\n');

let searchKey = null;
for (row in lines) {
    const searchKeyMiddle = lines[row].split("/");
    searchKey = searchKeyMiddle[searchKeyMiddle.length - 1].split(",")[0];
    // console.log(searchKey);
}

console.log("start date >>> ", start_date);
console.log("end date >>> ", end_date);

///////////////////// preparation end ////////////////////////

async function launchBrowser(name, value) {

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

    // Enable request interception
    await page.setRequestInterception(true);

    // Listen for the request event

    page.on('request', async (request) => {

        if (!request.isNavigationRequest()) {

            // It's an AJAX request
            if (request.url().includes('https://www.avis.com/webapi/reservation/vehicles')) {
                console.log("request >>> ", request.headers())
                
                BasicPayload = request.postData();
                console.log("Payload >>> ", BasicPayload);
                
                if(BasicPayload) {
                    Digital_Token = request.headers()['digital-token'];
                    console.log("Digital Token >>> ", Digital_Token);
                    Cookie = request.headers().cookie;
                    // console.log("Cookie >>> ", Cookie);
                    RecaptchaResponse = request.headers()['g-recaptcha-response'];
                    console.log("Recaptcha Response >>> ", RecaptchaResponse);

                    const payloadElements = BasicPayload.split(",");
                    for (index in payloadElements) {
                        // console.log(">>>>>>>>>>>>>>>>>>>>>>>>> ", payloadElements[index]);
                        if(payloadElements[index].indexOf("pickInfo") > 0) {
                            payloadElements[index] = '"pickInfo":"'+ searchKey +'"';
                            // console.log(">>>>>>>>>>>>>pickInfo>>>>>>>>>>>>>>>>> ", payloadElements[index]);
                        };
                        if(payloadElements[index].indexOf("pickDate") > 0) {
                            payloadElements[index] = '"pickDate":"'+ start_date +'"';
                            // console.log(">>>>>>>>>>>>>>start date>>>>>>>>>>>>>>>> ", payloadElements[index]);
                        };
                        if(payloadElements[index].indexOf("dropDate") > 0) {
                            payloadElements[index] = '"dropDate":"'+ end_date +'"';
                            // console.log(">>>>>>>>>>>>>>>end date>>>>>>>>>>>>>>> ", payloadElements[index]);
                        };
                        NewPayload = NewPayload + payloadElements[index];
                    }
                    
                    console.log("NewPayload >>> ", NewPayload);
                }
            }
        }
        request.continue();
    });

    // Navigate to a page that triggers AJAX requests
    await page.goto('https://www.avis.com', {
        timeout: 300000
    });

    await page.waitForSelector('#PicLoc_value', {timeout: 300000});
    await page.type('#PicLoc_value', 'anb');
    await page.$eval('#from', (element) => {
        element.value = '11/01/2023';
    });
    const endDateField = await page.waitForSelector('#to', {timeout: 300000});
    await endDateField.click({timeout: 300000});
    const endDateXPath = '/html/body/div[9]/div/div/div/div/div[3]/table/tbody/tr[4]/td[5]/a';
    const [end_day] = await page.$x(endDateXPath);
    await end_day.click({timeout: 300000});
    console.log(">>> end date clicked successfully !!!");
    await page.evaluate(async() => {
        await new Promise(function(resolve) { 
               setTimeout(resolve, 1000)
        });
    });
    const findButton = await page.waitForSelector('#res-home-select-car', {timeout: 300000});
    await findButton.click({timeout: 300000});
    console.log(">>> submit button clicked successfully !!!");

    // Perform actions that trigger AJAX requests
    const result = await page.evaluate((Digital_Token, Cookie, RecaptchaResponse, NewPayload) => {
        
        if (Digital_Token) {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://www.avis.com/webapi/reservation/vehicles', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('digital-token', Digital_Token);
            xhr.setRequestHeader('cookie', Cookie);
            xhr.setRequestHeader('g-recaptcha-response', RecaptchaResponse);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        console.info('success: ', xhr.responseText);
                        newResponse = JSON.parse(xhr.responseText);
                        console.log(">>>>>>>>>>>", newResponse);
                    } else {
                        console.error('error: ', xhr.statusText);
                    }
                }
            };
            xhr.onerror = () => xhr.statusText;
            xhr.send(NewPayload);
        }

    }, Digital_Token, Cookie, RecaptchaResponse, NewPayload)

    console.log('eval res->', result)
    // AJAX requests end

    /////////////////////////////////////////////////////
    
    //////////////////////////////////////////////////////////
    // await browser.close();
}

launchBrowser()
    .then(res => console.info('end---> ', res))
    .catch(err => console.error('err--->', err));
