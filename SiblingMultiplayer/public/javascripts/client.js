
var messages = [];
    //Initialize Asset manager 
var ASSET_MANAGER = new AssetManager();
var gameboard = new GameBoard();
var heroSpriteSheet = "/images/runboySprite.png";
//var webAddress = "http://siblingrivalry.azurewebsites.net";
var webAddress = "http://localhost:4815";
    //var io = require('socket.io');
    // the commented out code is an example of how to setup a non-local server after testing
    // of course you will have to use your ip address or web address instead

    //var socket = io.connect('http://184.64.45.190:8888');
var socket = io.connect(webAddress);
var gameWidth = 10000;
var gameHeight = 2000;

var getUserName; 
var player;
var gameEngine;

window.onload = function () {
    player = new RunBoy(canvasWidth);
    var status = document.getElementById("status");
    var canvas = document.getElementById("world");
    canvas.focus();
    var ctx = canvas.getContext("2d"); //Go To Canvas in lobby.jade fil
    var content = document.getElementById("content");
    var name = document.getElementById("nameBox").innerHTML;
    var joinBtn = document.getElementById("join");
    joinBtn.addEventListener('click', function (e) {
        socket.name = name;
        socket.emit('join', {player: player, name: name});
    }, false);
    
    var gameEngine = new GameEngine();
    
    //var viewPort = new ViewPort(player, canvasWidth, canvasHeight, gameWidth, gameHeight);
    //socket.emit('init');

    //socket.on('join', function (data) {
    //    console.log("Joined on Client");
    //    status.innerHTML = "Joined Success " + name;
    //    //gameEngine.gameboard = data;
    //    //gameEngine.gameboard.addPlayer(player, name);
    //    socket.emit('joined', gameEngine.gameboard);
    //    });

    socket.on('waiting', function (data) {
        status.innerHTML = data.message;
    });

    socket.on('ready', function (data) {
        ASSET_MANAGER.downloadAll(function () {
            gameEngine.init(ctx, gameboard);
            gameEngine.start();
        });
        status.innerHTML = data.message;

    });

    socket.on('start', function (data) {
        status.innerHTML = "Welcome to Sibling Rivalry<br />"
                     + "Please enter your name and click join";

        socket.name = name;
       //Download All Files to client
    ASSET_MANAGER.queueDownload(heroSpriteSheet);
    });

    socket.on('sync', function (data) {
        gameEngine.gameboard.board = data;
    });

    socket.on('click', function (data) {
        gameEngine.gameboard.move(data.click.x, data.click.y);
    });

    socket.on('keydown', function (data) {
        gameEngine.gameboard.move(data.keydown);
    });

    
   
}

var canvasWidth = 1250;
var canvasHeight = 700;
    /*
    * Tells the game engine which Entities should be drawn based on their proximity
    * to the hero. The Viewport is currently larger than the canvas by 800 px. This is
    * to account for the width of any Entity and can be adjusted if necessary.
    */
function Viewport(hero, canvasWidth, canvasHeight, worldWidth, worldHeight) {
    this.hero = hero;
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.leftX = (this.hero.worldX - 400) - canvasWidth / 2;
    this.rightX = (this.hero.worldX + 400) + canvasWidth / 2;
}

Viewport.prototype.constructor = Viewport;

Viewport.prototype.update = function () {
    this.leftX = (this.hero.worldX - 400) - this.width / 2;
    this.rightX = (this.hero.worldX + 400) + this.height / 2;
};


