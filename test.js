const puppeteer = require('puppeteer');
const fs = require('fs');
var targetDate = ""
var start_date = "dadada"
var end_date = "sasasa"

// Read the value from the file
fs.readFile('selenium/transmition.txt', 'utf8', function(err, data) {
    if (err) {
      console.error(err);
      return;
    }
    
    // Use the value in your Node.js script
    const jsString = data;
    console.log(">>>>>>>>>>>>>>>>>>>>>> ", jsString);
    targetDate = JSON.parse(jsString);
    start_date = targetDate.start_date;
    end_date = targetDate.end_date;
});

console.log("start date >>> ", start_date);
console.log("end date >>> ", end_date);

var matchedCookie = "Cookie";
var matchedPayload = "Payload";
// const matchedMethod = "";

async function launchBrowser() {
    // console.log("started---------------->");
    const browser = await puppeteer.launch({
        headless: false, // Use the new Headless mode
        // ... other options
    });

    // Rest of your code using the browser instance
    const page = await browser.newPage();
    // console.log("page ---------------->");

    // Enable request interception
    await page.setRequestInterception(true);
    // console.log("page set ---------------->");
    // Listen for the request event
    page.on('request', async (request) => {
        
        if (!request.isNavigationRequest()) {
            // console.log("Ajax is here>>>>>>>>>>>>>>>>>>>>>>");
        
            // It's an AJAX request
            if (request.url().includes('produce')) {
                
                matchedCookie = request.headers().cookie;
                console.log('------------- matched cookie -----------------');
                console.log(matchedCookie);
                console.log("----------------------------------------------");

                matchedPayload = request.postData();
                console.log('------------- matched payload -----------------');
                console.log(matchedPayload);
                console.log("----------------------------------------------");
            
            }
        }
        
        // if (request.url() === 'https://vinesplus.com/.well-known/shopify/monorail/v1/produce') {
        //     const response = await request.continue();
        //     const responseData = await response.text();
        //     console.log('------------- matched response -----------------');
        //     console.log(responseData);
        //     console.log('------------------------------------------------');

        // } else {
        //     request.continue();
        // }
        request.continue();

    });

    // Intercept the request and get the response
    page.on('request', async (request) => {
        
    });
    
    // Navigate to a page that triggers AJAX requests
    await page.goto('https://vinesplus.com/collections/all', {
        timeout: 300000
    });
    
    const data = {dfef: 'adf'}
    // Perform actions that trigger AJAX requests
    await page.evaluate((data) => {
        // $.post('Hello', data);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'all', true);
        console.log("HHHHHHHHHHHHHHHH");
        // xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Cookie', matchedCookie);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
            console.log('Response:', xhr.responseText);
            }
        };
        xhr.send(JSON.stringify(data));
    }, data)




    // await browser.close();
}

launchBrowser();
