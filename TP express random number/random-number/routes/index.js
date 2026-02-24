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

router.post(
  "/",
  body("userInput").isInt().withMessage("Vous devez saisir un nombre"),
  body("userInput").custom((value) => {
    console.log(parseInt(value));
    if (parseInt(value) < numberToFind) {
      console.log("trop bas");
      throw new Error("Trop bas");
    }
    if (parseInt(value) > numberToFind) {
      throw new Error("Trop haut");
    }
    if (parseInt(value) == numberToFind) {
      throw new Error("Bravo");
    }
    return true;
  }),

  (req, res) => {
    lastNumberInput = req.body.userInput;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("index.ejs", {
        title: "Express Brains",
        errors: errors.array(),
        userInput: req.body.userInput,
      });
    }
    res.redirect("/");
  },
);

module.exports = router;
