const puppeteer = require('puppeteer');
module.exports = async (ingredients) => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let matches = [];

    for(let ingredient of ingredients){
      await page.goto(`https://www.carrefour.es/?q=${ingredient}`, {waitUntil: 'domcontentloaded'});
      console.log('pagina cargada')
    //   await page.waitForSelector('input[name=search]');
    //   console.log('search trobat')
    //   await page.$eval('input[name=search]', (el, ingredient) => {
    //       el.value = ingredient;
    //       console.log("🚀 ~ file: mercadona-web-scraper.js ~ line 14 ~ awaitpage.$eval ~ el.value", el.value)
    //   }, ingredient);
    //   console.log('Ingredient:',ingredient, ' introduït')

      await page.waitForSelector('.ebx-result-title');
      console.log('classe .ebx-result-title trobada')
      matches.push(await page.evaluate(() =>
      [document.querySelector(".ebx-result-title").innerText,
      document.querySelector(".ebx-result-price__value").innerText]
      ));
    }
    await browser.close();
    console.log('web-scraping done')
    console.log("🚀 ~ file: carrefour-web-scraper.js ~ line 30 ~ module.exports= ~ matches", matches)
    return matches;
};
