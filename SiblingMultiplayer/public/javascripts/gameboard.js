    //This is more of the gameengine and should exist on both client and server.
    //When ever a change happens it is passed through the Game Board

    (function (exports) {
    var GameBoard = function () {
        this.players = [];
        this.running = false;
    }

    GameBoard.prototype.addPlayer = function (player, name){
        player.name = name;
        this.players.push(player);
    }

    GameBoard.prototype.cloneBoard = function () {
        var b = [];
        for (var i = 0; i < 19; i++) {
            b.push([]);
            for (var j = 0; j < 19; j++) {
                b[i].push(this.board[i][j]);
            }
        }
        return b;
    }

    GameBoard.prototype.move = function (x, y) {
      
    }

 

    exports.GameBoard = GameBoard;
    })(typeof global === "undefined" ? window : exports);

    //The location of the sprite sheet
    heroSpriteSheet = "runboySprite.png";
    moveDistance = 7;
    startingHeight = 435;


    //Intializes the timer for the game.
    function Timer() {
        this.gameTime = 0;
        this.maxStep = 0.05;
        this.wallLastTimestamp = 0;
    }

    //Controls the game Timer.
    Timer.prototype.tick = function () {
        var wallCurrent = Date.now();
        var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
        this.wallLastTimestamp = wallCurrent;

        var gameDelta = Math.min(wallDelta, this.maxStep);
        this.gameTime += gameDelta;
        return gameDelta;
    }