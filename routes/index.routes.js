const router = require("express").Router();
const { isLoggedIn, isLoggedOut } = require("../middlewares/route-guard");

/* GET home page */
router.get("/", isLoggedOut, (req, res, next) => {
  res.render("index", {userInSession: req.session.currentUser});
});


module.exports = router;
