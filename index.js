const { error } = require('console')
const fs = require('fs')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const ac = require("@antiadmin/anticaptchaofficial");
ac.setAPIKey('ecd9a6e1809a603744d1f8dc7ad08374');

ac.getBalance()
    .then(balance => console.log('my balance is: '+balance))
    .catch(error => console.log('an error with API key: '+error));
    
const { spawn  } = require('child_process');
const config = {
    DOMAIN_URL: 'https://www.spamzilla.io/domains/',
    LOGIN_URL: 'https://www.spamzilla.io/account/login/',
    EMAIL: 'reginaldreaollanodwl82@gmail.com',
    PASSWORD: 'qy_8i7fO_g',
}

const doLogin = async (page) => {
    
    console.log('solving recaptcha ...');

    let token = await ac.solveRecaptchaV3('' +
    config.LOGIN_URL,
    '6LfFulYkAAAAADNsI8PkoneP9LlGoOIXMLwTtDrs',
    0.9,
    'test');
    if (!token) {
        console.log('something went wrong');
        return;
    }
    console.log(token)

    await page.goto(config.LOGIN_URL, {
        waitUntil: 'load',
        timeout: 300000
      });

    // await page.solveRecaptchas()
    await page.waitForSelector('#loginform-email', {timeout: 30000});
    await page.type('#loginform-email', config.EMAIL)
    await page.type('#loginform-password', config.PASSWORD)
    console.log('setting recaptcha g-response ...');
    await page.$eval('#loginform-recaptcha', (element, token) => {
        element.value = token;
    }, token);
    await page.click('button[type="submit"]')

    // const span = await page.$('.help-block');
    const blocklabels = await page.$$eval('.help-block', elems => elems.map(elem => elem.innerText));
    console.log(blocklabels)
    if(blocklabels[3] != ''){
        console.log('setting recaptcha g-response ...');
        await page.$eval('#loginform-recaptcha', (element, token) => {
            element.value = token;
        }, token);
        await page.click('button[type="submit"]')
    }
    await page.waitForNavigation({waitUntil: 'load', timeout: 300000});
}
let settingfilepath = 'data/spamzilla_schedule_setting.txt'
        
const fetchAllData = async (page) => {
    console.log("all data fetching")
    let n = await fetchCount(page)
    let page_num = Math.floor(n / 25) + 1;
    page_num = 3200;
    let steps_cnt = Math.floor(page_num / 25) + 1;
    // steps_cnt = 1

    for(let i = 0; i < steps_cnt; i++){
        let filename = 'data/domain_results_' + i + '.txt'
    
        fs.writeFile(filename, '', (err) => {
            if (err) throw err;
            console.log('the file has been created!');
          });
        await fetchData(page, 25, i * 25 + 1 , (i+1) * 25, filename)
    }
}

const fetchUpdatedData = async (page, page_start) => {
    let filename = "data/spamzilla_domain_results.txt"
    let n = await fetchCount(page)
    let page_end;
    
    for(let i = 0; i < 6; i++){
        page_start += i * 25;
        page_end = page_start + 25;
        if(page_end >= n){
            page_end = n;
        }
        let filename = 'data/spamzilla_domain_results' + i + '.txt'
    
        fs.writeFile(filename, '', (err) => {
            if (err) throw err;
            console.log('the file has been created!');
          });

        try {
            await fetchData(page, 25, page_start+1, page_end, filename)
            console.log('async fetchData resolved')
        } catch (err) {
            console.error(`Error fetching data: ${err}`)
        }
    }

    if(page_end == n){
        page_end = 0;
    }
    fs.writeFile(settingfilepath, page_end.toString(), function (err) {
        if (err) throw err;
        console.log('Data written to file!');
    });
}


