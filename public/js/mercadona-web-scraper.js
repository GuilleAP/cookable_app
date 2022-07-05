const puppeteer = require('puppeteer');
module.exports = async (ingredients) => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let matches = [];

    for(let ingredient of ingredients){
      await page.goto(`https://tienda.mercadona.es/search-results?query=${ingredient}`, {waitUntil: 'domcontentloaded'});
      console.log('pagina cargada')
    //   await page.waitForSelector('input[name=search]');
    //   console.log('search trobat')
    //   await page.$eval('input[name=search]', (el, ingredient) => {
    //       el.value = ingredient;
    //       console.log("🚀 ~ file: mercadona-web-scraper.js ~ line 14 ~ awaitpage.$eval ~ el.value", el.value)
    //   }, ingredient);
    //   console.log('Ingredient:',ingredient, ' introduït')

      await page.waitForSelector('.product-container');
      console.log('classe search-results__header trobada')
      matches.push(await page.evaluate(() =>
      [document.querySelector(".product-cell__description-name").innerText,
      document.querySelector(".product-price__unit-price").innerText]
      ));
    }
    await browser.close();
    console.log('web-scraping done')
    return matches;
};
