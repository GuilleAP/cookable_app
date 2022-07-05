const router = require("express").Router();
const { isLoggedIn } = require("../middlewares/route-guard");
const Recipe = require("../models/Recipe.model");
const User = require("../models/User.model");


router.get("/", isLoggedIn, (req, res, next) => {
    res.render('createRecipe', {userInSession: req.session.currentUser});
});


router.post('/', (req, res, next) => {
    const ingredientsArr = req.body.ingredients.split(',');
    console.log(req.body)
    Recipe.create( {
        name: req.body.name,
        ingredients: ingredientsArr,
        url: req.body.url,
        steps: req.body.steps,
    })
    .then((recipe) => {
        User.updateOne(
            {_id : req.session.currentUser._id},
            {$push: {recipes: recipe}})
        .then(() => {
            res.redirect('userProfile');
        })
    })
    .catch((err) => next(err));
});

module.exports = router;