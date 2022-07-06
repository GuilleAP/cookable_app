const puppeteer = require("puppeteer");
const Product = require("../../models/Product.model");

module.exports = async (ingredients) => {
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

    await page.goto(
      `https://tienda.mercadona.es/search-results?query=${ingredient.product}`,
      { waitUntil: "domcontentloaded" }
    );
    console.log("Mercadona website loaded");
    await page
      .waitForSelector(".product-container", { timeout: 5000 })
      .catch((e) => (canContinue = false));
    if (!ingredient.update) {
      console.log("classe search-results__header trobada");
      matches.push(
        await page.evaluate(() => [
          document.querySelector(".product-cell__description-name").innerHTML,
          document.querySelector(".product-price__unit-price").innerHTML,
        ])
      );
      if (!ingredient.update) {
        Product.create({
          tag: ingredient.product,
          supermarket: "Mercadona",
          description: matches[i][0],
          price: matches[i][1],
          date: date,
        });
      } else {
        await Product.findOneAndUpdate(
          { tag: ingredient.product, supermarket: "Mercadona" },
          { price: matches[i][1], date: date }
        );
      }
    } else {
      matches.push([ingredient.product, "NOT FOUND"]);
    }
  }
  await browser.close();
  console.log("web-scraping done");
  return matches;
};
