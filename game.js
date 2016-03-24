//Sounds
var errorsound = document.querySelector('#errorsound');
var explosionsound = document.querySelector('#explosionsound');
/////////
var canvasBg = document.getElementById('canvasBg');
var ctxBg = canvasBg.getContext('2d');
var canvasJet = document.getElementById('canvasJet');
var ctxJet = canvasJet.getContext('2d');
var canvasEnemy = document.getElementById('canvasEnemy');
var ctxEnemy = canvasEnemy.getContext('2d');
var canvasHUD = document.getElementById('canvasHUD');
var ctxHUD = canvasHUD.getContext('2d');
ctxHUD.fillStyle = "rgba(250,0,0,0.7)";
ctxHUD.font = "bold 20px Arial";

var jet1 = new Jet();
var btnPlay = new Button(265, 535, 220, 335);
var gameWidth = canvasBg.width;
var gameHeight = canvasBg.height;
var bgDrawX1 = 0;
var bgDrawX2 = 1600;
var mouseX = 0;
var mouseY = 0;
var isPlaying = false;
var requestAnimFrame =  window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        function(callback) {
                            window.setTimeout(callback, 1000 / 60);
                        };
var enemies = [];
var imgSprite = new Image();
imgSprite.src = 'sprite.png';
imgSprite.addEventListener('load', init, false);

// main functions

function init() {
    spawnEnemy(5);/////////TODO Levels depending on score 
    drawMenu();
    document.addEventListener('click', mouseClicked, false);
}

function playGame() {
    drawBg();
    startLoop();
    updateHUD();
    document.addEventListener('keydown', checkKeyDown, false);
    document.addEventListener('keyup', checkKeyUp, false);
}

function spawnEnemy(number) {
    for (var i = 0; i < number; i++) {
        enemies[enemies.length] = new Enemy();
    }
}

function drawAllEnemies() {
    clearCtxEnemy();
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].draw();
    }
}
 
function loop() {
    if (isPlaying) {
        moveBg();
        jet1.draw();
        drawAllEnemies();
        requestAnimFrame(loop);
    }
}

function startLoop() {
    isPlaying = true;
    loop();
}

function stopLoop() {
    isPlaying = false;
}

function drawMenu() {
    ctxBg.drawImage(imgSprite, 0, 605, gameWidth, gameHeight, 0, 0, gameWidth, gameHeight);
}

function drawBg() {
    ctxBg.clearRect(0, 0, gameWidth, gameHeight);
    ctxBg.drawImage(imgSprite, 0, 0, 1600, gameHeight, bgDrawX1, 0, 1600, gameHeight);
    ctxBg.drawImage(imgSprite, 0, 0, 1600, gameHeight, bgDrawX2, 0, 1600, gameHeight);
}

function moveBg() {
    bgDrawX1 -= 3;
    bgDrawX2 -= 3;
    if (bgDrawX1 <= -1600) {
        bgDrawX1 = 1590;
    } else if (bgDrawX2 <= -1600) {
        bgDrawX2 = 1590;//1600
    }
    drawBg();
}

function updateHUD() {
    ctxHUD.clearRect(0, 0, gameWidth, gameHeight);
    ctxHUD.fillText("Score: " +  jet1.score, 680, 30);
}
// end of main functions

// jet functions

function Jet() {
    this.srcX = 0;
    this.srcY = 505;
    this.width = 100;
    this.height = 50;
    this.speed = 4;
    this.drawX = 220;//220
    this.drawY = 200;//200
    this.noseX = this.drawX + 100;
    this.noseY = this.drawY + 50;
    this.leftX = this.drawX;
    this.rightX = this.drawX + this.width;
    this.topY = this.drawY;
    this.bottomY = this.drawY + this.height;
    this.isUpKey = false;
    this.isRightKey = false;
    this.isDownKey = false;
    this.isLeftKey = false;
    this.isSpacebar = false;
    this.isShooting = false;
    this.bullets = [];
    this.currentBullet = 0;
    for (var i = 0; i < 25; i++) {
        this.bullets[this.bullets.length] = new Bullet(this);
    }
    this.score = 0;
}

