const fs = require("fs")

function readCities() {
    let cities = ""
    try {
        cities = fs.readFileSync("cities.csv", "utf8")
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error("Le fichier n'existe pas.")
        } else {
            console.error(err);
        }
    }
    return cities.split("\n");
}

let cities = ['Nantes', 'Rennes', 'Quimper', 'Paris'];
// fs.rm("cities.csv")
fs.writeFileSync("cities.csv", cities.join("\n"))

cities = readCities();
cities.forEach(city => console.log("ville : ", city));

fs.appendFileSync("cities.csv", "\nLorient", "utf8")

cities = readCities();
cities.forEach(city => console.log("ville : ", city));