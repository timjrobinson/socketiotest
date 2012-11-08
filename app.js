
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , rs = require('randomstring')
  , colors = require('colors');




var app = express();
server = http.createServer(app)

var io = require('socket.io').listen(server);

app.configure(function(){
  app.set('port', process.env.PORT || 9000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

server.listen(app.get("port"), function() { console.log("Express server listening on port ", app.get("port")); });

io.set('log level', 1);

io.sockets.on('connection', function (socket) {
  var i = 0, j = 0, k = 0;
  var string = "", strings = [], serverStrings = [], clientStrings = [];
  for (i = 0; i < 10; i++) {
    strings[i] = [];
    for (j = 0; j < 1000; j++) {
      string = rs.generate(16);
      strings[i].push(string);
      socket.emit('string', {string: string});
    }
  }  
  socket.on('stringConfirm', function (data) {
    if (data.group >= 10) { console.log("Got invalid string group"); }
    else {
      // console.log("Got stringConfirm for group ", data.group, ", data is: ", data.strings);
      // console.log("Data should be: ", strings[data.group]);
      if (JSON.stringify(strings[data.group]) == JSON.stringify(data.strings)) {
        console.log("Data is the same!".green);      
      } else {
        console.log("Data is not the same :(".red);
        serverStrings = strings[data.group]; clientStrings = data.strings;
        for (k = 0; k < serverStrings.length; k++) {
          if (serverStrings[k] !== clientStrings[k]) {
            console.log("Server string: "+serverStrings[k]+" doesn't equal client string "+clientStrings[k].red);
          }
        }
      }
    }
  });
});