let http = require('http');

//create a server object:
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'application/json'}); //write a response to the client
    res.write('routes/index.js');
    res.end(); //end the response
}).listen(8080); //the server object listens on port 8080