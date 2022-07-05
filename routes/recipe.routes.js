const router = require("express").Router();
const Recipe = require('../models/Recipe.model');

const axios = require('axios');
const { isLoggedIn } = require("../middlewares/route-guard");
const User = require("../models/User.model")

const eroskiWebScraper = require("../public/js/eroski-web-scraper")
const mercadonaWebScraper = require("../public/js/mercadona-web-scraper")

const translatte = require('translatte');


router.post("/", isLoggedIn, (req, res, next) => {
  const name = req.body.name;
  if(name ===undefined){
    User.findById(req.session.currentUser._id)
    .then((user) => {
      const userIngredients = user.ingredients;
      res.render("ingredient/ingredient", {userIngredients, errorMessage: "Please, select ingredients", userInSession: req.session.currentUser });
    })
    .catch((err) => next(err));
  }
  const reg = /(.*?)recipe_/;
  url = `https://api.edamam.com/api/recipes/v2?type=public&q=${name}&app_id=24bdd075&app_key=6c398de03b8385ee27901f328803a4f0`;
  if(req.body.max !== '0'){
    url += '&ingr='+req.body.max
  }
  if(req.body.cuisine !== 'All'){
    url +=  '&cuisineType='+req.body.cuisine
  }
  if(req.body.meal !== 'All'){
    url += '&mealType='+req.body.meal
  }
  axios
    .get(url)
    .then(response => {
      let newRecipes = []
      for(let recipe of response.data.hits){
        recipe.ID = recipe.recipe.uri.replace(reg, "");
        if(recipe.recipe.ingredients.length <= name.length && req.body.yourIngredients){
          newRecipes.push(recipe);
        }
      }
      if(!req.body.yourIngredients){
        newRecipes = JSON.parse(JSON.stringify(response.data.hits));
      }
      res.render("recipe/recipe", {recipe: newRecipes, userInSession: req.session.currentUser});
    })
    .catch(err => console.log(err));

});






router.get("/:id", isLoggedIn, async function(req, res, next){
  try{
    const id = req.params.id
    const response = await axios.get(`https://api.edamam.com/api/recipes/v2/${id}?type=public&app_id=24bdd075&app_key=6c398de03b8385ee27901f328803a4f0`);
    const recipe = response.data.recipe;
    recipe.calories = Math.round(recipe.calories)
    recipe.totalDaily.ENERC_KCAL.quantity = Math.round(recipe.totalDaily.ENERC_KCAL.quantity)
    const user = await  User.findById(req.session.currentUser._id);
    const userIngredients = user.ingredients;
    let recipeIngredients = recipe.ingredients.map(ingredient => {return ingredient.food})
    recipeIngredients = recipeIngredients.filter(function(ingredient) {
      return userIngredients.indexOf(ingredient) == -1;
    });
    let ingredientAndPrices = [];
    let ingredientEsp = [];
    for(let ingredient of recipeIngredients){
       ingredientEsp.push((await translatte(ingredient, {to: 'es'})).text)
    }
    console.log(ingredientEsp)
    let eroskiPrices = await eroskiWebScraper(ingredientEsp);
    let mercadonaPrices = await mercadonaWebScraper(ingredientEsp);
    res.render("recipe/recipe-detail", {recipe: recipe, userInSession: req.session.currentUser, eroskiPrices: eroskiPrices, mercadonaPrices: mercadonaPrices})
  } catch (err) {
    next(err);
  }
});

  









// router.get("/:id", isLoggedIn, (req, res, next) =>{
//   const id = req.params.id
//   axios
//     .get(`https://api.edamam.com/api/recipes/v2/${id}?type=public&app_id=24bdd075&app_key=6c398de03b8385ee27901f328803a4f0`)
//     .then(response => {
//         const recipe = response.data.recipe;
//         recipe.calories = Math.round(recipe.calories)
//         recipe.totalDaily.ENERC_KCAL.quantity = Math.round(recipe.totalDaily.ENERC_KCAL.quantity)

//         res.render("recipe/recipe-detail", {recipe: recipe, userInSession: req.session.currentUser})
//         User.findById(req.session.currentUser._id)
//         .then((user) => {
//           const userIngredients = user.ingredients;
//           let recipeIngredients = recipe.ingredients.map(ingredient => {return ingredient.food})
//           recipeIngredients = recipeIngredients.filter(function(ingredient) {
//             return userIngredients.indexOf(ingredient) == -1;
//           });
//           let ingredientAndPrices = [];
//           for(let ingredient of recipeIngredients){
//             translatte(ingredient, {to: 'es'}).then(ingredientEsp => {
//               (async () => {
//                 let prices = await webScraper(ingredientEsp.text);
//                 let regex = /\\n\\t\\t\\t\\t"/g;
//                 prices = prices.replace(regex, "")
//                 regex = /\\n\\t\\t\\t\\t\\t/g;
//                 prices = prices.replace(regex, "")
//                 prices = prices.split("],")
//                 regex = /[\[\]\"]/g;
//                 ingredientAndPrices.push(prices[0].replace(regex, "").split(","));
//                 // res.render("recipe/recipe-detail", {ingredientsPrice: ingredientAndPrices})
//                 console.log(ingredientAndPrices)
//               })()     
//             }).catch(err => {
//               console.error(err);
//             });
//           } 
//         })
//     })
//     .catch(err => console.log(err));
// })

router.get('/recipe/createRecipe', (req, res, next) => {
  res.render('creatateRecipe');
})

module.exports = router;
