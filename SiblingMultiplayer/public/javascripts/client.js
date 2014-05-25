
var messages = [];
    //Initialize Asset manager 
var ASSET_MANAGER = new AssetManager();
var gameboard = new GameBoard();
var heroSpriteSheet = "./img/runboySprite.png";
//var webAddress = "http://siblingrivalry.azurewebsites.net";
var webAddress = "http://localhost:4815";
    //var io = require('socket.io');
    // the commented out code is an example of how to setup a non-local server after testing
    // of course you will have to use your ip address or web address instead

    //var socket = io.connect('http://184.64.45.190:8888');
var socket = io.connect(webAddress);
var gameWidth = 10000;
var gameHeight = 2000;

window.onload 
var tempLoad = function () {
    var field = document.getElementById("field");
    var canvas = document.getElementById("world");
    canvas.focus();
    var ctx = canvas.getContext("2d"); //Go To Canvas in lobby.jade fil
    var content = document.getElementById("content");
    var name = document.getElementById("name");
    var username = name.innerHTML;

    var gameEngine = new GameEngine();
    var player = new RunBoy(canvasWidth);
    var viewPort = new ViewPort(player, canvasWidth, canvasHeight, gameWidth, gameHeight);

    socket.on('join', function (data) {
        console.log(username);
        socket.emit(init, username);
        });

    socket.on('start', function (data) {
        socket.username = username;
        socket.player = player;
        socket.emit('init', username);
        socket.emit('init', player);
    });

    socket.on('sync', function (data) {
        gameEngine.gameboard.board = data.board;
        //gameEngine.gameboard.black = data.black;
    });

    socket.on('click', function (data) {
        gameEngine.gameboard.move(data.click.x, data.click.y);
    });

    socket.on('keydown', function (data) {
        gameEngine.gameboard.move(data.keydown);
    });

    //Download All Files to client
    ASSET_MANAGER.queueDownload(heroSpriteSheet);
    ASSET_MANAGER.downloadAll(function () {
        gameEngine.init(ctx, gameboard);
        gameEngine.start();
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





    ////////////
function AssetManager() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function (path) {
    //console.log(path.toString());
    this.downloadQueue.push(path);
}

AssetManager.prototype.isDone = function () {
    return (this.downloadQueue.length == this.successCount + this.errorCount);
}
AssetManager.prototype.downloadAll = function (callback) {
    for (var i = 0; i < this.downloadQueue.length; i++) {
        var path = this.downloadQueue[i];
        var img = new Image();
        var that = this;
        img.addEventListener("load", function () {
            //console.log("dun: " + this.src.toString());
            that.successCount += 1;
            if (that.isDone()) { callback(); }
        });
        img.addEventListener("error", function () {
            that.errorCount += 1;
            if (that.isDone()) { callback(); }
        });
        img.src = path;
        this.cache[path] = img;
    }
}

AssetManager.prototype.getAsset = function (path) {
    //console.log(path.toString());
    return this.cache[path];
}