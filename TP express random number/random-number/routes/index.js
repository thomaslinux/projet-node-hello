var express = require("express");
var router = express.Router();

const numberToFind = 99;
let lastNumberInput = -1;
const MAX = 100;
const MIN = 0;
const randomNumber = Math.floor(Math.random() * (MAX - MIN) + MIN);
const numberFound = false;

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Express Brains",
    subtitle:
      "Découvrez en un minimum de tour le nombre qui se cache derrière la carte mystère",
    lastNumberInput: lastNumberInput,
  });
});

router.post("/", function (req, res) {
  lastNumberInput = req.body.userInput;
  res.redirect("/");
});

module.exports = router;
