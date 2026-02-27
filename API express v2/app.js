"use strict";

const { body, validationResult, check } = require("express-validator");
const express = require("express");
const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const { v4: uuidv4 } = require("uuid");
const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
const { name } = require("ejs");
const jwt = require("jsonwebtoken");
const { SECRET } = require("dotenv");

const users = [
  {
    id: 1,
    username: "admin",
    password: "admin",
  },
];

const uri = "mongodb://localhost:27017/city-app";
const client = new MongoClient(uri);
const db = client.db("city-app");

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connecté à Mongo via mongoose");
  })
  .catch((err) => {
    console.log("erreur de connexion : ", err);
  });

const City = mongoose.model("City", {
  name: String,
  uuid: String,
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
  },
});

const Country = mongoose.model("Country", {
  name: String,
  uuid: String,
  cities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },
  ],
});

const Role = mongoose.model("Role", {
  name: String,
  alias: String,
  uuid: String,
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// const User = mongoose.model("User", {
//   pseudo: String,
//   firstname: String,
//   uuid: String,
//   role: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Role",
//   },
// });

// async function databaseUsers() {
//   await Role.deleteMany();
//   await User.deleteMany();

//   const admin = new Role({
//     name: "Admin",
//     alias: "admin",
//     uuid: uuidv4(),
//   });

//   const dev = new Role({
//     name: "Developpeur",
//     alias: "dev",
//     uuid: uuidv4(),
//   });

//   const user = new Role({
//     name: "Utilisateur",
//     alias: "user",
//     uuid: uuidv4(),
//   });

//   const thomaslinux9 = new User({
//     pseudo: "thomaslinux9",
//     firstname: "Thomas",
//     uuid: uuidv4(),
//     role: admin._id,
//   });
//   await thomaslinux9.save();

//   const mauditbutin = new User({
//     pseudo: "mauditbutin",
//     firstname: "Maud",
//     uuid: uuidv4(),
//     role: dev._id,
//   });
//   await mauditbutin.save();

//   const clara = new User({
//     pseudo: "clara",
//     firstname: "Clara",
//     uuid: uuidv4(),
//     role: user._id,
//   });
//   await clara.save();

//   const mathilde = new User({
//     pseudo: "mathilde",
//     firstname: "Mathilde",
//     uuid: uuidv4(),
//     role: user._id,
//   });
//   await mathilde.save();

//   // admin.users.push(thomaslinux9);
//   // dev.users.push(mauditbutin);
//   // user.users.push(clara);
//   // user.users.push(mathilde);
//   await admin.save();
//   await dev.save();
//   await user.save();
// }
// databaseUsers();

async function database() {
  await Country.deleteMany();
  await City.deleteMany();

  const france = new Country({
    name: "France",
    uuid: uuidv4(),
  });

  const toulouse = new City({
    name: "Toulouse",
    uuid: uuidv4(),
    country: france._id,
  });
  await toulouse.save();

  const rennes = new City({
    name: "Rennes",
    uuid: uuidv4(),
    country: france._id,
  });
  await rennes.save();

  france.cities.push(toulouse);
  france.cities.push(rennes);
  await france.save();

  const allemagne = new Country({
    name: "Allemagne",
    uuid: uuidv4(),
  });

  const berlin = new City({
    name: "Berlin",
    uuid: uuidv4(),
    country: allemagne._id,
  });
  await berlin.save();

  allemagne.cities.push(berlin);
  await allemagne.save();

  await City.aggregate([
    {
      $lookup: {
        from: "countries",
        localField: "country",
        foreignField: "_id",
        as: "countryData",
      },
    },
    {
      $unwind: "$countryData",
    },
  ]).then((cities) => {
    console.log("cities: ", cities);
  });
}
database();

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

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

function extractBearerToken(headerValue) {
  if (typeof headerValue !== "string") {
    return false;
  }
  const matches = headerValue.match(/(bearer)\s+(\S+)/i);
  return matches && matches[2];
}

function checkTokenMiddleware(req, res, next) {
  const token =
    req.headers.authorization && extractBearerToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ message: "Il faut un token" });
  }
  jwt.verify(token, SECRET, (err, decodedToken) => {
    if (err) {
      res.status(401).json({ message: "Mauvais token" });
    } else {
      next();
    }
  });
}