const fetchData = async (page, percount, skip, limit, filename) => {
    let pageNo = skip
    let presentItemCount = 0, itemCount = 0
   
    while (presentItemCount <= percount && pageNo <= limit) {

        try{

            await page.goto(config.DOMAIN_URL+`?page=${pageNo}&per-page=${percount}`, {
                waitUntil: 'networkidle0',
                timeout: 300000
            })
            
            await page.waitForSelector('#expired-domains-container > table > tbody', {timeout: 300000});
            
            await page.waitForSelector('#expired-domains-container > table > tbody > tr.expired-domains > td.td_sz_score > a.expand-btn', {timeout: 300000});
            
            const dropdown_buttons = await page.$$('#expired-domains-container > table > tbody > tr.expired-domains > td.td_sz_score > a.expand-btn');

            for(var i = 0; i < dropdown_buttons.length; i++){
                await page.evaluate(button => button.click(), dropdown_buttons[i])
                await new Promise((resolve, reject) => {setTimeout(()=>resolve(), 100)});
                await page.evaluate(button => button.click(), dropdown_buttons[i])
            }
            
            const items = await page.$$eval('#expired-domains-container > table > tbody > tr.expired-domains', elements => {
                return elements.map(element => {
                    let entry = {}
                    let cols = element.querySelectorAll('td')
                    entry.domain = cols[1]?.innerText
                    entry.source = cols[2]?.querySelector('a')?.getAttribute('href')
                    entry.source_type = cols[2]?.querySelector('a')?.querySelector('img')?.getAttribute('alt')
                    entry.source_link = cols[2]?.querySelector('a')?.getAttribute('href')
                    entry.tf = cols[3]?.innerText
                    entry.tf_link = cols[3]?.querySelector('a')?.getAttribute('href')
                    entry.cf = cols[4]?.innerText
                    entry.maj_bl = cols[5]?.innerText
                    entry.maj_rd = cols[6]?.innerText
                    entry.maj_topics = []
                    let _topics = cols[7]?.getElementsByTagName('span')
                    for(let i = 0; i < _topics.length; i++) {
                        entry.maj_topics.push({title: _topics[i]?.getAttribute('title'), count: _topics[i]?.innerText })
                    }
                    entry.maj_lang = {lang: cols[8]?.innerText, content: cols[8]?.querySelector('span')?.getAttribute('title')}
                    entry.site_lang = cols[9]?.innerText
                    entry.moz_da = cols[10]?.innerText
                    entry.moz_pa = cols[11]?.innerText
                    entry.age = cols[12]?.innerText
                    entry.sz_score = cols[13]?.innerText
                    entry.sz_redirects = cols[14]?.innerText
                    entry.sz_parked = cols[15]?.innerText
                    entry.sz_ahistory = cols[16]?.innerText
                    entry.sz_drops = cols[17]?.innerText
                    entry.google_index = cols[18]?.innerText
                    entry.outlinks_internal = cols[19]?.innerText
                    entry.outlinks_external = cols[20]?.innerText
                    entry.outdomains_external = cols[21]?.innerText
                    entry.sem_traf = cols[22]?.innerText
                    entry.sem_rank = cols[23]?.innerText
                    entry.sem_kw = cols[24]?.innerText
                    entry.date_added = cols[25]?.innerText
                    entry.price = cols[26]?.innerText
                    entry.expires = cols[27]?.querySelector('span')?.getAttribute('title')
                    return entry
                })
            })

            /**Scroll down */
            /** */

            const detailItems = await page.$$eval('#expired-domains-container > table > tbody > tr.row-details', elements => {
                return elements.map(element => {
                    let entry = {};
                    const sections = element.querySelectorAll('.domain-info .sz-tabs .content > section');
                    for(var i = 0; i < sections.length; i++) {
                        const section = sections[i];
                        const key = section.getAttribute('id');
                        switch(key) {
                            case 'archive':
                                {const archive = []
                                const previewElements = section.querySelectorAll('.screens ul li');
                                
                                for(var j = 0; j < previewElements.length; j++) {
                                    const previewElement = previewElements[j];
                                    const preview_link = previewElement.querySelector('a.preview')?.getAttribute('href');
                                    const preview_date = previewElement.querySelectorAll('div.text-center')[1]?.innerText;
                                    archive.push({link: preview_link, date: preview_date})
                                };
                                // console.log(archive)
                                entry.archive = archive;}
                                break;
                            case 'backlinks':
                                {const backlinks = [];
                                const backlinkElements = section.querySelectorAll('tbody tr');
                                for(var j = 1; j < backlinkElements.length; j++) {
                                    const backlinkElement = backlinkElements[j];
                                    const domain = backlinkElement.getAttribute('data-domain');
                                    const link = backlinkElement.getAttribute('data-url');
                                    const tds = backlinkElement.querySelectorAll('td');
                                    const comment = tds[0]?.querySelector('p span')?.innerText;
                                    const dr = tds[1]?.innerText;
                                    const ur = tds[2]?.innerText;
                                    const obl = tds[3]?.innerText;
                                    const anchor = tds[4]?.innerText;
                                    const tags = [];
                                    const tagElements = backlinkElement.querySelectorAll('ul li span');
                                    for(var k = 0; k < tagElements.length; k++){
                                        const tagElement = tagElements[k];
                                        const title = tagElement.getAttribute('title');
                                        const label = tagElement?.innerText;
                                        tags.push({title, label});
                                    }       
                                    backlinks.push({
                                        domain,
                                        comment,
                                        link,
                                        dr,
                                        ur,
                                        obl,
                                        anchor,
                                        tags
                                    })                            
                                }
                                // console.log(backlinks)
                                entry.backlinks = backlinks}
                                break;
                            case 'anchors':
                                {const anchors = JSON.parse(section.querySelector('canvas')?.getAttribute('data-content'));
                                entry.anchors = anchors}
                                break;
                            case 'titles':
                                {const titleElements = section.querySelectorAll('ul li')
                                const titles = [];
                                for(var j = 0; j < titleElements.length; j++){
                                   titles.push(titleElements[j]?.innerText)
                                }
                                entry.titles = titles}
                                break;
                            case 'redirects':
                                {const canvas = section.querySelector('canvas');
                                const data_red200 = JSON.parse(canvas.getAttribute('data-red200'));
                                const data_red300 = JSON.parse(canvas.getAttribute('data-red300'));
                                entry.redirects = {data_red200, data_red300}}
                                break;
                            case 'wordcount':
                                {const canvas = section.querySelector('canvas');
                                entry.wordcount = {data_words: JSON.parse(canvas.getAttribute('data-words')), data_hrefs: JSON.parse(canvas.getAttribute('data-hrefs'))};}
                                break;
                            case 'majestic':
                                {
                                    const content = section.querySelector('.tbl-wrapper')?.innerHTML;
                                    const url = section.querySelector('.view-domain a')?.getAttribute('href');
                                    entry.majestic = {url, content};
                                }
                                break;
                            case 'domain-drops':
                                {
                                    const divs = section.querySelectorAll('.dns-history .history > div');
                                    if(divs.length == 0){
                                        entry.domain_drops = {title: 'No data', events: []};
                                    }
                                    else {
                                        const title = divs[0]?.innerText;
                                        const domain_drops = []
                                        const eventElements = divs[1]?.querySelectorAll('div.row .event');
                                        for(let j = 0; j < eventElements.length; j++){
                                            const divs = eventElements[j].children;
                                            const time = divs[0]?.innerText;
                                            const event = divs[1]?.innerHTML;
                                            domain_drops.push({time, event});
                                        }
                                        entry.domain_drops = {title: title, events: domain_drops};
                                    }
                                }
                                break;
                            case 'google-index':
                                entry.google_index = section.innerHTML;
                                break;
                            case 'ranking-keywords':
                                entry.ranking_keywords = section.innerHTML;
                                break;
                            case 'langs':
                                entry.langs = section.innerHTML;
                                break;
                            case 'whois-history':
                                const h3 = section.querySelector('h3')?.innerText;
                                console.log(h3);
                                const statElements = section.querySelectorAll('div .whois-stat');
                                let stat_items = [];
                                for(let j=0;j<statElements.length;j++) {
                                    stat_items.push(statElements[j]?.innerText)
                                }
                                let whois_items = []
                                const whiosElements = section.querySelectorAll('div .whois-items .panel');
                                for(let j=0;j<whiosElements.length;j++) {
                                    const tag = whiosElements[j]?.querySelector('.panel-heading')?.querySelector('h4 a span.sz-text')?.innerText
                                    const content = whiosElements[j]?.querySelector('.panel-collapse .panel-body')?.innerHTML;
                                    whois_items.push({tag, content})
                                }
                                entry.whois_history = {title: h3, stats: stat_items, whoiss: whois_items};
                                break;
                            default:
                                break;
                        }
                    }
                    /** --- */
                    const score = element.querySelector('.main-section div.wrp > div')?.getAttribute('data-score');
                    const score_help = element.querySelector('.main-section div.wrp > p.check-history > a')?.getAttribute('data-content');
                    const metrics = element.querySelector('.main-section .sz-domain-metrics')?.innerHTML;
                    return {
                        main_section: {
                            score: score, help: score_help, metrics: metrics
                        },
                        sections: entry
                    }
                })
            });

            presentItemCount = detailItems.length
            for (let i = 0; i < presentItemCount; i++){
                const line = {i: items[i], j: detailItems[i]}
                fs.appendFileSync(filename, JSON.stringify(line)+'\n');
            }
            itemCount += detailItems.length
            
            // await page.close();
        }catch(err){
            console.log(err)
        }
        pageNo = pageNo + 1
    }

    // /** GET LINK */
    // for(let i = 0; i < fetchedLinks.length; i++){
    //     let link = fetchedLinks[i]
    //     let entry = fetchedItems[i]

    //     // if(entry.source_type == 'ccTLD (Country Domains)'){
    //     //     await page.goto(link, {timeout: 300000})
    //     //     await page.waitForSelector('table', {timeout: 300000})
    //     //     let source_entries = await page.$$eval('body > div.wrapper > section > div > div > fieldset > table > tbody > tr', elements_ => {
    //     //         return elements_.map(element_ => {
    //     //             console.log(element_)
    //     //             let entry_ = {}
    //     //             let cols_ = element_.querySelectorAll('td')
    //     //             entry_.from = cols_[0]?.innerText
    //     //             entry_.new = cols_[1]?.innerText
    //     //             entry_.renew = cols_[2]?.innerText
    //     //             entry_.transfer = cols_[3]?.innerText
    //     //             return entry_
    //     //         })
    //     //     })
    //     //     entry.source = source_entries
    //     // }
        
    //     fs.appendFile(filename, JSON.stringify(entry)+'\n', err => {
    //             if (err) throw err;
    //             console.log(';)');
    //     });
    // }
}

