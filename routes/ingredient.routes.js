const router = require("express").Router();
const { isLoggedIn } = require("../middlewares/route-guard");
const User = require("../models/User.model")



router.get("/", isLoggedIn, (req, res, next) => {
  User.findById(req.session.currentUser._id)
    .then((user) => {
      const userIngredients = user.ingredients;
      res.render("ingredient/ingredient", {userIngredients, userInSession: req.session.currentUser });
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

router.get('/deleteIngredient/:name', (req, res, next) => {
  const name = req.params.name;
  console.log(name);
  User.findById(req.session.currentUser._id)
  .then((user) => {
    const newArray = user.ingredients.filter( e => e !== name);
    User.findOneAndUpdate(
      {name: user.name},
      {ingredients: newArray}
    )
    .then(() => {
      res.redirect('/ingredient');
    })
  });
});

module.exports = router;
