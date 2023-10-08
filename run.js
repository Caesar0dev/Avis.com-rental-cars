const puppeteer = require('puppeteer');
const fs = require('fs');

const start_date = process.argv[2];
console.log("start date >>> ", start_date);

const givenDate = new Date(start_date);

const newDate = new Date(givenDate);
newDate.setDate(givenDate.getDate() + 330);

const formattedDate = newDate.toISOString().split('T')[0];

const end_date = formattedDate.split("-")[1] + "/" + formattedDate.split("-")[2] + "/" + formattedDate.split("-")[0];
console.log("end_date >>> ", end_date);

// Read the text file
const filePath = 'location origin.csv';
const text = fs.readFileSync(filePath, 'utf8');

// Perform scraping logic on the text data
// Here's an example of counting the number of lines in the text file
const lines = text.split('\n');

let searchKey = null;
for (row in lines) {
    const searchKeyMiddle = lines[row].split("/");
    // console.log(searchKeyMiddle);
    
    searchKey = searchKeyMiddle[searchKeyMiddle.length-1].split(",")[0];
    console.log(searchKey);
}

///////////////////// preparation end ////////////////////////

(async () => {
    // Launch a new browser instance
    const browser = await puppeteer.launch();
  
    // Create a new page/tab
    const page = await browser.newPage();
  
    // Navigate to the website with the form
    await page.goto('https://www.google.com/ncr');
  
    // Fill in the form fields          //*[@id="APjFqb"]
    // Find the input element using XPath
    const inputXPath = '//*[@id="APjFqb"]';
    const inputElement = (await page.$x(inputXPath))[0];
    
    // Input data into the element
    const inputData = 'tokyo time';
    await inputElement.type(inputData);
    
    // await page.click('/html/body/div[1]/div[3]/form/div[1]/div[1]/div[2]/div[2]/div[6]/center/input[1]');
    const elementXPath = '/html/body/div[1]/div[3]/form/div[1]/div[1]/div[2]/div[2]/div[6]/center/input[1]';
    
    const elementHandle = await page.waitForXPath(elementXPath, { timeout: 50000 });
    await elementHandle.click();
  
    // // Wait for the form submission to complete
    // await page.waitForNavigation();
  
    // // Capture a screenshot of the resulting page
    // await page.screenshot({ path: 'form_submission.png' });
  
    // // Close the browser
    // await browser.close();
  })();