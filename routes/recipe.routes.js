const router = require("express").Router();


router.post("/", (req, res, next) => {
  const name = req.body.name;
  console.log('HEREEEEEE!!!!!!!!!!!',name)
  res.redirect("/ingredient");
});

module.exports = router;
