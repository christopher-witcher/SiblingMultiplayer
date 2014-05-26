 //Sets up different animation of runboy and initializes the controls
    function RunBoy(game, canvasWidth, worldWidth) {

        this.name = null;
        this.rightStanding = new Animation(ASSET_MANAGER.getAsset(heroSpriteSheet), 12, 8, 100, 150, 0.01, 1, true, false);
        this.leftStanding = new Animation(ASSET_MANAGER.getAsset(heroSpriteSheet), 0, 158, 100, 150, 0.01, 1, true, false);

        this.runRight = new Animation(ASSET_MANAGER.getAsset(heroSpriteSheet), 100, 0, 100, 150, 0.011, 120, true, false);

        this.runLeft = new Animation(ASSET_MANAGER.getAsset(heroSpriteSheet), 100, 160, 100, 150, 0.011, 120, true, false);

        this.jumpRight = new Animation(ASSET_MANAGER.getAsset(heroSpriteSheet), 10, 325, 114, 160, .015, 89, false);
        this.jumpLeft = new Animation(ASSET_MANAGER.getAsset(heroSpriteSheet), 10, 485, 114, 160, .015, 89, false);

        this.fallRight = new Animation(ASSET_MANAGER.getAsset(heroSpriteSheet), 10146, 336, 114, 160, 0.01, 1, true);
        this.fallLeft = new Animation(ASSET_MANAGER.getAsset(heroSpriteSheet), 10146, 496, 114, 160, 0.01, 1, true);
        //End of Game Animation

        this.rewindFrame = null;

        // set the sprite's starting position on the canvas
        //Entity.call(this, game, 0, startingHeight);
        //Entity.call(this, game, canvasWidth / 2, startingHeight);

        this.jumping = false;
        this.running = false;
        this.runningJump = false;
        this.standing = true;
        this.falling = false;
        this.canPass = true;
        this.landed = false;
        this.collission = false;

        this.height = 0;
        this.baseHeight = startingHeight;
        this.canvasWidth = canvasWidth;
        this.worldWidth = worldWidth;
        this.worldX = this.x;
        //this.worldX = 8100;
        this.worldY = this.y;
        this.boundingbox = new BoundingBox(this.x, this.y, 90, 145); //145
        //when its null I'm not currently on a platform.
        this.currentPlatform = null;
        //keeps track of where the bounding box's bottom was before it changed. should be when falling.
        this.lastBottom = this.boundingbox.bottom;
        this.lastTop = this.boundingbox.top;

        //stores character's rewindStack
        this.myRewindStack = [];
        this.rewinding = false;
        this.game = game;
        this.lastFrame = null;

    }

    //RunBoy.prototype = new Entity();
    RunBoy.prototype.constructor = RunBoy;

    //The update method for run boy
    //has the controls for when he will run and jump and will move the player across the screen.
    RunBoy.prototype.update = function () {
        if (this.game.running === false) {
            return;
        }

        if (this.rewinding === true && this.myRewindStack === 1) {

            return;
        } else if (this.rewinding === true) {
            return;
        }
        var maxHeight = 300;
        var tempX = this.x;
        var tempWorldX = this.worldX;
        var tempY = this.y;

        /*
         * Falling
         */
        if (this.currentPlatform === null && this.y !== startingHeight && !this.runningJump && !this.jumping) {
            console.log("here");
            this.falling = true;
            //var prevY = this.y;
            this.y = this.y + moveDistance;
            this.move();

            if (this.y > startingHeight) {
                this.y = startingHeight;
                this.falling = false;
                this.standing = true;
                this.baseHeight = this.y;
            }
            this.lastBottom = this.boundingbox.bottom;
            this.lastTop = this.boundingbox.top;
            this.boundingbox = new BoundingBox(this.x, this.y, this.boundingbox.width, this.boundingbox.height);

        }

        /*
         * Running and Jumping
         */
        if ((this.game.space && (this.game.rightArrow || this.game.leftArrow)) || this.runningJump) {
            this.runningJump = true;
            this.jumping = false;
            this.running = false;
            this.standing = false;
            var done = false;

            if (direction) { // Right

                var duration = this.jumpRight.elapsedTime + this.game.clockTick; //the duration of the jump.
                if (duration > this.jumpRight.totalTime / 2) {
                    duration = this.jumpRight.totalTime - duration;
                }
                duration = duration / this.jumpRight.totalTime;
                this.height = (4 * duration - 4 * duration * duration) * maxHeight + 17;

                if (this.jumpRight.isDone()) {
                    done = true;
                    this.jumpRight.elapsedTime = 0;
                    this.runningJump = false;
                }

            } else { // Left

                var duration = this.jumpLeft.elapsedTime + this.game.clockTick;
                if (duration > this.jumpLeft.totalTime / 2) {
                    duration = this.jumpLeft.totalTime - duration;
                }
                duration = duration / this.jumpLeft.totalTime;

                this.height = (4 * duration - 4 * duration * duration) * maxHeight + 17;

                if (this.jumpLeft.isDone()) {
                    done = true;
                    this.jumpLeft.elapsedTime = 0;
                    this.runningJump = false;
                }
            }

            this.move();
            this.game.space = false; //stop Runboy from jumping continuously
            if (done) {
                this.y = this.baseHeight;
            }
            else {
                this.y = this.baseHeight - this.height / 2;
            }
            this.didICollide();

            if (this.landed) {
                if (direction) {
                    this.jumpRight.elapsedTime = 0;
                    this.x = this.x - moveDistance;
                }
                else {
                    this.jumpLeft.elapsedTime = 0;
                    this.x = this.x + moveDistance;
                }
                this.baseHeight = this.y;
                this.runningJump = false;
                this.y = tempY;
            }
            this.lastBottom = this.boundingbox.bottom;
            this.lastTop = this.boundingbox.top;
            this.boundingbox = new BoundingBox(this.x, this.y, this.boundingbox.width, this.boundingbox.height);

            /*
             * Standing and Jumping
             */
        } else if ((this.game.space && this.standing) || this.jumping) {
            this.jumping = true;
            this.runningJump = false;
            this.running = false;
            this.standing = false;
            this.game.isRightArrowUp = true;
            this.game.isLeftArrowUp = true;
            this.game.rightArrow = false;
            this.game.leftArrow = false;

            if (direction) { // Right
                var duration = this.jumpRight.elapsedTime + this.game.clockTick; //the duration of the jump.
                if (duration > this.jumpRight.totalTime / 2) {
                    duration = this.jumpRight.totalTime - duration;
                }
                duration = duration / this.jumpRight.totalTime;
                this.height = (4 * duration - 4 * duration * duration) * maxHeight + 17;

                this.lastBottom = this.boundingbox.bottom;
                this.y = this.baseHeight - this.height / 2;

                if (this.jumpRight.isDone()) {
                    this.y = this.baseHeight;
                    this.jumpRight.elapsedTime = 0;
                    this.jumping = false;
                }

                this.boundingbox = new BoundingBox(this.x, this.y, this.boundingbox.width, this.boundingbox.height);

            } else { // Left

                var duration = this.jumpLeft.elapsedTime + this.game.clockTick;
                if (duration > this.jumpLeft.totalTime / 2) {
                    duration = this.jumpLeft.totalTime - duration;
                }
                duration = duration / this.jumpLeft.totalTime;
                this.height = (4 * duration - 4 * duration * duration) * maxHeight + 17;

                this.lastBottom = this.boundingbox.bottom;
                this.lastTop = this.boundingbox.top;
                this.y = this.baseHeight - this.height / 2;

                if (this.jumpLeft.isDone()) {
                    this.y = this.baseHeight;
                    this.jumpLeft.elapsedTime = 0;
                    this.jumping = false;
                }

                this.boundingbox = new BoundingBox(this.x - moveDistance, this.y, this.boundingbox.width, this.boundingbox.height);
            }

            if (this.landed) {
                if (direction) {
                    this.jumpRight.elapsedTime = 0;
                    this.x = this.x - moveDistance;
                }
                else {
                    this.jumpLeft.elapsedTime = 0;
                    this.x = this.x + moveDistance;
                }
                this.baseHeight = this.y;
                this.jumping = false;
                this.y = tempY;
            }

            this.game.space = false; //stop Runboy from jumping continuously

            /*
             * Running Right
             */
        } else if (this.game.rightArrow) {
            this.running = true;
            this.standing = false;
            this.jumping = false;
            this.runningJump = false;
            var tempX = this.x;
            this.move();
            this.lastBottom = this.boundingbox.bottom;
            this.lastTop = this.boundingbox.top;
            if (this.x > tempX) {
                this.boundingbox = new BoundingBox(this.x, this.y, this.boundingbox.width, this.boundingbox.height);
            } else {//for when the world x moves but running boy doesn't move?
                this.boundingbox = new BoundingBox(this.x + moveDistance, this.y, this.boundingbox.width, this.boundingbox.height);
            }

            /*
             * Running Left
             */
        } else if (this.game.leftArrow) {
            this.running = true;
            this.standing = false;
            this.jumping = false;
            this.runningJump = false;
            var tempX = this.x;
            this.move();
            this.lastBottom = this.boundingbox.bottom;
            this.lastTop = this.boundingbox.top;
            if (this.x < tempX) {
                this.boundingbox = new BoundingBox(this.x, this.y, this.boundingbox.width, this.boundingbox.height);
            } else {//for when the world x moves but running boy doesn't move?
                this.boundingbox = new BoundingBox(this.x - moveDistance, this.y, this.boundingbox.width, this.boundingbox.height);
            }

            /*
             * Standing
             */
        } else if (!this.game.leftArrow && !this.game.rightArrow && !this.game.space) {
            this.standing = true;
            this.boundingbox = new BoundingBox(this.x, this.y, 80, this.boundingbox.height);
        }

        this.didICollide();

        if (!this.canPass) {
            this.worldX = tempWorldX;
            this.x = tempX;
            //this.lastBottom = this.boundingbox.bottom;
            this.boundingbox = new BoundingBox(this.x, this.y, this.boundingbox.width, this.boundingbox.height);
        }
            //If I can pass then I must not have a current platform near me to collide with, so make sure current platform doesn't exist.
        else if (!this.collission) {
            this.currentPlatform = null;
        }

        // de-activate keydown Listeners while jumping or falling, otherwise activate them
        if (this.falling || this.jumping || this.runningJump) {
            this.game.addListeners = false;
        } else {
            this.game.addListeners = true;
        }

        Entity.prototype.update.call(this);
    };

    /*
    * Determines whether RunBoy moves on the canvas, in the world, or both.
    */
    RunBoy.prototype.move = function () {
        var canvasMidpoint = this.canvasWidth / 2;

        if (direction) {
            if ((this.worldX < canvasMidpoint) || ((this.worldX >= this.worldWidth - canvasMidpoint) &&
                (this.x + 90 <= this.canvasWidth - moveDistance))) {
                this.x += moveDistance;
                this.worldX += moveDistance;

            } else if (this.worldX >= this.worldWidth) { // he's at the right edge of the world and canvas
                this.worldX = this.worldWidth;

            } else { // he's in the middle of the canvas facing right
                this.worldX += moveDistance;
            }

        } else {
            if (this.worldX < canvasMidpoint && (this.x >= moveDistance) || (this.worldX > this.worldWidth - canvasMidpoint)) {
                this.x -= moveDistance;
                this.worldX -= moveDistance;

            } else if (this.x <= 0 || this.worldX <= 0) { // he's at the left edge of the world and canvas
                this.worldX = 0;
                this.x = 0;

            } else { // he's in the middle of the canvas facing left
                this.worldX -= moveDistance;
            }
        }
    };

    RunBoy.prototype.moveRewind = function () {
        var canvasMidpoint = this.canvasWidth / 2;

        if (this.worldX < canvasMidpoint || this.worldX > (this.worldWidth - canvasMidpoint)) {
            this.x = this.lastFrame.canvasX;
            this.worldX = this.lastFrame.worldX; //-= moveDistance;

        } else if (this.x <= 0 || this.worldX <= 0) { // he's at the left edge of the world and canvas
            this.worldX = 0;
            this.x = 0;

        } else { // he's in the middle of the canvas facing left
            this.worldX = this.lastFrame.worldX;
            //this.x = this.lastFrame.worldX;
        }

        this.y = this.lastFrame.canvasY;


        //if (this.myRewindStack.length === 1) {
        //    this.boundingbox = new BoundingBox(this.rewindFrame.x, this.rewindFrame.y,
        //        this.rewindFrame.width, this.rewindFrame.height);
        //}
        direction = this.rewindFrame.direction;
        this.falling = this.rewindFrame.falling;
        this.jumping = this.rewindFrame.jumping;
        this.runningJump = this.rewindFrame.runningJump;
        this.currentPlatform = this.rewindFrame.currentPlatform;
        this.worldY = this.lastFrame.worldY;
    }

    RunBoy.prototype.draw = function (ctx) {
        if (this.game.running === false) {
            return;
        }

        if (this.rewinding === true) {
            var canvasMidpoint = this.canvasWidth / 2;
            if (this.myRewindStack.length === 0) {

                this.rewinding = false;
                return;
            }
            this.lastFrame = this.rewindFrame.drawFrame(this.game.clockTick, ctx);
            this.moveRewind();



            //}
        } else if (this.falling) {
            //fall to the right.
            if (direction) {
                this.fallRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);
                this.addRewindFrame(this.fallRight.clipX, this.fallRight.clipY,
                    this.fallRight.frameWidth, this.fallRight.frameHeight);
            }
                //fall to the left.
            else {
                this.fallLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
                this.addRewindFrame(this.fallLeft.clipX, this.fallLeft.clipY,
                    this.fallLeft.frameWidth, this.fallLeft.frameHeight);
            }
        }
            // Jumping
        else if (this.jumping || this.runningJump) {

            //jumping to the right.
            if (direction) {
                this.jumpRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);
                this.addRewindFrame(this.jumpRight.clipX, this.jumpRight.clipY,
                    this.jumpRight.frameWidth, this.jumpRight.frameHeight);

                //jumping to the left.
            } else {
                this.jumpLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
                this.addRewindFrame(this.jumpLeft.clipX, this.jumpLeft.clipY,
                    this.jumpLeft.frameWidth, this.jumpLeft.frameHeight);
            }

            // Running, can't run in both directions.
        } else if (this.running && (this.game.isLeftArrowUp === false || this.game.isRightArrowUp === false)) {

            if (direction) {
                this.runRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);
                this.addRewindFrame(this.runRight.clipX, this.runRight.clipY,
                    this.runRight.frameWidth, this.runRight.frameHeight);

            } else {
                this.runLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
                this.addRewindFrame(this.runLeft.clipX, this.runLeft.clipY,
                    this.runLeft.frameWidth, this.runLeft.frameHeight);
            }

            // Standing
        } else {

            if (direction) {
                this.rightStanding.drawFrame(this.game.clockTick, ctx, this.x, this.y);
                this.addRewindFrame(this.rightStanding.clipX, this.rightStanding.clipY, this.rightStanding.frameWidth,
                    this.rightStanding.frameHeight);
            } else {
                this.leftStanding.drawFrame(this.game.clockTick, ctx, this.x, this.y);
                this.addRewindFrame(this.leftStanding.clipX, this.leftStanding.clipY, this.leftStanding.frameWidth,
                    this.leftStanding.frameHeight);

            }
        }

        //ctx.strokeStyle = "purple";
        //ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
    };

    RunBoy.prototype.didICollide = function () {
        //console.log("check if they collide");
        //if (this.game.running === false) {
        //    this.game.endGame();
        //    return;
        //}
        this.canPass = true;
        this.landed = false;
        this.collission = false;

        for (var i = 0; i < this.game.entities.length; i++) {

            var entity = this.game.entities[i];
            var result = this.boundingbox.collide(entity.boundingBox);



            if (result && !entity.removeFromWorld && entity instanceof Item) {
                entity.removeFromWorld = true;
                this.game.score += entity.points;
                this.game.numItems++;
                document.getElementById("score").innerHTML = this.game.score;
            }
            else if (result && entity instanceof FinishLine) {
                this.game.running = false;
            }
            else if (result && entity instanceof Enemy) {
                console.log("ran into a enemy");
                this.rewindMe();
                //console.log(entity.boundingbox.x);
            }
            else if (result && entity instanceof Platform) {

                this.collission = true;
                //check if I landed on a platform first
                if (entity.boundingBox.top > this.lastBottom && !this.landed) { //put in separate if state and change landed.
                    this.currentPlatform = entity;
                    this.landed = result;

                    // He landed on a platform while falling
                    if (this.falling) {
                        this.falling = false;
                        this.standing = true;
                        this.jumping = false;
                        this.runningJump = false;
                        this.baseHeight = this.y;
                    }

                }
                else if (entity.boundingBox.bottom < this.lastTop && !this.landed) {
                    this.landed = result;
                }
                else if (this.canPass && (this.currentPlatform == null || entity.y < this.currentPlatform.y)) {
                    this.canPass = !result;
                }

            }
        }
    }

    RunBoy.prototype.rewindMe = function () {
        //this.spriteSheet = ;
        this.rewinding = true;
        this.rewindFrame = new RewindAnimation(ASSET_MANAGER.getAsset(heroSpriteSheet), this.myRewindStack);
        this.draw(this.game.ctx);
    }
    var frameCount = 0;
    RunBoy.prototype.addRewindFrame = function (clipX, clipY, frameWidth, frameHeight) {
        if (this.myRewindStack.length >= 600) {
            this.myRewindStack.shift();
        }
        var finalIndex = this.myRewindStack.length - 1;
        var last = this.myRewindStack[finalIndex];
        var current = {
            canvasX: Math.floor(this.x), canvasY: Math.floor(this.y), worldX: Math.floor(this.worldX), worldY: Math.floor(this.worldY),
            clipX: clipX, clipY: clipY,
            frameWidth: frameWidth, frameHeight: frameHeight, direction: direction ? true : false, falling: this.falling,
            jumping: this.jumping, runningJump: this.runningJump, running: this.running, boundingbox: this.boundingbox,
            currentPlatform: this.currentPlatform
        };
        this.lastFrame = current;
        this.myRewindStack.push(current);

    }


    function Entity(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.worldX = x; //initial worldX is the same as x
        this.worldY = y; //initial worldY is the same as y
        this.removeFromWorld = false;
    }

    Entity.prototype.update = function () {
    };

    Entity.prototype.draw = function (ctx) {
        if (this.game.showOutlines && this.radius) {
            ctx.beginPath();
            ctx.strokeStyle = "green";
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.stroke();
            ctx.closePath();
        }
    };


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

    //A class for the bounding box of collision detection.
    function BoundingBox(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.left = x;
        this.top = y;
        this.right = this.left + width;
        this.bottom = this.top + height;
    }

    //checks if this bounding box collided with the other.
    BoundingBox.prototype.collide = function (oth) {

        if (oth == null) { //DO NOT CHANGE TO ===
            return null;
        }

        if (this.right > oth.left && this.left < oth.right && this.top < oth.bottom && this.bottom > oth.top) {
            return true;
        }

        return false;
    };

    BoundingBox.prototype.equals = function (oth) {

        return this.x === oth.x && this.y === oth.y && this.width === oth.width && this.height === oth.height;

    }

    /*
    * An item that the character can interact with in the world.
    */
    function Item(game, x, y, point, clipX, clipY, frameWidth, frameHeight, scale) {
        this.game = game;
        this.worldX = x;
        this.worldY = y;
        this.points = point;
        //sprite information goes here.
        this.drawItem = new Animation(ASSET_MANAGER.getAsset(heroSpriteSheet), clipX, clipY, frameWidth, frameHeight, 0.01, 1, true);
        this.width = frameWidth;
        this.height = frameHeight;
        this.scaleBy = scale;
        this.limitIndex = Math.floor((Math.random() * 15) + 7);
        this.movingUp = true;
        //made both width and height 50 because  the frameWidtha and framHeight are way to large.
        this.boundingBox = new BoundingBox(this.worldX, this.worldY, this.width * scale, this.height * scale);

        Entity.call(this, game, this.worldX, this.worldY);
        this.upperLimit = this.y - this.limitIndex;
        this.lowerLimit = this.y + this.limitIndex;
    };

    Item.prototype = new Entity();
    Item.prototype.constructor = Item;

    /*
    * updates the item.
    */
    Item.prototype.update = function () {
        if (this.movingUp && this.y > this.upperLimit) {
            this.y -= 1;
        } else if (this.movingUp && this.y <= this.upperLimit) {
            this.y += 1;
            this.movingUp = false;
        } else if (!this.movingUp && this.y < this.lowerLimit) {
            this.y += 1;
        } else if (!this.movingUp && this.y >= this.lowerLimit) {
            this.y -= 1;
            this.movingUp = true;
        }

        this.boundingBox = new BoundingBox(this.x, this.y, this.boundingBox.width, this.boundingBox.height);

        Entity.prototype.update.call(this);
    };

    /*
    * draws the item 
    */
    Item.prototype.draw = function (ctx) {
        //ctx.fillStyle = "purple";
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        this.drawItem.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scaleBy);
        //ctx.strokeStyle = "red";
        //ctx.strokeRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height);
    };

    function FinishLine(game, gameWidth, ctx) {
        // this.game = game;
        this.ctx = ctx;
        //console.log(gameWidth);
        //this.x = gameWidth;
        //this.y = 125;
        //this.width = 394;
        //this.height = 446;
        this.x = gameWidth;
        this.y = 100;
        this.width = 20;
        this.height = 200;
        this.boundingBoxOffSetX = 294;
        this.boundingBoxOffSetY = 225;
        this.runUpStairsCompleted = false;
        this.doorClosed = false;
        this.finishLineAnimation = new Animation(ASSET_MANAGER.getAsset(heroSpriteSheet), 0, 3000, 394, 446, 0.076, 30, false, false);
        this.finishLineDoorOpen = new Animation(ASSET_MANAGER.getAsset(heroSpriteSheet), 0, 3000, 394, 446, 0.01, 1, true, false);
        this.runInsideAnimation = new Animation(ASSET_MANAGER.getAsset(heroSpriteSheet), 0, 3500, 60, 180, 0.011, 120, false, false);

        this.boundingBox = new BoundingBox(this.x + this.boundingBoxOffSetX, this.y + +this.boundingBoxOffSetY, this.width, this.height + 75);
        this.runInsideCounter = 0;
        this.doorClosingCounter = 0;
        this.finishLineCompleted = false;
        Entity.call(this, game, this.x, this.y);
    }

    FinishLine.prototype = new Entity();
    FinishLine.prototype.constructor = FinishLine;

    FinishLine.prototype.isCompleted = function () {
        return this.finishLineCompleted;
    }

    FinishLine.prototype.update = function () {
        if (this.game.running === false && this.game.runInsideComplete === false) {
            return;
        }
        this.boundingBox = new BoundingBox(this.x + this.boundingBoxOffSetX, this.y + this.boundingBoxOffSetY, this.width, this.height);
        Entity.prototype.update.call(this);
    };

    FinishLine.prototype.draw = function (ctx, game) {
        //ctx.fillStyle = "white";
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        //ctx.strokeStyle = "red";
        //ctx.strokeRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height);
        if (this.game.running === true) {
            this.finishLineDoorOpen.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        } else if (this.game.running === false && this.runInsideAnimation.completed === false) {
            var canvasX = this.x + this.boundingBoxOffSetX;
            var canvasY = this.y + this.boundingBoxOffSetY;
            this.finishLineDoorOpen.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
            this.runInsideAnimation.drawFrame(this.game.clockTick, this.ctx, this.x + 250,
                this.y + 313);
            this.runUpStairsCompleted = this.runInsideAnimation.completed;
            console.log("running inside");
        } else if (this.game.running === false && this.runUpStairsCompleted === true && this.doorClosed === false) {
            this.finishLineAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
            this.doorClosed = this.finishLineAnimation.completed;
        } else if (this.game.running === false && !gameOver) {

            this.game.endGame();
            gameOver = true;
        }


    };

    /*
    * A simple object to test scrolling
    */
    function Block(game, x, y, width, height) {
        this.game = game;
        this.worldX = x;
        this.worldY = y;
        this.width = width;
        this.height = height;

        this.boundingBox = new BoundingBox(this.worldX, this.worldY, this.width, this.height);
        // set the block's initial position in the world
        Entity.call(this, game, this.worldX, this.worldY);
    };

    Block.prototype = new Entity();
    Block.prototype.constructor = Block;

    Block.prototype.update = function () {
        this.boundingBox = new BoundingBox(this.worldX, this.worldY, this.width, this.height);
        Entity.prototype.update.call(this);
    };

    Block.prototype.draw = function (ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        //ctx.strokeStyle = "red";
        //ctx.strokeRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height);
    };

    /*
    * A time for the game clock.
    */
    function GameTimer(game) {
        this.game = game;
        this.time = 0;
        this.startTime = Date.now();
        this.stopped = false;
    }

    GameTimer.prototype = new Entity();
    GameTimer.prototype.constructor = GameTimer;

    GameTimer.prototype.update = function () {
        if (!this.stopped) {
            this.time = (Date.now() - this.startTime);
            var formattedTime = convertTime(this.time);
            document.getElementById("timer").innerHTML = formattedTime;
        }
    };

    function convertTime(miliseconds) {
        var totalSeconds = 120 - Math.floor(miliseconds / 1000);

        var minutes = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds - minutes * 60;
        if (seconds === 0) {
            seconds = "0" + seconds;
        } else if (seconds % 10 === seconds) {
            seconds = "0" + seconds;
        }
        return minutes + ':' + seconds;
    }

    /*
    * Starts the game. This function is called by the HTML button called "startButton".
    */
    function startGame() {

        if (document.getElementById("startDisplay")) {
            sdParentNode = document.getElementById("startDisplay").parentNode;
            startDisplay = document.getElementById("startDisplay");
            sdParentNode.removeChild(startDisplay);
        }
        gameEngine.start();
        gameEngine.ctx.canvas.focus();
        timer = new GameTimer(gameEngine);
        gameEngine.addEntity(timer);
    };


    var ASSET_MANAGER = new AssetManager();
    ASSET_MANAGER.queueDownload(backImg);
    ASSET_MANAGER.queueDownload(heroSpriteSheet);
    window.onload = initialize;
    function initialize() {

        ASSET_MANAGER.downloadAll(function () {

            var canvas = document.getElementById('world');
            canvas.setAttribute("tabindex", 0);
            canvas.focus();
            var ctx = canvas.getContext('2d');
            gameEngine = new GameEngine();

            var gameWorld = new Background(gameEngine, canvasWidth);
            this.finishLine = new FinishLine(gameEngine, gameWorld.width, ctx);
            var boy = new RunBoy(gameEngine, canvasWidth, gameWorld.width);
            var nextWidth = 700;
            for (var i = 0; i < boardPieces.length; i++) {
                nextWidth = boardPieces[i](nextWidth, gameEngine);
                nextWidth += 500;
            }
            nextWidth -= 200;
            nextWidth += spacerSection(gameEngine, nextWidth, 375, 12, 3);
            nextWidth += rectPlatform(gameEngine, nextWidth, 450, 5, 1, true);
            nextWidth += 200;
            nextWidth += rectPlatform(gameEngine, nextWidth, 350, 5, 1, true);
            var lastEnemy = new Enemy(gameEngine, nextWidth, 435);
            gameEngine.addEntity(lastEnemy);
            gameEngine.addEntity(this.finishLine);
            gameEngine.addEntity(boy);

            var viewPort = new Viewport(boy, canvasWidth, canvas.height, gameWorld.width, gameWorld.height);
            gameEngine.setViewPort(viewPort);

            gameEngine.init(ctx);
            gameEngine.addEntity(gameWorld);
        });
    }



    function Platform(game, the_x, the_y, canvasWidth, clipX, clipY, frameWidth, frameHeight) {
        this.game = game;
        this.worldX = the_x;
        this.worldY = the_y;
        this.width = frameWidth;
        this.height = frameHeight;
        this.canvasWidth = canvasWidth;
        this.drawPlatform = new Animation(ASSET_MANAGER.getAsset(heroSpriteSheet), clipX, clipY, this.width, this.height, 0.01, 1, true);
        this.boundingBox = new BoundingBox(this.worldX, this.worldY, this.width, this.height);


        Entity.call(this, game, this.worldX, this.worldY);
        //this.game.addEntity(this);
    }

    Platform.prototype = new Entity();
    Platform.prototype.constructor = Platform;

    Platform.prototype.update = function () {
        this.boundingBox = new BoundingBox(this.x, this.y, this.width, this.height);
        Entity.prototype.update.call(this);
    };

    Platform.prototype.draw = function (ctx) {

        //ctx.strokeStyle = "red";
        //ctx.strokeRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height);
        this.drawPlatform.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    };

    var leftCrateSteps = function (game, x, y, height) {
        var size = 50;
        for (var i = 1; i <= height; i++) {
            var tempX;
            var tempY;
            for (var j = 1; j <= i; j++) {
                tempX = (j - 1) * size + x;
                tempY = (i - 1) * size + y;
                var crate = new Platform(game, tempX, tempY, canvasWidth, 1450, 4900, size, size);
                game.addEntity(crate);
            }
            var current = Math.floor(Math.random() * gameItems.length)
            var item = new Item(game, tempX, tempY - 60, gameItems[current].points, gameItems[current].clipX, gameItems[current].clipY,
                gameItems[current].frameWidth, gameItems[current].frameHeight, 0.3);
            game.addEntity(item);
        }
    };

    var rightCrateSteps = function (game, x, y, height) {
        var size = 50;
        var start = 1;
        for (var j = height; j >= 1; j--) {
            var tempX;
            var tempY;
            for (var i = start; i <= height; i++) {
                tempX = (i - 1) * size + x;
                tempY = (j - 1) * size + y;
                if (i === start) {
                    var current = Math.floor(Math.random() * gameItems.length);
                    var item = new Item(game, tempX, tempY - 60, gameItems[current].points, gameItems[current].clipX,
                        gameItems[current].clipY, gameItems[current].frameWidth, gameItems[current].frameHeight, 0.3);
                    game.addEntity(item);
                }

                var crate = new Platform(game, tempX, tempY, canvasWidth, 1450, 4900, size, size);
                game.addEntity(crate);
            }



            start++;
        }
    };

    var rectPlatform = function (game, x, y, width, height, createItems) {
        var size = 50;
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var tempX = j * size + x;
                var tempY = i * size + y;

                var crate = new Platform(game, tempX, tempY, canvasWidth, 1450, 4900, size, size);
                game.addEntity(crate);
                if (i === 0 && createItems) {
                    var current = Math.floor(Math.random() * gameItems.length)
                    var item = new Item(game, tempX, tempY - 60, gameItems[current].points, gameItems[current].clipX, gameItems[current].clipY,
                        gameItems[current].frameWidth, gameItems[current].frameHeight, 0.3);
                    game.addEntity(item);
                }
            }
        }
        //var item = new Item(game, x + 75, y - 60, 10, 0, 0, 50, 50);
        //game.addEntity(item);

        return width * size;
    };

    var spacerSection = function (game, x, y, width, height) {
        var size = 50;
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var tempX = j * size + x;
                var tempY = i * size + y;
                var current = Math.floor(Math.random() * gameItems.length)
                var item = new Item(game, tempX, tempY - 60, gameItems[current].points, gameItems[current].clipX, gameItems[current].clipY,
                    gameItems[current].frameWidth, gameItems[current].frameHeight, 0.3);
                game.addEntity(item);

            }
        }

        return width * size;
    };

    boardPieces[0] = function (startX, game) {
        var zeroEnemy = new Enemy(game, startX + 650, 435);

        var levelOne = rectPlatform(game, startX, 534, 4, 1, true);
        var levelTwo = rectPlatform(gameEngine, startX += 450, 415, 4, 1, true);
        var levelThree = rectPlatform(gameEngine, startX += 375, 296, 4, 1, true);
        var tallCrates = rectPlatform(gameEngine, startX += 455, 150, 4, 5, true);
        var sectionF = rectPlatform(gameEngine, startX += 500, 150, 8, 1, true);
        var dumpster = new Platform(game, startX - 100, 455, canvasWidth, 1200, 4700, 175, 118);
        game.addEntity(dumpster);

        //spacerSection(game, sectWidth += 250, 415, 4,2);
        game.addEntity(zeroEnemy);
        return startX;
    };

    boardPieces[1] = function (startX, game) {
        var stairsOne = rightCrateSteps(game, startX, 380, 4);
        var platTwo = rectPlatform(game, startX += 200, 380, 4, 4, true);
        var stairsThree = leftCrateSteps(game, startX += 200, 380, 4);

        return startX;
    };

    boardPieces[2] = function (startX, game) {
        var levelOne = rectPlatform(game, startX - 425, 184, 8, 1, true);
        var levelTwo = rectPlatform(game, startX += 200, 484, 4, 2, true);
        var levelThree = rectPlatform(game, startX += 50, 209, 4, 1, true);
        return startX;
    };

    boardPieces[3] = function (startX, game) {
        var sectOne = rightCrateSteps(game, startX += 50, 425, 3);
        var sectTwo = rectPlatform(game, startX += 150, 425, 2, 3, true);
        var sectFour = rectPlatform(game, startX += 300, 350, 4, 1, true);
        var enemyFive = new Enemy(game, startX - 50, 435);
        var sectThree = new Platform(game, startX += 400, 455, canvasWidth, 1200, 4700, 175, 118);
        game.addEntity(sectThree);
        game.addEntity(enemyFive);

        return startX;
    };

    boardPieces[4] = function (startX, game) {

        var sectTwo = rectPlatform(game, startX, 150, 1, 4, false);
        var sectOne = rectPlatform(game, startX, 300, 4, 1, false);
        var sectThree = rectPlatform(game, startX += 350, 425, 4, 1, true);
        var sectFour = rectPlatform(game, startX += 100, 175, 5, 1, true);
        var sectFivea = new Platform(game, startX += 500, 158, canvasWidth, 20, 4505, 248, 422);
        game.addEntity(sectFivea);
        var sectFiveb = rectPlatform(game, startX += 275, 275, 3, 1);
        //var sectFiveb = new Platform(game, startX += 250, 171, canvasWidth, 275, 4518, 187, 409);
        //game.addEntity(sectFiveb);
        var enemySeven = new Enemy(game, startX, 125);
        var sectSix = rectPlatform(game, startX += 150, 275, 8, 1);
        game.addEntity(enemySeven);
        var specialItem = new Item(game, startX + 150, 400, 250, 2600, 4750, 82, 148, 0.8);
        game.addEntity(specialItem);
        var sectEight = rectPlatform(game, startX += 350, 325, 1, 2);
        var enemyNine = new Enemy(game, startX += 50, startingHeight);
        var sectTen = rectPlatform(game, startX += 200, 300, 4, 1);

        game.addEntity(enemyNine);


        return startX;
    };


    /******************
    * All items to be used in game engine
    *
    **********************/

    var gameItems = [];

    gameItems[0] = {
        clipX: 2315,
        clipY: 4755,
        frameWidth: 2475 - 2315,
        frameHeight: 4895 - 4755,
        points: 20
    };

    gameItems[1] = {
        clipX: 2500,
        clipY: 4770,
        frameWidth: 2580 - 2500,
        frameHeight: 4890 - 4770,
        points: 20
    };

    gameItems[2] = {
        clipX: 2700,
        clipY: 4720,
        frameWidth: 2790 - 2700,
        frameHeight: 4900 - 4720,
        points: 30
    };

    gameItems[3] = {
        clipX: 2820,
        clipY: 4750,
        frameWidth: 2905 - 2820,
        frameHeight: 4905 - 4750,
        points: 30
    };

    gameItems[4] = {
        clipX: 2905,
        clipY: 4745,
        frameWidth: 3045 - 2905,
        frameHeight: 4910 - 4745,
        points: 40
    };
