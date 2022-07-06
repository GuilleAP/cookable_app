const puppeteer = require('puppeteer');
var now = require("performance-now")


module.exports = async (ingredients) => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.capraboacasa.com/portal/es', {waitUntil: 'domcontentloaded'});
    console.log('pagina cargada')
    let matches = [];
    for(let ingredient of ingredients){
      await page.waitForSelector('input[name=search]');
      console.log('search trobat')
      await page.$eval('input[name=search]', (el, ingredient) => {
          el.value = ingredient;
      }, ingredient);
      console.log('Ingredient introduït')
  
      await page.waitForSelector('.search-button');
      await page.evaluate(selector=>{
          return document.querySelector('.search-button').click();
      })
      console.log('clicked');
      await page.waitForSelector('.ellipsis');
      console.log('classe .ellipsis" trobada')
      matches.push(await page.evaluate(() =>
      [document.querySelector(".ellipsis").innerText,
      document.querySelector(".product-price").innerText]
      ));
    }
    await browser.close();
    console.log('web-scraping done')
    console.log("🚀 ~ file: caprabo-web-scraper.js ~ line 36 ~ module.exports= ~ matches", matches)
    return matches;
};


// (async() => {
//     const startTime = now();
//     const res = await asyncFunc();
//     const endTime = now();
    
//     const timeTaken = endTime - startTime;
    
//     console.log(`Time taken to perform addition =
//             ${timeTaken.toFixed(3)} milliseconds`);
//   })();
