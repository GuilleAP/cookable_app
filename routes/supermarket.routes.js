const router = require("express").Router();
const { isLoggedIn } = require("../middlewares/route-guard");
const User = require("../models/User.model")

router.get("/", (req, res, next) => {
    res.render('supermarket/supermarket-prices')
  });

module.exports = router;