const fetchCount = async (page) => {
    return await page.$eval('#expired-domains > div > div.kv-panel-before > div.row > div > div.pull-right > div', element => {
        let formattedNumber  =  element?.innerText.split(' ')[0]
        return Number(formattedNumber.replace(/[,|.]/g, ""));
    })
}

const main = async () => {
    try{

        const parameterArgs = process.argv.slice(2);
        const mode = parameterArgs[0];
        // const browserURL = 'http://127.0.0.1:21222'
        // const browser = await puppeteer.connect({browserURL})

        const browser = await puppeteer.launch({
                headless: false
        })

        const page = await browser.newPage()
        // await page.setViewport({
        //     width: 1200,
        //     height: 800
        // });

        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.resourceType() === 'video' || request.resourceType() === 'image' || request.resourceType() === 'stylesheet' || request.resourceType() === 'fetch' || request.resourceType() === 'font') {
            request.abort();
            }
            else {
            request.continue()
            }
        })

        await doLogin(page)
        console.log('success to login')

        let page_start = 0

        if(mode == 'schedule'){

            fs.readFile(filepath, 'utf8', (err, data) => {
                if (err) throw err;
                page_start = parseInt(data);
            });

            await fetchUpdatedData(page, page_start)
            
            await page.close();
            console.log('success to scraping')
            const childProcess = spawn('node', ['spamzilla_save_update_data.js'], {
                shell: true,
                detached: true,
                stdio: 'ignore'
            });
            childProcess.unref();
            console.log('success to update db')
        }
        else
            await fetchAllData(page)
    }catch(error){
        console.log(error)
    }
    
}

main()