Jet.prototype.draw = function() {
    clearCtxJet();
    this.updateCoors();
    this.checkDirection();
    this.checkShooting();
    this.drawAllBullets();
    ctxJet.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height); 
    this.checkHitEnemy();///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

};

Jet.prototype.updateCoors = function() {
    this.noseX = this.drawX + 100;
    this.noseY = this.drawY + 30;
    this.leftX = this.drawX;
    this.rightX = this.drawX + this.width;
    this.topY = this.drawY;
    this.bottomY = this.drawY + this.height;
};


Jet.prototype.checkDirection = function() {
    if (this.isUpKey && this.topY > 0) {
        this.drawY -= this.speed;
    }
    if (this.isRightKey && this.rightX < gameWidth) {
        this.drawX += this.speed;
    }
    if (this.isDownKey && this.bottomY < gameHeight) {
        this.drawY += this.speed;
    }
    if (this.isLeftKey && this.leftX > 0) {
        this.drawX -= this.speed;
    }
};

Jet.prototype.drawAllBullets = function() {
    for (var i = 0; i < this.bullets.length; i++) {
        if (this.bullets[i].drawX >= 0) this.bullets[i].draw();
        if (this.bullets[i].explosion.hasHit) this.bullets[i].explosion.draw();
    }
};

Jet.prototype.checkShooting = function() {
    if (this.isSpacebar && !this.isShooting) {
        this.isShooting = true;
        this.bullets[this.currentBullet].fire(this.noseX, this.noseY);
        this.currentBullet++;
        if (this.currentBullet >= this.bullets.length) this.currentBullet = 0;
    } else if (!this.isSpacebar) {
        this.isShooting = false;
    }
};

