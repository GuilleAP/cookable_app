const router = require("express").Router();
const Ingredient = require("../models/Ingredient.model");


router.get("/", (req, res, next) => {
    Ingredient.find()
    .then((ingredients) => {
        res.render("ingredient", {ingredients});
    })
    .catch(err => next(err))
});

router.post("/", (req, res, next) => {
  const name = req.body.name;
  console.log('HEREEEEEE',req.body.name)
  Ingredient.create({
    name: name,
  })
    .then((ingredient) => {
      console.log(ingredient);
      res.redirect("/ingredient");
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
