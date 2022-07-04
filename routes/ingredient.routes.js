const router = require("express").Router();
const { isLoggedIn } = require("../middlewares/route-guard");
const User = require("../models/User.model")


router.get("/", isLoggedIn, (req, res, next) => {
  User.findById(req.session.currentUser._id)
    .then((user) => {
      const userIngredients = user.ingredients;
      res.render("ingredient", {userIngredients, userInSession: req.session.currentUser });
    })
    .catch((err) => next(err));
});


router.post("/", (req, res, next) => {
  const name = req.body.name;

  User.findById(req.session.currentUser._id)
  .then((user) => {

    if(!user.ingredients.includes(name)) {
      User.updateOne(
        {_id : req.session.currentUser._id},
        {$push: {ingredients: name}}
      )
      .then(() => {
        res.redirect("ingredient");
      })
    } else {
      console.log("Ingredient ja esta a la BD")
      res.redirect('ingredient')
    }
  })
  .catch((err) => {
    console.log(err);
  });
});

module.exports = router;
