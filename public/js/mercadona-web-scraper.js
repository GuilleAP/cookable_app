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
      await page.goto(`https://tienda.mercadona.es/search-results?query=${ingredient.product}`, {waitUntil: 'domcontentloaded'});
      console.log('Mercadona website loaded')
      await page.waitForSelector('.product-container');
      console.log('classe search-results__header trobada')
      matches.push(await page.evaluate(() =>
      [document.querySelector(".product-cell__description-name").innerText,
      document.querySelector(".product-price__unit-price").innerText]
      ));
      if(!ingredient.update){
        Product.create({
          tag: ingredient.product,
          supermarket: 'Mercadona',
          description: matches[i][0],
          price: matches[i][1],
          date: date
        })
      }else{
        await Product.findOneAndUpdate({tag: ingredient.product, supermarket: 'Mercadona'}, {price:  matches[i][1], date: date});
      }
    }
    await browser.close();
    console.log('web-scraping done')
    return matches;
};
