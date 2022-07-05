const puppeteer = require('puppeteer');
const writeFileSync = require("fs").writeFileSync;
var now = require("performance-now")


module.exports = async (ingredient) => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://supermercado.eroski.es/en/supermarket/2059698-fresh/2059710-vegetables-and-leafy-vegetables/', {waitUntil: 'networkidle0'});
    console.log('pagina cargada')

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

    const matches = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".product-description")).map((product) => [
      product.querySelector(".product-title > a").innerText,
      product.querySelector(".price-offer-now").innerText.replace(/,/g, "'")
    ])
  );
//   writeFileSync("./data/data.seed.json", JSON.stringify(matches));

    await browser.close();
    console.log('web-scraping done')
    return JSON.stringify(matches);
};


// (async() => {
//     const startTime = now();
//     const res = await asyncFunc();
//     const endTime = now();
    
//     const timeTaken = endTime - startTime;
    
//     console.log(`Time taken to perform addition =
//             ${timeTaken.toFixed(3)} milliseconds`);
//   })();
