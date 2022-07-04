const router = require("express").Router();
const axios = require('axios')


router.post("/", (req, res, next) => {
  const name = req.body.name;
  console.log("INGREDIENTS PER RECEPTA:", req.body.name)
  axios
    .get(`https://api.edamam.com/api/recipes/v2?type=public&q=${req.body.name}&app_id=24bdd075&app_key=6c398de03b8385ee27901f328803a4f0`)
    .then(response => {
      console.log('Response from API is: ', response.data.hits[0].recipe.label);
      res.render("recipe", {recipe: response.data.hits});
    })
    .catch(err => console.log(err));
});

module.exports = router;
