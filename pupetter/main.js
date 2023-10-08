const express = require('express')
const cors = require('cors')
const app = express()
const puppeteer = require('puppeteer');

app.use(cors())
app.use(express.json())
app.use(express.urlencoded())

app.get('/', function (req, res) {
    res.send('Hello World')
})

const main = async (app) => {
    // Launch a new browser instance
    const browser = await puppeteer.launch({ headless: false });
    // Create a new page
    const page = await browser.newPage();

    app.get('/test', async (req, res) => {
        try{
            // const { url } = req.query;
            const { url } = req.body;
            // Navigate to a webpage
            await page.goto(url, { timeout: 30000 });
            // Capture a screenshot
            await page.screenshot({ path: 'screenshot1.png' });
            ///////// create new ajax /////////////////

            ///////////////////////////////////////////
            res.send(';)');
        }catch(err){
            console.log(err)
            res.send(';(')
        }
    })

    // const data = {'url': 'https://github.com'}
    // // Perform actions that trigger AJAX requests
    // await page.evaluate((data) => {
    //     // $.post('Hello', data);
    //     const xhr = new XMLHttpRequest();
    //     xhr.open('POST', 'HHHHHHHHHHHHHH', true);
    //     console.log("HHHHHHHHHHHHHHHH");
    //     // xhr.setRequestHeader('Content-Type', 'application/json');
    //     // xhr.onreadystatechange = function() {
    //     //     if (xhr.readyState === 4 && xhr.status === 200) {
    //     //     console.log('Response:', xhr.responseText);
    //     //     }
    //     // };
    //     xhr.send(JSON.stringify(data));
    // }, data)
    
    app.use('/close', async (req, res) => {
        // Close the browser
        await browser.close();
        res.send(';)')
    })

    app.listen(3000)
}
main(app);