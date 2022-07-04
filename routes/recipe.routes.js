const router = require("express").Router();
const axios = require('axios')
const Ingredient = require("../models/Ingredient.model");



router.post("/", (req, res, next) => {
  const name = req.body.name;
  if(name ===undefined){
    Ingredient.find()
    .then((ingredients) => {
        res.render("ingredient", {ingredients, errorMessage: "Please, select ingredients"});
        return;
    })
    .catch(err => next(err))
  }
  const recipesID= [];
  const reg = /(.*?)recipe_/;
  url = `https://api.edamam.com/api/recipes/v2?type=public&q=${req.body.name}&app_id=24bdd075&app_key=6c398de03b8385ee27901f328803a4f0`;
  if(req.body.min !== 0){
    url += '&ingr='+req.body.min
  }
  if(req.body.max !== 0){
    if(req.body.min !== 0){
      url += '-'+req.body.max
    }else{
    url += '&ingr='+req.body.max
    }
  }
  if(req.body.cuisine !== 'All'){
    url +=  '&cuisineType='+req.body.cuisine
  }
  if(req.body.meal !== 'All'){
    url += '&mealType='+req.body.meal
  }
  console.log(url)
  axios
    .get(url)
    .then(response => {
      const recipes = JSON.parse(JSON.stringify(response.data.hits));
      for(let recipe of recipes){
        recipe.ID = recipe.recipe.uri.replace(reg, "");
      }
      res.render("recipe", {recipe: recipes});
    })
    .catch(err => console.log(err));

});


router.get("/:id", (req, res, next) =>{
  const id = req.params.id
  axios
    .get(`https://api.edamam.com/api/recipes/v2/${id}?type=public&app_id=24bdd075&app_key=6c398de03b8385ee27901f328803a4f0`)
    .then(response => {
        const recipe = response.data.recipe;
        recipe.calories = Math.round(recipe.calories)
        recipe.totalDaily.ENERC_KCAL.quantity = Math.round(recipe.totalDaily.ENERC_KCAL.quantity)
        for( let nutrient in recipe.totalNutrients){
          recipe.totalNutrients[nutrient].quantity = Math.round(recipe.totalNutrients[nutrient].quantity)
          if(["FASAT","FATRN", "FAMS", "FAPU", "CHOCDF.net","FIBTG", "SUGAR", "SUGAR.added"].includes(nutrient)){
            recipe.totalNutrients[nutrient].displayAsList = true;
          }else{
            recipe.totalNutrients[nutrient].displayAsList = false;
          }
        }

        res.render("recipe-detail", {recipe: recipe})
    })
    .catch(err => console.log(err));
})

module.exports = router;
