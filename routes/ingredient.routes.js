const router = require("express").Router();
const { isLoggedIn } = require("../middlewares/route-guard");
const Ingredient = require("../models/Ingredient.model");
const User = require("../models/User.model")


router.get("/", isLoggedIn, (req, res, next) => {
    Ingredient.find()
    .then((ingredients) => {
        res.render("ingredient", {ingredients, userInSession: req.session.currentUser });
    })
    .catch(err => next(err))
});

router.post("/", (req, res, next) => {
  const name = req.body.name;
  console.log("HOLA", req.session);
  Ingredient.create({
    name: name,
  })
  .then((ingredient) => {
    res.redirect("/ingredient");
  })
  .catch((err) => {
    console.log(err);
  });
});

module.exports = router;
