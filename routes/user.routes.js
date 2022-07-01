const { Router } = require('express');
const router = new Router();

const bcryptjs = require('bcryptjs');
const saltRounds = 10;

const User = require('../models/User.model');

router.get('/signup', (req, res, next) => {
    res.render('user_signup/signup');
})

router.post('/signup', (req, res, next) => {

    const {name, email, password} = req.body;

    if(!name || !email || !password) {
        res.render('user_signup/signup', { errorMessage: 'All fields are mandatory. Please provide your username, email and password.' });
    }

    bcryptjs
        .genSalt(saltRounds)
        .then(salt => bcryptjs.hash(password, salt))
        .then(hashedPassword => {
        User.create({
            name,
            email,
            password: hashedPassword
        });
        })
        .catch((err) => next(err));
})

module.exports = router;