Jet.prototype.updateScore = function(points) {
    this.score += points;
    updateHUD();
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Jet.prototype.checkHitEnemy = function() {
    var hit = false;
    for (var i = 0; i < enemies.length; i++) {
        if (this.drawX+100 >= enemies[i].drawX &&
            this.drawX+100 <= enemies[i].drawX + enemies[i].width &&
            this.drawY+50 >= enemies[i].drawY &&
            this.drawY+50 <= enemies[i].drawY + enemies[i].height) {

            clearCtxJet();
            clearCtxEnemy();
            isPlaying=false;
            ctxBg.drawImage(imgSprite, 800, 605, gameWidth, gameHeight, 0, 0, gameWidth, gameHeight);

             //TODO 
            //Draw Explosion 
            //print the total Score 
           
            window.console.log("hit");
            hit = true;
        }
    }
    if (hit) {
         enemies =[];
         init(); 
         var result = confirm('You scored * '+ jet1.score +' * ready to play again?');
        if ( result ) {
              location.reload();
        } else {
          location.reload();
        }
    }
};
function clearCtxJet() {
    ctxJet.clearRect(0, 0, gameWidth, gameHeight);
}

// end of jet functions















// bullet functions

function Bullet(j) {
    this.jet = j;
    this.srcX = 100;
    this.srcY = 500;
    this.drawX = -20;
    this.drawY = 0;
    this.width = 5;
    this.height = 5;
    this.explosion = new Explosion();
}

Bullet.prototype.draw = function() {
    this.drawX += 3;
    ctxJet.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
    this.checkHitEnemy();
    if (this.drawX > gameWidth) this.recycle();
};

Bullet.prototype.fire = function(startX, startY) {
    errorsound.play();
    this.drawX = startX;
    this.drawY = startY;
};

Bullet.prototype.checkHitEnemy = function() {
    for (var i = 0; i < enemies.length; i++) {
        if (this.drawX >= enemies[i].drawX &&
            this.drawX <= enemies[i].drawX + enemies[i].width &&
            this.drawY >= enemies[i].drawY &&
            this.drawY <= enemies[i].drawY + enemies[i].height) {
                explosionsound.play();
                this.explosion.drawX = enemies[i].drawX - (this.explosion.width / 2);
                this.explosion.drawY = enemies[i].drawY;
                this.explosion.hasHit = true;
                this.recycle();
                enemies[i].recycleEnemy();
                this.jet.updateScore(enemies[i].rewardPoints);
        }
    }
};

Bullet.prototype.recycle = function() {
    this.drawX = -20;
};


// end of bullet functions



// explosion functions

function Explosion() {
    this.srcX = 750;
    this.srcY = 500;
    this.drawX = 0;
    this.drawY = 0;
    this.width = 50;
    this.height = 50;
    this.hasHit = false;
    this.currentFrame = 0;
    this.totalFrames = 10;
}

Explosion.prototype.draw = function() {
    if (this.currentFrame <= this.totalFrames) {
        ctxJet.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
        this.currentFrame++;
    } else {
        this.hasHit = false;
        this.currentFrame = 0;
    }
};


// end of explosion functions












// enemy functions

function Enemy() {
    this.srcX = 0;
    this.srcY = 555;
    this.width = 100;
    this.height = 50;
    this.speed = 2;
    this.drawX = Math.floor(Math.random() * 1000) + gameWidth;
    this.drawY = Math.floor(Math.random() * gameHeight);
    this.rewardPoints = 5;
}

Enemy.prototype.draw = function() {
    this.drawX -= this.speed;
    ctxEnemy.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
    this.checkEscaped();
};

Enemy.prototype.checkEscaped = function() {
    if (this.drawX + this.width <= 0) {
        this.recycleEnemy();
    }
};

Enemy.prototype.recycleEnemy = function() {
    this.drawX = Math.floor(Math.random() * 1000) + gameWidth;
    this.drawY = Math.floor(Math.random() * 360);
};

function clearCtxEnemy() {
    ctxEnemy.clearRect(0, 0, gameWidth, gameHeight);
}

// end enemy functions






// button functions

function Button(xL, xR, yT, yB) {
    this.xLeft = xL;
    this.xRight = xR;
    this.yTop = yT;
    this.yBottom = yB;
}

Button.prototype.checkClicked = function() {
    if (this.xLeft <= mouseX && mouseX <= this.xRight && this.yTop <= mouseY && mouseY <= this.yBottom) return true;
};

// end of button functions







// event functions
function mouseClicked(e) {
    mouseX = e.pageX - canvasBg.offsetLeft;
    mouseY = e.pageY - canvasBg.offsetTop;
    if (!isPlaying) {
        if (btnPlay.checkClicked()) playGame();
    }
}

function checkKeyDown(e) {
    var keyID = e.keyCode || e.which;
    if (keyID === 38 || keyID === 87) { //up arrow or W key
        jet1.isUpKey = true;
        e.preventDefault();
    }
    if (keyID === 39 || keyID === 68) { //right arrow or D key
        jet1.isRightKey = true;
        e.preventDefault();
    }
    if (keyID === 40 || keyID === 83) { //down arrow or S key
        jet1.isDownKey = true;
        e.preventDefault();
    }
    if (keyID === 37 || keyID === 65) { //left arrow or A key
        jet1.isLeftKey = true;
        e.preventDefault();
    }
    if (keyID === 32) { //spacebar
        jet1.isSpacebar = true;
        e.preventDefault();
    }
    if (keyID === 27) { ///////////escape key for pause and play ////////////////////////////////////////
       if (isPlaying) 
        {
            stopLoop();
        }
        else
        {
            startLoop();
        }

    }
}

function checkKeyUp(e) {
    var keyID = e.keyCode || e.which;
    if (keyID === 38 || keyID === 87) { //up arrow or W key
        jet1.isUpKey = false;
        e.preventDefault();
    }
    if (keyID === 39 || keyID === 68) { //right arrow or D key
        jet1.isRightKey = false;
        e.preventDefault();
    }
    if (keyID === 40 || keyID === 83) { //down arrow or S key
        jet1.isDownKey = false;
        e.preventDefault();
    }
    if (keyID === 37 || keyID === 65) { //left arrow or A key
        jet1.isLeftKey = false;
        e.preventDefault();
    }
    if (keyID === 32) { //spacebar
        jet1.isSpacebar = false;
        e.preventDefault();
    }
}

// end of event functions