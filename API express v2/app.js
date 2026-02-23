"use strict";

const express = require("express");
const app = express();
const port = 3000;

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
    res.send(cities.join(", "))
})

app.get("/cities/:id", (req, res) => {
    res.send(cities[req.params.id])
})

app.listen(port, () => {
  console.log("l'api ecoute sur le port : ", port);
});
