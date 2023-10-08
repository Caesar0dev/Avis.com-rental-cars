const puppeteer = require('puppeteer');
const fs = require('fs');
var targetDate = ""
let start_date = "dadada"
let end_date = "sasasa"

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
    let authorization = null;
    let referer = null;
    page.on('request', async (request) => {
        
        if (!request.isNavigationRequest()) {
            // console.log("Ajax is here>>>>>>>>>>>>>>>>>>>>>>");
        
            // It's an AJAX request
            if (request.url().includes('https://bigspy.com/ecom/get-ecom-ads?')) {
                authorization = request.headers().authorization;
                referer = request.headers().referer;
                console.log(request.headers())
            
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
    await page.goto('https://bigspy.com/adspy/youtube/?app_type=3', {
        timeout: 300000
    });
    
    // Perform actions that trigger AJAX requests
    await page.evaluate((authorization) => {
        // $.post('Hello', data);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://bigspy.com/ecom/get-ecom-ads?favorite_app_flag=0&ecom_category=&search_type=1&platform=4&category=&tag_ids=&ad_positions=&video_duration_type=&os=0&ads_promote_type=0&geo=&game_play=&game_style=&type=0&page=1&industry=3&language=&keyword=&sort_field=first_seen&region=&seen_begin=1689048000&seen_end=1696823999&original_flag=0&is_preorder=0&is_real_person=0&theme=&text_md5=&ads_size=0&ads_format=0&exclude_keyword=&cod_flag=0&is_theater=0&cta_type=0&new_ads_flag=0&like_begin=&like_end=&comment_begin=&comment_end=&share_begin=&share_end=&position=0&is_hide_advertiser=0&advertiser_key=&dynamic=0&shopping=0&duplicate=0&software_types=&ecom_types=&social_account=&modules=ecomad&page_id=&landing_type=0&is_first=1&page_load_more=1&source_app=&redirect_filter_type=0', true);
        // xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader({'authorization': authorization, 'referer': referer});
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
            console.log('Response:', xhr.responseText);
            }
        };
        xhr.send();
    }, authorization)



    // await browser.close();
}

launchBrowser();
