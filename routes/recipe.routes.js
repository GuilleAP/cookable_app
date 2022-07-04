const router = require("express").Router();

const axios = require('axios');
const { isLoggedIn } = require("../middlewares/route-guard");


router.post("/", isLoggedIn, (req, res, next) => {
  const name = req.body.name;
  if(name ===undefined){
    Ingredient.find()
    .then((ingredients) => {
        res.render("ingredient", {ingredients, errorMessage: "Please, select ingredients"});
        return;
    })
    .catch(err => next(err))
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
      res.render("recipe", {recipe: newRecipes, userInSession: req.session.currentUser});
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
