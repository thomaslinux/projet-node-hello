const http = require("http");

const hostname = "127.0.0.1";
const port = 3000

const server = http.createServer(  (req, res) => {
    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    
    let output = {};

    for (let key in req) {
        output[key] = typeof req[key]
    }
    console.log("hello")
    console.log(req);
    console.log(output);
    res.end(JSON.stringify(output));
})

server.listen(port, hostname, () => {
    console.log('Le serveur est en cours sur http://' + hostname + ':' + port)
})