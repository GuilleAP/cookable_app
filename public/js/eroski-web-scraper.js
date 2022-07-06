const puppeteer = require('puppeteer');
var now = require("performance-now")
const Product = require("../../models/Product.model")


module.exports = async (ingredients) => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://supermercado.eroski.es', {waitUntil: 'domcontentloaded'});
    console.log('pagina cargada')
    let matches = [];

    let date = new Date();
    let year = date.getFullYear()+1;
    let month = date.getMonth()+1;
    let day = date.getDate();
    date = year + "/" + month + "/" + day;

    for(const [i, ingredient] of ingredients.entries()){
      await page.waitForSelector('input[name=searchTerm]');
      console.log('search trobat')
      await page.$eval('input[name=searchTerm]', (el, ingredient) => {
          el.value = ingredient.product;
      }, ingredient);
      console.log('Ingredient introduït')
  
      await page.evaluate(selector=>{
          return document.querySelector('.search-button').click();
      })
      console.log('clicked');
      await page.waitForSelector('.product-description');
      console.log('classe product-description trobada')
      matches.push(await page.evaluate(() =>
    //   [document.querySelector(".product-title > a").innerText.split(","),
        [document.querySelector(".product-title > a").innerText,
      document.querySelector(".price-offer-now").innerText.replace(/,/g, "'")]
      ));
      if(!ingredient.update){
        Product.create({
          tag: ingredient.product,
          supermarket: 'Eroski',
          description: matches[i][0],
          price: matches[i][1],
          date: date
        })
      }else{
        await Product.findOneAndUpdate({tag: ingredient.product, supermarket: 'Eroski'}, {price:  matches[i][1], date: date});
      }
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
