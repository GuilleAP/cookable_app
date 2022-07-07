const { Router } = require('express');
const router = new Router();

const { isLoggedIn, isLoggedOut } = require('../middlewares/route-guard.js');

const bcryptjs = require('bcryptjs');
const saltRounds = 10;

const User = require('../models/User.model');

router.get('/signup', (req, res, next) => {
    res.render('user_signup/signup');
})

router.post('/signup', (req, res, next) => {

    const {name, email, password} = req.body;

    if(name === null || !email || !password) {
        res.render('user_signup/signup', { errorMessage: 'All fields are mandatory. Please provide your username, email and password.' });
        return;
    }
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!regex.test(password)) {
    console.log("🚀 ~ file: user.routes.js ~ line 18 ~ router.post ~ email", email)
        
      res
        .status(500)
        .render('user_signup/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.', name: name});
      return;
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
        .then(() => {
            res.redirect('/');
        })
        .catch((err) => next(err));
})

router.post('/logout', (req, res, next) => {
    req.session.destroy(err => {
      if (err) next(err);
      res.redirect('/');
    });
  });

module.exports = router;