app.post("/authentication_token", async (req, res, next) => {
  const user = users.find(
    (u) => u.username === req.body.username && u.password === req.body.password,
  );
  if (!user) {
    return res.status(400).json({ message: "Mauvais login et mot de passe" });
  }
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    SECRET,
    { expiresIn: "3 hours" },
  );
  return res.json({ access_token: token });
});

app.get("/cities", (req, res) => {
  City.find()
    .populate("country")
    .then((cities) => {
      // res.render("cities/index", { cities: cities });
      res.json(cities);
    });
});

// app.get("/users", (req, res) => {
//   User.find()
//     .populate("role")
//     .then((users) => {
//       res.render("users/index", { users: users });
//     });
// });

app.post(
  "/cities",
  checkTokenMiddleware,
  check("name")
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("City must be at least 3 characters long"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.array());
    }
    const city = await City.create({
      name: req.body.name,
      uuid: uuidv4(),
    });
    return res.status(201).json(city);
  },
);

// app.post(
//   "/users",
//   body("user")
//     .trim()
//     .isLength({ min: 3, max: 255 })
//     .withMessage("user must be at least 3 characters long"),
//   async (req, res) => {
//     const errors = validationResult(req);

//     await User.find()
//       .populate("role")
//       .then((users) => {
//         if (!errors.isEmpty()) {
//           return res.status(422).render("users.ejs", {
//             errors: errors.array(),
//             users: users,
//             user: req.body.user,
//           });
//         }
//         User.create({
//           pseudo: req.body.user,
//           uuid: uuidv4(),
//         });
//         res.redirect("/users");
//       });
//   },
// );

app.get("/cities/:uuid", (req, res) => {
  City.findOne({ uuid: req.params.uuid })
    .populate("country")
    .then((city) => {
      if (city) {
        res.render("cities/city", { city: city });
      } else {
        res.status(404).send("Ville non trouvée, pas de ville avec cet uuid");
      }
    });
});

app.get("/countries", async (req, res) => {
  await Country.find().then((countries) => {
    res.render("countries/index", { countries: countries });
  });
});

app.post("/cities/:uuid/delete", async (req, res) => {
  await City.findOneAndDelete(
    { uuid: req.params.uuid },
    { name: req.body.city },
  );
  res.redirect("/cities");
});

app.post("/cities/:uuid/update", async (req, res) => {
  await City.findOneAndUpdate(
    { uuid: req.params.uuid },
    { name: req.body.city },
  );
  res.redirect("/cities");
});

app.get("/role/:alias/users", async (req, res) => {
  const role = await Role.findOne({ alias: req.params.alias });
  await User.aggregate([
    {
      $lookup: {
        from: "roles",
        localField: "role",
        foreignField: "_id",
        as: "role",
      },
    },
    {
      $unwind: "$role",
    },
    {
      $match: { "role.alias": req.params.alias },
    },
  ]).then((users) => {
    res.render("roles/index", { users: users, role: role });
  });
});

app.get("/countries/:uuid/cities", async (req, res) => {
  const country = await Country.findOne({ uuid: req.params.uuid });
  await City.aggregate([
    {
      $lookup: {
        from: "countries",
        localField: "country",
        foreignField: "_id",
        as: "country",
      },
    },
    {
      $unwind: "$country",
    },
    {
      $match: { "country.uuid": req.params.uuid },
    },
  ]).then((cities) => {
    res.render("countries/cities", { cities: cities, country: country });
  });
});

// Cas d'erreurs
app.use((req, res) => {
  res.status(404).send("404: page non trouvée");
});

app.listen(port, () => {
  console.log("l'api ecoute sur le port : ", port);
});
