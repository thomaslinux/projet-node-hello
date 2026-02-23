const fs = require("fs")

function readCities() {
    let cities = ""
    try {
        cities = fs.readFileSync("cities.csv","utf8")
    } catch (err) {
        if(err.code === 'ENOENT') {
            console.error("Le fichier n'existe pas.")
        } else {
            console.error(err);
        }
    }
}
