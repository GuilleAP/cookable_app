const { Router } = require('express');
const router = new Router();

const { isLoggedIn, isLoggedOut } = require('../middlewares/route-guard.js');

const bcryptjs = require('bcryptjs');
const saltRounds = 10;

const User = require('../models/User.model');


router.get('/userProfile', isLoggedIn, (req, res, next) => {
    res.render('user_profile/profile', { userInSession: req.session.currentUser });
})

router.get('/login', (req, res, next) => {
    res.render('user_profile/login');
})

router.post('/login', (req, res, next) => {
    const {email, password} = req.body;

    if(email === '' || password === '') {
        res.render('user_profile/login', {
            errorMessage: 'Please enter both, email and password to login.'
        });
        return;
    }

    User.findOne({email})
        .then((user) => {
            if(!email) {
                res.render('user_profile/login', {
                    errorMessage: 'Email is not registered. Try with other user.'
                })
                return 
            } else if (bcryptjs.compareSync(password, user.password)) {
                req.session.currentUser = user;
                res.redirect('userProfile');
            }
        })
})

module.exports = router;