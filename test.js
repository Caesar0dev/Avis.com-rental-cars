const puppeteer = require('puppeteer');

var matchedCookie = "Cookie";
var matchedPayload = "Cookie";
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
    await page.goto('https://vinesplus.com/collections/wine-accessories', {
        timeout: 300000
    });
    
    const data = {dfef: 'adf'}
    // Perform actions that trigger AJAX requests
    await page.evaluate((data) => {
        // $.post('Hello', data);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'HHHHHHHHHHHHHH', true);
        console.log("HHHHHHHHHHHHHHHH");
        xhr.setRequestHeader('Content-Type', 'application/json');
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
