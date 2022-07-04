const router = require("express").Router();
const axios = require('axios');
const { isLoggedIn } = require("../middlewares/route-guard");


router.post("/", isLoggedIn, (req, res, next) => {
  const name = req.body.name;
  const recipesID= [];
  const reg = /(.*?)recipe_/;
  console.log("INGREDIENTS PER RECEPTA:", req.body.name)
  axios
    .get(`https://api.edamam.com/api/recipes/v2?type=public&q=${req.body.name}&app_id=24bdd075&app_key=6c398de03b8385ee27901f328803a4f0`)
    .then(response => {
      const recipes = JSON.parse(JSON.stringify(response.data.hits));
      for(let recipe of recipes){
        recipe.ID = recipe.recipe.uri.replace(reg, "");
      }
      res.render("recipe", {recipe: recipes});
      console.log('Response from API is: ', response.data.hits[0].recipe.label);
      res.render("recipe", {recipe: response.data.hits, userInSession: req.session.currentUser});
    })
    .catch(err => console.log(err));
});


router.get("/:id", (req, res, next) =>{
  const id = req.params.id
  axios
    .get(`https://api.edamam.com/api/recipes/v2/${id}?type=public&app_id=24bdd075&app_key=6c398de03b8385ee27901f328803a4f0`)
    .then(response => {
        res.render("recipe-detail", {recipe: response.data.recipe})
    })
    .catch(err => console.log(err));
})

module.exports = router;
