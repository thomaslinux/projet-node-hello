"use strict"

const SSN = require("french-ssn")

console.log(SSN.parse("2 55 08 14 168 025 38"));
SSN.validate("2 55 08 14 168 025 12");
SSN.make({gender: 1, month: 5, year: 78, place: "99330", rank: 108});