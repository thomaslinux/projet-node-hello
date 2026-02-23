let cities = "Nantes, Rennes, Quimper"
cities = cities.split(',')
console.log(cities)
console.log(
    cities.map((city) => city.toUpperCase())
);
