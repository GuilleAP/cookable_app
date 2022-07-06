const puppeteer = require("puppeteer");
const Product = require("../../models/Product.model");

module.exports = async (ingredients) => {
  // try{
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let matches = [];

  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  date = year + "/" + month + "/" + day;

  let canContinue = true;
  for (const [i, ingredient] of ingredients.entries()) {
    canContinue = true;
    await page.goto(`https://www.carrefour.es/?q=${ingredient.product}`, {
      waitUntil: "domcontentloaded",
    });
    console.log("Carrefour website loaded");
    await page
      .waitForSelector(".ebx-result-title", { timeout: 5000 })
      .catch((e) => (canContinue = false));
    if (canContinue) {
      console.log("classe .ebx-result-title trobada");
      matches.push(
        await page.evaluate(() => [
          document.querySelector(".ebx-result-title").innerHTML,
          document.querySelector(".ebx-result-price__value").innerHTML,
        ])
      );
      if (!ingredient.update) {
        console.log(
          "🚀 ~ file: carrefour-web-scraper.js ~ line 37 ~ module.exports= ~ i",
          i
        );
        Product.create({
          tag: ingredient.product,
          supermarket: "Carrefour",
          description: matches[i][0],
          price: matches[i][1],
          date: date,
        });
      } else {
        await Product.findOneAndUpdate(
          { tag: ingredient.product, supermarket: "Carrefour" },
          { price: matches[i][1], date: date }
        );
      }
    } else {
      matches.push([ingredient.product, "NOT FOUND"]);
    }
  }
  await browser.close();
  console.log("web-scraping done");
  console.log(
    "🚀 ~ file: carrefour-web-scraper.js ~ line 30 ~ module.exports= ~ matches",
    matches
  );
  return matches;
  // } catch (err) {
  //   console.log('AQUIIII',err);
  // }
};
