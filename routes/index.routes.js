const router = require("express").Router();
const { isLoggedIn } = require("../middlewares/route-guard");

/* GET home page */
router.get("/", isLoggedIn, (req, res, next) => {
  res.render("index", {userInSession: req.session.currentUser});
});


module.exports = router;
