var express = require("express");
var router = express.Router();

const { body, validationResult } = require("express-validator");
const MAX = 100;
const MIN = 0;
let random = Math.floor(Math.random() * (MAX - MIN) + MIN);
const numberToFind = random;

let numberFound = false;

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log(numberToFind);
  res.render("index", {
    title: "Express Brains",
    lastNumberInput: lastNumberInput,
  });
});

router.post("/", function (req, res) {
  lastNumberInput = req.body.userInput;
  res.redirect("/");
});

module.exports = router;
