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
let start_date = null;
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

async function launchBrowser(name, value) {

    let Digital_Token = null;
    let RecaptchaResponse = null;
    let Cookie = null;
    let newResponse = null;
    let BasicPayload = null;
    let NewPayload = "";

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
                // console.log("request >>> ", request.headers())
                
                BasicPayload = request.postData();
                // console.log("Payload >>> ", BasicPayload);
                
                if(BasicPayload) {
                    Digital_Token = request.headers()['digital-token'];
                    // console.log("Digital Token >>> ", Digital_Token);
                    Cookie = request.headers().cookie;
                    // console.log("Cookie >>> ", Cookie);
                    RecaptchaResponse = request.headers()['g-recaptcha-response'];
                    // console.log("Recaptcha Response >>> ", RecaptchaResponse);

                    const payloadElements = BasicPayload.split(",");
                    for (index in payloadElements) {
                        // console.log(">>>>>>>>>>>>>>>>>>>>>>>>> ", payloadElements[index]);
                        if(payloadElements[index].indexOf("pickInfo") > 0) {
                            payloadElements[index] = '"pickInfo":"'+ searchKey +'"';
                            // console.log(">>>>>>>>>>>>>pickInfo>>>>>>>>>>>>>>>>> ", payloadElements[index]);
                        };
                        if(payloadElements[index].indexOf("pickDate") > 0) {
                            payloadElements[index] = '"pickDate":"'+ start_date +'"';
                            console.log(">>>>>>>>>>>>>>start date>>>>>>>>>>>>>>>> ", start_date);
                        };
                        if(payloadElements[index].indexOf("dropDate") > 0) {
                            payloadElements[index] = '"dropDate":"'+ end_date +'"';
                            // console.log(">>>>>>>>>>>>>>>end date>>>>>>>>>>>>>>> ", payloadElements[index]);
                        };
                        NewPayload = NewPayload + payloadElements[index];
                    }
                    
                }
            }
        }
        request.continue();
    });
    
    // Navigate to a page that triggers AJAX requests
    await page.goto('https://www.avis.com', {
        timeout: 300000
    });

    // Delay function
    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    
    // Delay for 10 seconds
    // await delay(3000); // 10,000 milliseconds = 10 seconds
    // console.log('step 1')
    // /html/body/div[4]/section/div[2]/div[1]/span
    let modalXPath = '/html/body/div[4]/section/div[2]/div[1]/span';
    try {
        const [modalClose] = await page.$x(modalXPath);
        await modalClose.click({timeout:300000});
    } catch (error) {
        console.log(error);
    }
    
    // Delay for 10 seconds
    // await delay(3000); // 10,000 milliseconds = 10 seconds
    
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
        element.value = "10/15/2023";
    });
    
    // Delay for 10 seconds
    await delay(3000); // 10,000 milliseconds = 10 seconds
    const endDateField = await page.waitForSelector('#to', {timeout: 300000});
    // console.log('step 2', endDateField)
    await endDateField.click({timeout: 300000});
    
    // Delay for 10 seconds
    await delay(3000); // 10,000 milliseconds = 10 seconds
    const endDateXPath = '//*[@id="ui-datepicker-div"]/div[3]/table/tbody/tr[1]/td[4]/a';
    const [end_day] = await page.$x(endDateXPath);
    await end_day.click({timeout: 300000});
    
    // Delay for 10 seconds
    await delay(3000); // 10,000 milliseconds = 10 seconds
    
    const findButton = await page.waitForSelector('#res-home-select-car', {timeout: 300000});
    await findButton.click({timeout: 300000});
    // console.log(">>> submit button clicked successfully !!!");
    
    // Perform actions that trigger AJAX requests
    
    // Delay for 10 seconds
    await delay(10000); // 10,000 milliseconds = 10 seconds
    
    console.log(">>> digital token >>> ", Digital_Token);
    console.log(">>> recaptcha response >>> ", RecaptchaResponse);
    console.log(">>> cookie >>> ", Cookie);
    console.log(">>> NewPayload >>> ", NewPayload);
    fetch("https://www.avis.com/webapi/reservation/vehicles", {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "action": "RES_VEHICLESHOP",
          "bookingtype": "car",
          "channel": "Digital",
          "content-type": "application/json",
          "devicetype": "bigbrowser",
          "digital-token": Digital_Token,
          "domain": "us",
          "g-recaptcha-response": RecaptchaResponse,
          "initreservation": "true",
          "locale": "en",
          "password": "AVISCOM",
          "sec-ch-ua": "\"Google Chrome\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"117\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "username": "AVISCOM",
          "cookie": Cookie,
          "Referer": "https://www.avis.com/en/home",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "{\"rqHeader\":{\"brand\":\"\",\"locale\":\"en_US\"},\"nonUSShop\":false,\"pickInfo\":\"SHR\",\"pickCountry\":\"US\",\"pickDate\":\"10/15/2023\",\"pickTime\":\"12:00 PM\",\"dropInfo\":\"SHR\",\"dropDate\":\"06/30/2024\",\"dropTime\":\"12:00 PM\",\"couponNumber\":\"\",\"couponInstances\":\"\",\"couponRateCode\":\"\",\"discountNumber\":\"\",\"rateType\":\"\",\"residency\":\"US\",\"age\":25,\"wizardNumber\":\"\",\"lastName\":\"\",\"userSelectedCurrency\":\"\",\"selDiscountNum\":\"\",\"promotionalCoupon\":\"\",\"preferredCarClass\":\"\",\"membershipId\":\"\",\"noMembershipAvailable\":false,\"corporateBookingType\":\"\",\"enableStrikethrough\":\"true\",\"picLocTruckIndicator\":false,\"amazonGCPayLaterPercentageVal\":\"\",\"amazonGCPayNowPercentageVal\":\"\",\"corporateEmailID\":\"\"}",
        "method": "POST"
      })
      .then(response => {
          if (response.ok) {
          return response.json(); // assuming the response is in JSON format
          } else {
          throw new Error("Request failed with status " + response.status);
          }
      })
      .then(data => {
          // handle the response data here
          console.log(data);
      })
      .catch(error => {
          // handle any errors that occurred during the request
          console.error(error);
      });

    // //----------------------------------------------------------
    fetch("https://www.avis.com/webapi/reservation/vehicles", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "action": "RES_VEHICLESHOP",
            "bookingtype": "car",
            "channel": "Digital",
            "content-type": "application/json",
            "devicetype": "bigbrowser",
            "digital-token": "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..za0ew3xo_SjKXV1D.qt1ZLOASwKjJaFKHZ9WmZXY0zzCSoAEHsKvLYLK2gkfCyv5xbTtnnGQ9ra3S1h6nCQUZvUcN0h-t9C5iechwlufMgu3S7iR7nryA-eVKNj7KYujaCZfNeVFd_aGtWjhWzsqXPuWbpJPsPerS5H3PkkLsw9Ld3XXtWo4NEFQ9BdrZIqNbFcwjesF5yycruvA9y78qE9qJtg2qzw_qRQblhCOSaFvf1uHQ-omuscWcpepWm1W7ljj1TxlyuzUH__nbix8ET4TjHWzx-sf4u4J6am1Dg2WpHU9wvIp1SnDE1Mv3aRq2E5k_qAFKjOpQxeqddf0ic5oSeSI2xPCyFDH3_dv1NRMidBuDT5vrDBFA-qNCdYxtm3ByXa8zToTVuEaVq2NgSEuuEC8LdpIUK7OmaSPKhSTUQ8GJ0vQfhV-trdJSqQSY9b-RgCpPjyUK9z7MM2lr8abgra-dKqV6W_0_bPg5lc0CyslZufUHUmMKFmjX7X71a4FPKeY9z42L34_f5ZxFLKs1j3Ibp_znHXpXEhMLu1pyDnvsiSp1rirCeYiUqWqgC2nmrfxDVKYV-xbPp5UH1rSZMAdDVby-JpAzXjpkwS04DoH51hu-KzhZfs1wVOE5mI9bLob-C2ES-PCaZcYWJVv1eJFJ2A9CbI5LzVvCP-i39rzWTZ6Jpa-dUdoLFM7Rdlng0cz05dvICkM7_YLZf408dBDuFXo86isMpYWgHrSYbm2F0kGn8Lg_pHFZ3bryxhdvnX3m_LpZCKaV7bvUuTPgZnkaF3zOk1RLHOBL-uIhkFsqFEmNxkrXmFHNV39WS5Gs435aDBxf00oNk6yzYfV11em7j-UZkkfY6DT_lA05k_5MeW6fGNsUFW-sLzkyzzn0TbEeo6wJQ7JU0okfGOwXsFB5GWl4Dtn4ZmC7KiSio4vdIClNh7VxGw5h-em6wpvqPNc7wo8abAoyaPb28tOlNBhoqt4PBHwB1xIZ-_ENcfcdtt0z49ZvOAczXQrTftaS-LoYyBn4YmwjEen13wpw34GDmSLuXmcnBoG-tjPqbzgtcNpDge9vmsMMI1-Gc-8d0jOE79sSSObuyc5P8kPzO3ynuaZ4_bdVM5M-lAhU5aF6KAfhqBzXcQNeH8nypknwtWjzfliBUxZVwdZp2uLelQPOOyUTGtN9TdYLl6smfI5n2mp972y18bWa7noyHssqTBMW4HCWHLLq4M3YxqsS3GEXWUTTJCDgOmCKc1rNLM_nRN9-eoDZEmR44bQwPiss3Udm4tNYDnDaB2aqxdmdiFVknC4WfOxiM8ESwDoStJq2qT_Q0GTpAeYDjZbwOWiWkdJP-B3J4yPLkq2_KBEESiOJw7OE0Fd4CM8RzH9rmbIG63aa3BhF5qyWAcwfgvjEjja7Dj70rvOcGUEXVMVaK6qirfUdQfSJrJfSPno.b9YIR6jJTocSMxv8EFDoKQ",
            "domain": "us",
            "g-recaptcha-response": "03AFcWeA4smDonCeNzzSmZGKqDyTVjuAQqCajRtCcuT_SCV-uDCjVV8pjy_9VWonlL1-dOqR_f84jkCG8mnAuc1oenuqnrcYxsk5XI9zAlPh9jecd45bUfqDsoiF8lz5qMy9N8ecgt2Xqs2wc6L6GBysk4AadlOVILhUVoKieflToo8seKWcJLuyLLZEFrxas0LOajz0-HuegCsSPzW_VdFsv_iPbwPu3MmmdIPPb1c-G53DDGHVV-Ja5DIlEaPm3THPqiZqDqxKh3k2F-dOagZpFOlk2ayDfS--tlWUgAXRspamu4k43HmM8fw_W996IpAPDB2h5g77Ogejn5ad_sn22Zt8fBKRQO-cZmxixFlJz9x55QWvt_BSGCiCLa6skICJCh4A0nCcNFiD6XchA6dKcA5pUqmfLMABhLUO14gp0aAscFOXPeve_P_vhI0gYy2jySNVvHviU6JdewPLZd0rf1YZv6GDa9IknoXquX3U3TNfi-yfIYvTu61CypSbV2SWcxNd2EzJTMnabbbECUNUJIEyk7MlPrTHtf291PGHK5KgB2kt2xX4zklTeaByqpHHWyxmSVD2NPizTVfOLRVzuCGXNLALoAiFYHAcm3-xsH_faPfEcBkarMQiKOoTJouEoO_toYrdy_Yc8AuiwYeMqtCZ_oFLB2yTN6XwSwyl-lpdXVa8bg5TUfRnzDsrrZbmL7C4i5qqs-8kEwBipBzSMqJ-KQLXygVHNl0iXmrgdS1ue7nHS8fZei-AinmzHJJvUVtIEwqLmmUTjLi1mdNyf0Xsyqc_Jbcs6CVtAxXddesbgp0hMFpopuVEbhGm1Y-bLK_I7U_hiy7su-rU9vli1PFHy4zg4VOj9p6exDCeu-6pDEdmGBADtInGP6Mz5UmgvhQc8TPACYO90Mjp-XPgdO_AmLmgzz64rSegopCZzWKSFGmms2x4MNhW2hKDjAm6TxEbDliv7t5tAcd6QGV98hqjSitMubMVcOpMdV8DabOFVcp_5mVw5YuFRQ4JoqN5VaiTwzHILGzAymu3moMpj6lFx6yPnt5QWJxYsK_CZNhH-XXQReKNmXHRgLIjmtVPKeWnENpZroW9htUgMFe9PJMbkVlbF7yTJ428RtVWVC9Mw99OztDp02TQNu2jimPThaOfQkJJBqVk-T0Mn8-xvEcdaCYd5BaL3TQT1Ixv_UdMtA6RWE5WHt8kXNZ-vtEdMEgmDHxLOkePCmiv2DhYqO4dfjYTaTiLPjWvVj8JYUT22OZffFfqJmZSs_XR7JBxC7QIvU2LGs656YMjVfqUsGLZYGzOG__mXh-9yoMk_ZqNVcvDOGpPBrxc_m18QkpXM1UMpvupCLn6PiVYanq_cxjF75O8cRbmODiZuC_4zbNQejiKpg7Q3eb1HFZZpQWgLvju28oiBBPKRMWM6F-QX61fqG7DPqnrg3Vxjyn9GSIrg3cGI76MXrVwlWRn9NNdBpj0MbTGUn4npuSPn7Wf0gnokjD1BrM5RVGyc7Pf2v7N3b_X3h2sbD4YB21OjJki6X_l8pk1TZ8SieQcdtP6ncfdr6vxbBsImuB0PShT8oy-GV2k_-DMDicFoRX9T0gcfrp2DGxGy4VA975gDtw7zrtDLGJVrXrkGxBAC0x_nUG-ewBLqNeF7hToGZAuar4Nv2dvPs9CybhbLWPEvog2G5GUDzo1izHRxLOEr5jyKAVziUlgiGx4qssDJWQPkytcTL5r0ZjEjlctlj0wd7BhkopOHv6FYb9lljb_LD9TT_rtEWSH4GnV9XtZsxvQUaiXTJR7xjzVd1_B0_saMj-GxLGofkIuZA0KfzmNxHgFG5BMNIPF8draHI5ZnZZCksI6_BEKhG2ZUHfj8qA3U9PHYkHJNjNVMTEJoaHren9QeAX81m6eSnsbMl5ynY4oIUH1r1Je5wQWcag7t8GuIsPBRvhrH8hjpKrq7eV1jmqfc5PTVULFrzYOYT49IS-_CwwbU-WA2p7UzWSV80KVs7m9NJU44_naDRRg1j5658wAzRhlqdkAtXee41llg-6yNvT5R5Xy5onPbQJCxzRtj6jHUj9l5qgD5misA4PnZh7m3tmjg7WeH6yyxfS8qwnWBIyzOo2lzc5YLXNzW6VfiVEewcJspYLvYmIIc8WWj3nejzSVaml9x-rcZo__gbxJnu4CLE3q4tPw1I86QuwpYHa0N-bRZi0TTUYPsmcLZUNth_YvoevLIvtfuVvEmUmZcUPH9A8N7Al7hQ3gxPmqwdM-9QrSFYlzGlCs5D7u3gt8H7xeNkwldCHNQatMdDi8d1XMRzYWeQ_YWtRgh_A-9jHdweoW29ATFKkWviZBNKuAlE_aSyOH_Yn2x1n082hSoCllkb1vIXkjOo5hrB93vSg8LUWqTpxkx3dyUTgoTNIDUSMnpz0KuwDNUn58kSoxD94zeF0TZ2b3A9cf54NC17URWa4oH38HO07VsGKllEtGbEGTfSai_oqWphkuMIhHZe-qqS7DyeXwhNj16XPsOi54JDdWusmlGeqy6zRWe6dHDZAgeGK4ATzPwBpIT1hPEEKdXDk9hyLrAJF6APr3Wh5XSyLHmbOGrsCzAmZVs2oZrWlMH4831FHRBW7uM_0r020wlFUm73Y19AEUx4zxnNl8WyQSqvt9Eu7L1diwmryUH2zP9ZWEpJBrfuvPartsaZFUFViSWSCET8jCw_0Q6m6_ptkALJ8UVenPDAREeEUDGNTFxaKwVygN6HgLBaq95uJlGzg-zQcO9bgq8hN_1Ri_YbwdilR7dwt__rPE9iuThdBClRBgGA_MuoPNEtoLBLXovyKMpC0g6l5KqC0Bw-IUHKa1Y13HtvQmhU4v9Ggbe432NwYizBj4U7u2jzvM3Ascp20OcHbl9d5FjJzf0NXq9HrutNqgpe4YXKPqqsQAmKT20UO48XgkR6bEcR3vUgnZ1rVtHVaxlAqGBQUOjGx0kZEQZ6jQdaHcP4jf-CYjBEWqcYP1UwOsL6rc3ex4cA13C7FWnuTGcKrK3Mib52qv7yPO0h_IcN1ipSOeksmYdhA3xzWaE5jt87C8dT0FfBAXtgRJdD5sb9Nwp80Ca4B1_LRBiwY2oaqruxXBh24WVkf3JO1VB4VVn6PC66dxx5QgHkbBpVykV7J1pWVAUitU1wjnn08gGr9tbEehKZ9RJNnXpiZfhWy3vNNpOsFlU_SgAMU2bB9300cQfyg1d8HXvVdi7fxhJonsB-mKSSwU6Vf-vX9AyBsOESAb2PC0AMVvnv1d7tp9tSIDRm325reJzwS9T0UOGp6pAKwv42PtPnsLwlacKFZZHStR117UxudwAuSjz98xwI8wrq1sZSTeo6Pk6bagcpZh0gkEApNTavM6FCMCj5MTBwAJCgf2gThyVytjBhLyTRQwMOycTJrsU2hPu7TASdQZitLnx5wv3-k0XLXB-orcrBIGFoJiH8BMLo_RUSWlrjvQ2vtoTAzMXu3tA3CG7VZld5LLzV9O0KH6pZ4g4yDdXDQeY1JDIMD9PIPlGkxcq5oOPLRoE9AmgtBFUHasdlHql3YHuG0fy6KVRi8F48Exid1cQih4Y6todPgiCKvWDZtFdV4I38MIXQ_Xs5VzBINzEhAQ_kfS6UbqLllGJ3xOrqswpfCuEsRUyxQhqm8a8jOJydyXV0M4z-LfXW9YUKTQ3rTwRPOpZg57-XNa4M1ygzwhjrGjlGkQILvw-7XjZcjQNlBgdPqPR4E6Oaj7evwQQdn9Z6CyjuAZGvs3ALv8LVzrkPbuqn0KG8MaCMutWRU2lOHD6LUC27O8RiNJw6eaq6GvplzLcbsPO3BMwNeUtSB5mliMGH21h_aVVb31hoDJtAqZ15vwmMzlOpIoExQlB1fuxgmZWzQcE1ZCD8JIc",
            "initreservation": "true",
            "locale": "en",
            "password": "AVISCOM",
            "sec-ch-ua": "\"Google Chrome\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"117\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "username": "AVISCOM",
            "cookie": "visitorId=cdal-A4c432a4c-99d6-4587-9a08-71f604f8f783; datacenter=cdal; APISID=23cecdd2-e21d-4e1a-8cae-0ae9371ce6aa; digital-token=a38722d7-ae80-4b7b-a21c-2e7a0b1f9795-02-cdal-ho4233; JSESSIONID=sDR-Yq7GRS3Vy5sJmEFzZJGmp_2X4wGW6mFTjA2b.d10vprecmapp02; optimizelyEndUserId=oeu1697078508427r0.028998306312662425; _gcl_au=1.1.2075858603.1697078509; _pxvid=e4c80976-68a8-11ee-b704-893a15cc44bb; __qca=P0-1196103397-1697078509745; _fbp=fb.1.1697078510506.1720146879; __idcontext=eyJjb29raWVJRCI6IjJXZTIxcnRRd1dWQWJPTHVqajVTd25DVmVpTCIsImRldmljZUlEIjoiMldlMjFvR1RWZTdVemlwQ1I0YmV0bnZRTU5zIiwiaXYiOiIiLCJ2IjoiIn0%3D; QuantumMetricUserID=bad09e341be29cf848a126f2e1582601; OptanonAlertBoxClosed=2023-10-12T11:38:37.010Z; _pxhd=80553d246325c0c92db449a520b53456e81d79806b1653c993dfda854270b855:e4c80976-68a8-11ee-b704-893a15cc44bb; _gid=GA1.2.854616283.1697254895; _clck=v67w3x|2|ffu|0|1380; region=euwest1; SessionPersistence=PROFILEDATA%3A%3DauthorizableId%253Danonymous; akaalb_production_config=~op=avis_euwest1_webapi_private_lbid:avis-webapi-euwest1-aws|avis_com:avis-us-dal|~rv=77~m=avis-webapi-euwest1-aws:0|avis-us-dal:0|~os=7f956ca2417c5e686d715889b6a30f65~id=bdc38c2eaea7e11bb5a31a572ef4b88a; pxcts=dcefb40b-6a57-11ee-8907-6cdf86c9a91a; QuantumMetricSessionID=5af3fec9c95c607a66ace22626da0aa9; _gat_UA-6997633-3=1; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Oct+14+2023+14%3A57%3A19+GMT%2B0000+(Coordinated+Universal+Time)&version=202306.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&landingPath=NotLandingPage&groups=C0004%3A1%2CC0001%3A1%2CC0002%3A1&AwaitingReconsent=false&geolocation=%3B; _ga=GA1.2.60142106.1697078510; _px2=eyJ1IjoiZjkxYjAzMDAtNmFhMS0xMWVlLTgyNGMtMWZmMTAzMDg5Yzc0IiwidiI6ImU0YzgwOTc2LTY4YTgtMTFlZS1iNzA0LTg5M2ExNWNjNDRiYiIsInQiOjE2OTcyOTU3NDM0NjAsImgiOiI2ZmQzOTE4NzM0MmM2MGExYmJhMjE4MDk2ZWY5MmE0MWYzMWE2ZDlkOTVhNjUwMDY2MTdjOTA5MTI1ZDQ5NWU2In0=; _uetsid=96c568a06a4311ee9c93555df5b05e44; _uetvid=e4caba5068a811eeb1b53fc7edf57bbc; _clsk=4k1thq|1697295444630|16|0|s.clarity.ms/collect; RT=\"z=1&dm=avis.com&si=bdca0778-6fca-4354-94a6-d48c5a70c796&ss=lnq2vtaf&sl=b&tt=w16&bcn=%2F%2F02179916.akstat.io%2F&ld=2zz83&nu=43hl6rgh&cl=306e7\"; _ga_GV632QC56N=GS1.1.1697290403.13.1.1697295451.46.0.0",
            "Referer": "https://www.avis.com/en/home",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "{\"rqHeader\":{\"brand\":\"\",\"locale\":\"en_US\"},\"nonUSShop\":false,\"pickInfo\":\"SHR\",\"pickCountry\":\"US\",\"pickDate\":\"10/15/2023\",\"pickTime\":\"12:00 PM\",\"dropInfo\":\"SHR\",\"dropDate\":\"06/30/2024\",\"dropTime\":\"12:00 PM\",\"couponNumber\":\"\",\"couponInstances\":\"\",\"couponRateCode\":\"\",\"discountNumber\":\"\",\"rateType\":\"\",\"residency\":\"US\",\"age\":25,\"wizardNumber\":\"\",\"lastName\":\"\",\"userSelectedCurrency\":\"\",\"selDiscountNum\":\"\",\"promotionalCoupon\":\"\",\"preferredCarClass\":\"\",\"membershipId\":\"\",\"noMembershipAvailable\":false,\"corporateBookingType\":\"\",\"enableStrikethrough\":\"true\",\"picLocTruckIndicator\":false,\"amazonGCPayLaterPercentageVal\":\"\",\"amazonGCPayNowPercentageVal\":\"\",\"corporateEmailID\":\"\"}",
        "method": "POST"
    });
    // //--------------------------------------------------------------
      
    // await browser.close();
}

launchBrowser()
    .then(res => console.info('end---> ', res))
    .catch(err => console.error('err--->', err));
