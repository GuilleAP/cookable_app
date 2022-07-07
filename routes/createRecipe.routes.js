const router = require("express").Router();
const { isLoggedIn } = require("../middlewares/route-guard");
const Recipe = require("../models/Recipe.model");
const User = require("../models/User.model");
const fileUploader = require('../config/cloudinary.config');


router.get("/", isLoggedIn, (req, res, next) => {
    res.render('createRecipe', {userInSession: req.session.currentUser});
});


router.post('/', fileUploader.single('recipe-image'), (req, res, next) => {
    const ingredientsArr = req.body.ingredients.split(',');

    Recipe.create( {
        name: req.body.name,
        ingredients: ingredientsArr,
        url: req.body.url,
        imageURL: req.file.path,
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


router.get('/delete-recipe/:id', (req, res, next) => {
    const id = req.params.id;

    User.findById(req.session.currentUser._id)
    .then((user) => {
        User.findOneAndUpdate(
            {name: user.name},
            {$pull: { recipes: { $in: [req.params.id] }}}
        )
        .then(() => {
            Recipe.findByIdAndDelete(req.params.id)
            .then((response) => {
                res.redirect('/userProfile');
            })
            .catch((err) => next(err))
        })
        .catch((err) => next(err))
    })
    .catch((err) => next(err))
});

router.get('/edit-recipe/:id', (req, res, next) => {
    const id = req.params.id;

    Recipe.findById(id)
        .then((recipe) => {
            res.render('edit-recipe', {recipe});
        })
        .catch(err => next(err));

})

module.exports = router;
