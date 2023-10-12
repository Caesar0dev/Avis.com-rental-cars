const puppeteer = require('puppeteer');
const fs = require('fs');

const start_date = process.argv[2];
const givenDate = new Date(start_date);
const newDate = new Date(givenDate);
newDate.setDate(givenDate.getDate() + 330);
const formattedDate = newDate.toISOString().split('T')[0];
const end_date = formattedDate.split("-")[1] + "/" + formattedDate.split("-")[2] + "/" + formattedDate.split("-")[0];

// // Read the text file
// const filePath = 'location origin.csv';
// const text = fs.readFileSync(filePath, 'utf8');

// // Perform scraping logic on the text data
// // Here's an example of counting the number of lines in the text file
// const lines = text.split('\n');

// let searchKey = null;
// for (row in lines) {
//     const searchKeyMiddle = lines[row].split("/");
//     searchKey = searchKeyMiddle[searchKeyMiddle.length-1].split(",")[0];
//     console.log(searchKey);
// }

console.log("start date >>> ", start_date);
console.log("end date >>> ", end_date);

///////////////////// preparation end ////////////////////////

let authorization = null;
let referer = null;
let cookie = null;

async function launchBrowser() {
    const browser = await puppeteer.launch({
        headless: false, // Use the new Headless mode
        // ... other options
    });

    // Rest of your code using the browser instance
    const page = await browser.newPage();

    // // Enable request interception
    // await page.setRequestInterception(true);

    // Listen for the request event

    page.on('request', async (response) => {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        console.log(response);
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        const url = response.url();
        console.log("URL >>> ", url);
        const status = response.status();
        console.log("status >>> ", status);
        const contentType = response.headers()['content-type'];

        if (contentType && contentType.includes('application/json')) {
            const responseJson = await response.json();
            console.log('Intercepted JSON response:', responseJson);
        } else {
            const responseText = await response.text();
            console.log('Intercepted response:', responseText);
        }
        
        // request.continue();
    });
    
    // Navigate to a page that triggers AJAX requests
    await page.goto('https://bigspy.com/adspy/youtube/?app_type=3', {
        timeout: 300000
    });
            
    // // Perform actions that trigger AJAX requests
    // await page.evaluate((authorization) => {
    //     const xhr = new XMLHttpRequest();
    //     xhr.open('POST', 'https://bigspy.com/ecom/get-ecom-ads?favorite_app_flag=0&ecom_category=&search_type=1&platform=4&category=&tag_ids=&ad_positions=&video_duration_type=&os=0&ads_promote_type=0&geo=&game_play=&game_style=&type=0&page=1&industry=3&language=&keyword=&sort_field=first_seen&region=&seen_begin=1689048000&seen_end=1696823999&original_flag=0&is_preorder=0&is_real_person=0&theme=&text_md5=&ads_size=0&ads_format=0&exclude_keyword=&cod_flag=0&is_theater=0&cta_type=0&new_ads_flag=0&like_begin=&like_end=&comment_begin=&comment_end=&share_begin=&share_end=&position=0&is_hide_advertiser=0&advertiser_key=&dynamic=0&shopping=0&duplicate=0&software_types=&ecom_types=&social_account=&modules=ecomad&page_id=&landing_type=0&is_first=1&page_load_more=1&source_app=&redirect_filter_type=0', true);
    //     // xhr.setRequestHeader('Content-Type', 'application/json');
    //     xhr.setRequestHeader({'authorization': authorization, 'referer': referer, 'cookie': cookie});
    //     xhr.onreadystatechange = function() {
    //         if (xhr.readyState === 4 && xhr.status === 200) {
    //             console.log('Response:', xhr.responseText);
    //         }
    //     };
    //     xhr.send();
    // }, authorization)

    // await browser.close();
}

launchBrowser();
