
    /**
     * Module dependencies.
     */
//var start = function () {
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

    var server = http.createServer(app);
    server.listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });

    ///////Section used to set up IO Connect//////////////

    var io = require('socket.io').listen(server);
    var socketsCreated = 0;
    var numSockets = 0;

    io.sockets.on('connection', function (socket) {

        
        //socket.emit('join', gameboard);

        socket.emit('start');
        //socket.emit('join', gameboard);
        socket.on('disconnect', function () {
            numSockets--;
        });
        //socket.emit('message', { message: 'welcome to the chat' });

        socket.on('init', function (data) {
            socketsCreated++;
            numSockets++;
            console.log('Chris init' + numSockets + "-" + socketsCreated); 
            gameboard = data;
            //io.sockets.emit('join', gameboard);
            //socket.username = data;
            //socket.emit('join', data);
            //io.sockets.emit('sync', gameboard);

        });

        socket.on('join', function (data) {
            socketsCreated++;
            numSockets++;
            gameboard.addPlayer(data.player);
            if (gameboard.players.length < 2) {
                 var waitStr = "Waiting for another player to join...";
            socket.emit('waiting', { message: waitStr });
            } else {
                io.sockets.emit('sync', gameboard);
                io.sockets.emit('ready', { message: "Get ready to do battle" });
            }


        });
        //socket.on('send', function (data) {
        //    io.sockets.emit('message', data);
        //});

        socket.on('click', function (data) {
            io.sockets.emit('click', data);
            gameboard.move(data.click.x, data.click.y);
        });

        

        var timeSyncTimer = setInterval(function () {
            socket.emit('sync', gameboard);
        }, 2000);

    });

//    io.sockets.on('joined', function (socket) {
//        soc
//        gameboard = data;
//        io.sockets.emit('sync', gameboard);
//        if (gameboard.players.length === 0) {
           
//            io.sockets.emit('waiting', { message: waitStr });
//        } else {
//            io.sockets.emit('starting', "Another player has joined the match");
//        }

//    });
////}

//exports.start = start;