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
heroSpriteSheet = "runboySprite.png";
direction = true;
screenOffSet = 0;
var backImg = "neighBackgroundext.png";
var gameEngine;
var canvasWidth = 1250;
var canvasHeight = 700;
var boardPieces = [];
var rewindFrame;

sdParentNode = null;
startDisplay = null;
gameEngine = null;
timer = null;
gameOver = false;

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

    //Creates an animation to be created for the user.
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
    this.completed = false;


}

    //Draws an image on the canvas
Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
            this.completed = true;
        }
    } else if (this.isDone()) {
        this.completed = true;
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    this.locX = x;
    this.locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    this.clipX = index * this.frameWidth + offset;
    this.clipY = vindex * this.frameHeight + this.startY;


    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  this.locX, this.locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);

}


GameEngine.prototype.endGame = function () {
    timer.stopped = true;
    var timeLeft = timer.time;
    var timeBonus = Math.ceil((120000 - Number(timeLeft)) / 1000) * 10;

    var element = document.createElement('div');
    element.id = "endDisplay";
    document.body.appendChild(element);
    element.appendChild(document.createTextNode("Game Over"));
    element.style.position = "absolute";
    element.style.left = "500px";
    element.style.top = "130px";
    element.style.fontSize = "65px";
    //element.style.color = "#D0F8FF";
    element.style.color = "red";
    element.style.textShadow = "0 0 5px #A5F1FF, 0 0 10px #A5F1FF, 0 0 20px #A5F1FF, 0 0 30px #A5F1FF, 0 0 40px #A5F1FF";

    var element2 = document.createElement('ul');
    element2.id = "list";
    document.body.appendChild(element2);
    element2.style.position = "absolute";
    element2.style.left = "500px";
    element2.style.top = "270px";
    element2.style.fontSize = "25px";
    //element2.style.color = "#D0F8FF";
    element2.style.color = "red";
    element2.style.textShadow = "0 0 5px #A5F1FF, 0 0 10px #A5F1FF, 0 0 20px #A5F1FF, 0 0 30px #A5F1FF, 0 0 40px #A5F1FF";

    var elem3 = document.createElement('li');
    elem3.appendChild(document.createTextNode("Score: " + (gameEngine.score + timeBonus)));

    var elem4 = document.createElement('li');
    elem4.appendChild(document.createTextNode("Items Collected: " + gameEngine.numItems));

    var elem5 = document.createElement('li');
    elem5.appendChild(document.createTextNode("Time Bonus: " + timeBonus));

    element2.appendChild(elem3);
    element2.appendChild(elem4);
    element2.appendChild(elem5);

    var resetButton = document.createElement('input');
    document.body.appendChild(resetButton);
    resetButton.id = "rb";
    resetButton.type = "button";
    resetButton.value = "Play Again";
    resetButton.style.position = "absolute";
    resetButton.style.left = "540px";
    resetButton.style.top = "470px";
    resetButton.style.display = "inline-block";
    resetButton.style.width = "200px";
    resetButton.style.border = "1px solid red";
    resetButton.style.backgroundColor = "#A5F1FF";
    resetButton.style.fontSize = "150%";
    resetButton.style.color = "red";
    resetButton.style.borderRadius = "5px";
    resetButton.onclick = function () { location.reload() };


};


    //
Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function RewindAnimation(spriteSheet, rewindStack) {
    this.spriteSheet = spriteSheet;
    this.myRewindStack = rewindStack;
    this.previousFrame = null;
    this.currentLineInterval = 0;
    this.movingUp = true;
}

RewindAnimation.prototype.drawFrame = function (tick, ctx, scaleBy) {

    if (this.myRewindStack.length > 0) {
        var current = this.myRewindStack.pop();

        ctx.drawImage(this.spriteSheet,
                         current.clipX, current.clipY, current.frameWidth, current.frameHeight,
                         current.canvasX, current.canvasY, current.frameWidth, current.frameHeight);
        this.previousFrame = current;
        ctx.drawImage(this.spriteSheet, 5565, 4550, 302, 310, 625, 250, 302 * .33, 310 * .33)

        for (var i = 1; i <= 10; i++) {
            if (this.currentLineInterval < 10 && this.movingUp) {
                this.currentLineInterval += 1;
            } else if (this.currentLineInterval >= 10 && this.movingUp) {
                this.movingUp = false;
                this.currentLineInterval -= 1;
            } else if (this.currentLineInterval > -10 && !this.movingUp) {
                this.currentLineInterval -= 1;
            } else {
                this.movingUp = true;
                this.currentLineInterval += 1;
            }
            ctx.strokeStyle = "#000";
            ctx.beginPath();
            ctx.moveTo(0, i * 70 + this.currentLineInterval);
            ctx.lineTo(canvasWidth, i * 70 + this.currentLineInterval);
            ctx.stroke();
        }

        return current;
    }


    return this.previousFrame;


}

   


