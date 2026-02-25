"use strict";

const { body, validationResult } = require("express-validator");
const express = require("express");
const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const { v4: uuidv4 } = require("uuid");
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017/city-app";
const client = new MongoClient(uri, { useNewUrlParser: true });

app.use((req, res, next) => {
  console.log(
    "method: ",
    req.method,
    " url: ",
    req.url,
    " user-agent: ",
    req.get("User-Agent"),
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const cities = "Nantes, Rennes, Lorient, Bordeaux, Quimper".split(", ");

app.get("/cities", (req, res) => {
  // res.send(cities.join(", "))
  res.render("cities/index", { cities: cities });
});

app.post(
  "/cities",
  body("city")
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("City must be at least 3 characters long"),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("cities.ejs", {
        errors: errors.array(),
        cities: cities,
        city: req.body.city,
      });
    }
    cities.push(req.body.city);
    res.redirect("/cities");
  },
);

app.get("/cities/:id", (req, res) => {
  if (req.params.id < 1 || req.params.id > cities.length) {
    return res.status(404).send("Ville non trouvée");
  }
  res.send(cities[req.params.id - 1]);
});

// Cas d'erreurs
app.use((req, res) => {
  res.status(404).send("404: page non trouvée");
});

app.listen(port, () => {
  console.log("l'api ecoute sur le port : ", port);
});
