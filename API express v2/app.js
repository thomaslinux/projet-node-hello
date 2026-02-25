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
const client = new MongoClient(uri);
const db = client.db("city-app");

client
  .connect()
  .then(() => {
    console.log("Connexion réussie");
  })
  .catch((err) => {
    console.log("connexion échouée: ", err);
  });

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

app.get("/cities", (req, res) => {
  db.collection("cities")
    .find()
    .toArray()
    .then((cities) => {
      console.log(cities);
      res.render("cities/index", { cities: cities });
    });
});

app.post(
  "/cities",
  body("city")
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("City must be at least 3 characters long"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("cities.ejs", {
        errors: errors.array(),
        cities: cities,
        city: req.body.city,
      });
    }
    await db.collection("cities").insertOne({
      name: req.body.city,
      uuid: uuidv4(),
    });
    res.redirect("/cities");
  },
);

app.get("/cities/:uuid", (req, res) => {
  db.collection("cities")
    .findOne({ uuid: req.params.uuid })
    .then((city) => {
      if (city) {
        res.render("cities/city", { city: city });
      } else {
        res.status(404).send("Ville non trouvée, pas de ville avec cet uuid");
      }
    });
});

app.post("/cities/:uuid/delete", async (req, res) => {
  await db
    .collection("cities")
    .deleteOne({ uuid: req.params.uuid })
    .then((response) => {
      if (response.deletedCount === 1) {
        res.redirect("/cities");
      } else {
        res.status(404).send("404: ville à supprimer non trouvée");
      }
    });
});

// Cas d'erreurs
app.use((req, res) => {
  res.status(404).send("404: page non trouvée");
});

app.listen(port, () => {
  console.log("l'api ecoute sur le port : ", port);
});
