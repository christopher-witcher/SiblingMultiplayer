//This is more of a canvas controller.    //The game engine.

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();



//Game Engine Constructor
function GameEngine() {
    this.entities = [];
    this.gameboard = null;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.LeftLimit = null;
    this.rightLimit = null;
    this.canvasWidth = canvasWidth;
    this.viewPort = null;
    this.addListeners = true;
    this.score = 0;
    this.numItems = 0;
    this.running = true;
    this.finishLineCompleted = false;
    this.runInsideComplete = false;
    this.closeDoorCompleted = false;

}

GameEngine.prototype.setViewPort = function (viewPort) {
    this.viewPort = viewPort;
};

    //GameEngine.prototype.running = true;

    //Intilizes the game engine. Sets up things to start the game.
GameEngine.prototype.init = function (ctx, gameboard, viewPort) {
    this.ctx = ctx;
    this.gameboard = gameboard;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.viewPort = viewPort;
    //this.timer = new Timer();
    this.LeftLimit = 0;
    this.rightLimit = 1450;
    //document.getElementById("score").innerHTML = this.score;
    console.log('game initialized');
}

    //Starts looping through the game.
GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    //this.timer = new Timer();
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

    //Sets up addListeners for input from the user.
GameEngine.prototype.startInput = function () {
    console.log('Starting input');

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top + 23; //canvas top is 23 pixels from top

        return { x: x, y: y };
    }

    var that = this;

    this.ctx.canvas.addEventListener("click", function (e) {
        that.click = getXandY(e);

        //GetButtonCoordinates();

        //function GetButtonCoordinates() {
        //    var button = document.getElementById("startButton");
        //    var p = GetScreenCoordinates(button);

        //    if (that.click.x > p.x && that.click.x < p.x + button.offsetWidth &&
        //        that.click.y > p.y && that.click.y < p.y + button.offsetHeight) {


        //        //button.setAttribute("hidden", true);
        //        ////button.setAttribute("disabled", true);
        //        //this.gameEngine.start();
        //    }
        //}
    }, false);

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        that.mouse = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("mouseleave", function (e) {
        that.mouse = null;
    }, false);

    this.ctx.canvas.addEventListener("mousewheel", function (e) {
        that.wheel = e;
        e.preventDefault();
    }, false);


    this.ctx.canvas.addEventListener("keydown", this.keyDown , false);

    this.ctx.canvas.addEventListener("keyup", this.keyUp, false);

    console.log('Input started');
}

GameEngine.prototype.keyUp = function (e) {
   
    if (e.keyCode === 39) {
            that.rightArrow = false;
            that.isRightArrowUp = true;
        }
        if (e.keyCode === 37) {
            that.leftArrow = false;
            that.isLeftArrowUp = true;
        }
        e.preventDefault();
}

GameEngine.prototype.keyDown = function (e) {
    if (e.keyCode === 39) {
        that.rightArrow = true;
        that.isRightArrowUp = false;
        direction = true; // true = right
    }

    if (e.keyCode === 37) {
        that.leftArrow = true;
        that.isLeftArrowUp = false;
        direction = false; // false = left
    }

    if (e.keyCode === 32) {
        that.space = true;
    }
    e.preventDefault();
}
