const router = require("express").Router();
const Recipe = require("../models/Recipe.model");
const User = require("../models/User.model");
const Product = require("../models/Product.model");

const axios = require("axios");
const { isLoggedIn } = require("../middlewares/route-guard");

const eroskiWebScraper = require("../public/js/eroski-web-scraper");
const mercadonaWebScraper = require("../public/js/mercadona-web-scraper");
const carrefourWebScraper = require("../public/js/carrefour-web-scraper");
const capraboWebScraper = require("../public/js/caprabo-web-scraper");

const translatte = require("translatte");


router.post("/", isLoggedIn, (req, res, next) => {
  const selectedIngredient = req.body.selectedIngredient;
  User.findById(req.session.currentUser._id)
    .populate("recipes")
    .then((user) => {
      if (selectedIngredient === undefined) {
        const userIngredients = user.ingredients;
        res.render("ingredient/ingredient", {
          userIngredients,
          errorMessage: "Please, select ingredients",
          userInSession: req.session.currentUser,
        });
      }


      const reg = /(.*?)recipe_/;
      url = `https://api.edamam.com/api/recipes/v2?type=public&q=${selectedIngredient}&app_id=24bdd075&app_key=6c398de03b8385ee27901f328803a4f0`;
      if (req.body.max !== "0") {
        url += "&ingr=" + req.body.max;
      }
      if (req.body.cuisine !== "All") {
        url += "&cuisineType=" + req.body.cuisine;
      }
      if (req.body.meal !== "All") {
        url += "&mealType=" + req.body.meal;
      }
      axios
        .get(url)
        .then((response) => {
          let newRecipes = [];
          for (let recipe of response.data.hits) {
            recipe.ID = recipe.recipe.uri.replace(reg, "");
            recipe.coloredIngredients = [];
            for (let ingredient of recipe.recipe.ingredients) {
              if (selectedIngredient.includes(ingredient.food)) {
                recipe.coloredIngredients.push({
                  ingredient: ingredient.food,
                  color: "green",
                });
              } else {
                recipe.coloredIngredients.push({
                  ingredient: ingredient.food,
                  color: "red",
                });
              }
            }
            if (
              recipe.recipe.ingredients.length <= selectedIngredient.length &&
              req.body.yourIngredients
            ) {
              newRecipes.push(recipe);
            }
          }
          if (!req.body.yourIngredients) {
            newRecipes = JSON.parse(JSON.stringify(response.data.hits));
          }
          let userRecipes = [];
          for (let userRecipe of user.recipes) {
            if (userRecipe.ingredients.includes(selectedIngredient)) {
              userRecipes.push(userRecipe);
            }
          }

          res.render("recipe/recipe", {
            recipe: newRecipes,
            userRecipes: userRecipes,
            selectedIngredient: selectedIngredient,
            userInSession: req.session.currentUser,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => next(err));
});

router.get("/:id/:selectedIngredients", isLoggedIn, async function (req, res, next) {
  try {
    const selectedIngredients = req.params.selectedIngredients.split(",");
    console.log("🚀 ~ file: recipe.routes.js ~ line 95 ~ selectedIngredients", selectedIngredients)
    
    const id = req.params.id;
    const response = await axios.get(
      `https://api.edamam.com/api/recipes/v2/${id}?type=public&app_id=24bdd075&app_key=6c398de03b8385ee27901f328803a4f0`
    );
    const recipe = response.data.recipe;
    recipe.calories = Math.round(recipe.calories);
    recipe.totalDaily.ENERC_KCAL.quantity = Math.round(
      recipe.totalDaily.ENERC_KCAL.quantity
    );
    let webscrapProducts = recipe.ingredients.map((ingredient) => {
      return ingredient.food;
    }).filter(function (ingredient) {
      return selectedIngredients.indexOf(ingredient) == -1;
    });
    let eroskiSearch = [];
    let mercadonaSearch = [];
    let capraboSearch = [];
    let carrefourSearch = [];
    let eroskiMongo = [];
    let mercadonaMongo = [];
    let capraboMongo = [];
    let carrefourMongo = [];

    let date = new Date();
    let update = false;
    for (let productEn of webscrapProducts) {
      let productEs = (await translatte(productEn, { to: "es" })).text;

      let product = await Product.findOne({
        tag: productEs,
        supermarket: "Eroski",
      });
      if (!product) {
        console.log("Eroski product ", productEs, "not in data base.");
        update = false;
        eroskiSearch.push({ product: productEs, update: update });
      } else if (
        product &&
        (product.date.split("/")[0] != date.getFullYear() ||
          product.date.split("/")[1] != date.getMonth() + 1 ||
          product.date.split("/")[2] - date.getDate() >= 7)
      ) {
        console.log("Eroski product ", productEs, "not updated in data base");
        update = true;
        eroskiSearch.push({ product: productEs, update: update });
      } else {
        eroskiMongo.push(product);
      }

      product = await Product.findOne({
        tag: productEs,
        supermarket: "Mercadona",
      });
      if (!product) {
        console.log("Mercadona product ", productEs, "not in data base.");
        update = false;
        mercadonaSearch.push({ product: productEs, update: update });
      } else if (
        product &&
        (product.date.split("/")[0] != date.getFullYear() ||
          product.date.split("/")[1] != date.getMonth() + 1 ||
          product.date.split("/")[2] - date.getDate() >= 7)
      ) {
        console.log(
          "Mercadona product ",
          productEs,
          "not updated in data base"
        );
        update = true;
        mercadonaSearch.push({ product: productEs, update: update });
      } else {
        mercadonaMongo.push(product);
      }

      product = await Product.findOne({
        tag: productEs,
        supermarket: "Caprabo",
      });
      if (!product) {
        console.log("Caprabo product ", productEs, "not in data base.");
        update = false;
        capraboSearch.push({ product: productEs, update: update });
      } else if (
        product &&
        (product.date.split("/")[0] != date.getFullYear() ||
          product.date.split("/")[1] != date.getMonth() + 1 ||
          product.date.split("/")[2] - date.getDate() >= 7)
      ) {
        console.log("Caprabo product ", productEs, "not updated in data base");
        update = true;
        capraboSearch.push({ product: productEs, update: update });
      } else {
        capraboMongo.push(product);
      }

      product = await Product.findOne({
        tag: productEs,
        supermarket: "Carrefour",
      });
      if (!product) {
        console.log("Carrefour product ", productEs, "not in data base.");
        update = false;
        carrefourSearch.push({ product: productEs, update: update });
      } else if (
        product &&
        (product.date.split("/")[0] != date.getFullYear() ||
          product.date.split("/")[1] != date.getMonth() + 1 ||
          product.date.split("/")[2] - date.getDate() >= 7)
      ) {
        console.log(
          "Carrefour product ",
          productEs,
          "not updated in data base."
        );
        update = true;
        carrefourSearch.push({ product: productEs, update: update });
      } else {
        carrefourMongo.push(product);
      }
    }
    let eroskiPrices;
    let mercadonaPrices;
    let capraboPrices;
    let carrefourPrices;

    if (eroskiSearch.length)
      eroskiPrices = await eroskiWebScraper(eroskiSearch);
    if (mercadonaSearch.length)
      mercadonaPrices = await mercadonaWebScraper(mercadonaSearch);
    if (capraboSearch.length)
      capraboPrices = await capraboWebScraper(capraboSearch);
    if (carrefourSearch.length)
      carrefourPrices = await carrefourWebScraper(carrefourSearch);

    res.render("recipe/recipe-detail", {
      recipe: recipe,
      userInSession: req.session.currentUser,
      eroskiPrices: eroskiPrices,
      mercadonaPrices: mercadonaPrices,
      capraboPrices: capraboPrices,
      carrefourPrices: carrefourPrices,
      eroskiMongo: eroskiMongo,
      mercadonaMongo: mercadonaMongo,
      capraboMongo: capraboMongo,
      carrefourMongo: carrefourMongo,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/recipe/createRecipe", (req, res, next) => {
  res.render("creatateRecipe");
});

module.exports = router;
