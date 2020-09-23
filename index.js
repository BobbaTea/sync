const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const app = express()

const hbs = exphbs.create({
  partialsDir: __dirname + '/views/partials',
})
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use('/static', express.static('static'));
app.get('/', (req, res, next) => { res.render('index') })



var https = require('https');
var ws = require('websocket').server;
var fs = require('fs');
var options = {
key:fs.readFileSync('/sync/key.pem'),
cert:fs.readFileSync('/sync/cert.pem')
};
var server = https.createServer(options,
function(req,res){res.writeHeader(200);res.end();});
server.listen(8000);
var wss = new ws({httpServer:server});

// const uuid = require('uuid');

var listeners = {};
wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    res = JSON.parse(message)

    if (res.action == "open") {
      ws.id = res.unique
      listeners[ws.id] = ws
      console.log("Connected " + ws.id)
    } else if (res.action == "data") {
      for (var cid in listeners) {
        if (cid != ws.id) {
          listeners[cid].send(JSON.stringify({data: res.data}), {}, function (err) {
            if (err) {
              console.log(err)
            }
          });
        }
      }

    }
  });

  ws.on('close', function () {
    delete listeners[ws.id];
  });
});




app.listen(process.env.PORT || 3000, () => console.log(`Express server listening on port ${process.env.PORT || 3000}!`))
