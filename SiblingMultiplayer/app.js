
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

var GameBoard = require('./public/javascripts/gameboard.js').GameBoard;

var gameboard = new GameBoard();

// all environments
app.set('port', process.env.PORT || 4815);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

///////Section used to set up IO Connect//////////////

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

    socket.emit('start');

    socket.emit('message', { message: 'welcome to the chat' });

    socket.on('init', function (data) {
        socketsCreated++;
        numSockets++;

        socket.username = data;
        io.sockets.emit('sync', gameboard);
    });

    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });

    socket.on('click', function (data) {
        io.sockets.emit('click', data);
        gameboard.move(data.click.x, data.click.y);
    });

    socket.on('disconnect', function () {
        numSockets--;
    });

    var timeSyncTimer = setInterval(function () {
        socket.emit('sync', gameboard);
    }, 2000);

});
//}

//exports.start = start;