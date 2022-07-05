const puppeteer = require('puppeteer');
var now = require("performance-now")


module.exports = async (ingredients) => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://supermercado.eroski.es', {waitUntil: 'domcontentloaded'});
    console.log('pagina cargada')
    let matches = [];
    for(let ingredient of ingredients){
      await page.waitForSelector('input[name=searchTerm]');
      console.log('search trobat')
      await page.$eval('input[name=searchTerm]', (el, ingredient) => {
          el.value = ingredient;
      }, ingredient);
      console.log('Ingredient introduït')
  
      await page.evaluate(selector=>{
          return document.querySelector('.search-button').click();
      })
      console.log('clicked');
      await page.waitForSelector('.product-description');
      console.log('classe product-description trobada')
      matches.push(await page.evaluate(() =>
      [document.querySelector(".product-title > a").innerText.split(","),
      document.querySelector(".price-offer-now").innerText.replace(/,/g, "'")]
      ));
    }
    await browser.close();
    console.log('web-scraping done')
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
