const puppeteer = require('puppeteer');
const Product = require("../../models/Product.model")

module.exports = async (ingredients) => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let matches = [];

    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();
    date = year + "/" + month + "/" + day;

    for(const [i, ingredient] of ingredients.entries()){
      await page.goto(`https://www.carrefour.es/?q=${ingredient.product}`, {waitUntil: 'domcontentloaded'});
      console.log('Carrefour website loaded')
      await page.waitForSelector('.ebx-result-title');
      console.log('classe .ebx-result-title trobada')
      matches.push(await page.evaluate(() =>
      [document.querySelector(".ebx-result-title").innerText,
      document.querySelector(".ebx-result-price__value").innerText]
      ));
      if(!ingredient.update){
        Product.create({
          tag: ingredient.product,
          supermarket: 'Carrefour',
          description: matches[i][0],
          price: matches[i][1],
          date: date
        })
      }else{
        await Product.findOneAndUpdate({tag: ingredient.product, supermarket: 'Carrefour'}, {price:  matches[i][1], date: date});
      }
    }
    await browser.close();
    console.log('web-scraping done')
    console.log("🚀 ~ file: carrefour-web-scraper.js ~ line 30 ~ module.exports= ~ matches", matches)
    return matches;
};
