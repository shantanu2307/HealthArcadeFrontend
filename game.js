class InputTrigger {
    constructor() {
        this.hasCurlInput = false;
    }
}

class Blood extends GameObjects {
    constructor(x, y, flipped) {
        super();

        var bloodSprite = new Image();
        bloodSprite.src = './GameAssets/Blood2.png';

        this.scale = 0.5;
        this.flipped = flipped;

        this.position = new Vector2(x, y);

        this.animations.splash = new Animation(bloodSprite, 110, 4, false, this.scale, '', 0.6);
        this.playAnimation('splash');
    }
}

class Enemy extends GameObjects {
    constructor(x, y, flipped) {
        super();

        this.flipped = flipped;

        this.position = new Vector2(x, y);

        var enemyWalk = new Image();
        enemyWalk.src = './GameAssets/EnemyWalk.png';

        var enemyAttack = new Image();
        enemyAttack.src = './GameAssets/EnemyAttack.png';

        var enemyIdle = new Image();
        enemyIdle.src = './GameAssets/EnemyIdle.png';

        var enemyDie = new Image();
        enemyDie.src = './GameAssets/EnemyDie.png';

        this.scale = 2;

        this.animations.idle = new Animation(enemyIdle, 88, 4, true, this.scale);
        this.animations.walk = new Animation(enemyWalk, 88, 3, true, this.scale);
        this.animations.attack = new Animation(enemyAttack, 88, 5, false, this.scale);
        this.animations.attack.nextAnimation = 'idle';
        this.animations.die = new Animation(enemyDie, 88, 4, false, this.scale);
        this.playAnimation('walk');

        this.alive = true;
        this.speed = new Vector2(2, 0);

        this.canPlayAttackSound = true;

        this.bloods = [];
    }

    update() {
        if (this.currentAnimation === 'walk') {
            if (this.flipped) {
                this.position.x -= this.speed.x;
            }
            else {
                this.position.x += this.speed.x;
            }
        }

        if (this.position.x < -200 || this.position.x > canvas.width + 200) {
            this.alive = false;
        }

        this.rectangle = new Rectangle(this.flipped ? this.position.x - 34 * this.scale : this.position.x + 22 * this.scale, this.position.y + 12 * this.scale, 10 * this.animations[this.currentAnimation].scale, 18 * this.animations[this.currentAnimation].scale);
        if (Rectangle.intersects(game.player.swordRect, this.rectangle)) {
            if (this.currentAnimation !== 'die') {
                game.sounds.enemyHit.play();
                game.sounds.enemyDie.play();
                game.score++;
                game.shake(100);

                this.bloods.push(new Blood(this.flipped ? this.position.x - 2.5 * this.rectangle.width : this.position.x + 2.5 * this.rectangle.width, this.position.y, !this.flipped));
            }

            this.playAnimation('die');
        }

        if (Rectangle.intersects(game.player.enemyArea, this.rectangle)) {
            if (this.currentAnimation === 'walk') this.playAnimation('attack');
        }

        if (this.currentAnimation === 'attack' && this.animations.attack.currentFrame === 2 && this.canPlayAttackSound && game.player.currentAnimation !== 'die') {
            game.sounds.enemySwing.play();
            this.canPlayAttackSound = false;
        }

        if (this.currentAnimation === 'attack' && this.animations.attack.currentFrame >= 6) {
            game.player.alive = false;
        }

        if (!game.player.alive && this.currentAnimation === 'walk') {
            this.playAnimation('idle');
        }

        if (this.animations.die.finishedPlaying) this.alive = false;

        this.bloods.forEach((blood) => {
            blood.update();
        })

        super.update();
    }

    draw() {
        super.draw();

        this.bloods.forEach((blood) => {
            blood.draw();
        });
    }
}

class EnemyGenerator {
    constructor() {
        this.enemies = [];
        this.enemyTimer = 100;
        this.enemyDelay = 100;

        this.lastSide = 'left';
    }

    addEnemy() {
        var shouldCreateEnemy = Math.random() > 0.15; //0.65 (create slowly but create more often)

        if (shouldCreateEnemy) {
            var side = this.lastSide === 'left' ? 'right' : 'left';
            var enemy = new Enemy(side === 'left' ? -150 : canvas.width + 150, canvas.height - 96, side === 'right');
            this.enemies.push(enemy);
            this.lastSide = side;
        }
    }

    update() {
        this.enemies.forEach((enemy) => {
            enemy.update();

            if (!enemy.alive) {
                this.enemies.splice(this.enemies.indexOf(enemy), 1);
            }
        });

        this.enemyTimer++;

        if (game.isRunning && game.player.alive && this.enemyTimer > this.enemyDelay && this.enemies.length < 4) {
            this.addEnemy();
            this.enemyTimer = 0;
        }
    }

    draw() {
        this.enemies.forEach((enemy) => {
            enemy.draw();
        });
    }
}

class Player extends GameObjects {
    constructor(x, y) {
        super();

        this.scale = 2;

        this.position = new Vector2(x, y);
        this.flipped = true;

        this.alive = true;

        var playerAttack = new Image();
        playerAttack.src = './GameAssets/PlayerAttack.png';

        var playerIdle = new Image();
        playerIdle.src = './GameAssets/PlayerIdle.png';

        var playerDie = new Image();
        playerDie.src = './GameAssets/PlayerDie.png';

        this.keyboardState = new KeyboardState();

        this.animations.idle = new Animation(playerIdle, 48, 4, true, this.scale);
        this.animations.attack = new Animation(playerAttack, 48, 4, false, this.scale, 'idle');
        this.animations.die = new Animation(playerDie, 48, 4, false, this.scale);

        this.swordRect = new Rectangle();
        this.origin = new Vector2(48, 24);

        this.enemyArea = new Rectangle(this.position.x - 20 * this.scale, this.position.y - 64 * this.scale, 40 * this.scale, 64 * this.scale);

        this.playAnimation('idle');

        this.canPlayBloodSound = true;
    }

    async update() {
        if (!this.alive && this.currentAnimation !== 'die') {
            game.sounds.enemyAttack.play();
            this.playAnimation('die');
            game.shake(200);
            const authToken = localStorage.getItem('authtoken');
            console.log(authToken);
            const date = new Date().toLocaleDateString().split('/').reverse().join('-');
            await axios.post('http://localhost:5000/api/records', {
                reps: game.score,
                date: date
            }, {
                headers: {
                    'auth-token': authToken
                }
            });
            game.music.gameMusic.stop();
            game.music.menuMusic.play();
        }

        if (!this.alive && this.currentAnimation === 'die') {
            if (this.keyboardState.isKeyDown('Space') || game.inputTrigger.hasCurlInput) {
                game.music.menuMusic.stop();
                game.preload();
                game.isRunning = true;
                game.music.menuMusic.stop();
                game.music.gameMusic.play();
            }
        }

        if (!game.isRunning) {
            if (this.keyboardState.isKeyDown('Space') || game.inputTrigger.hasCurlInput) {
                setTimeout(() => { game.isRunning = true; game.music.gameMusic.play(); game.music.menuMusic.stop(); }, 100);
            }

            super.update();
            return;
        }

        if (this.currentAnimation === 'idle') {
            if (this.animations.idle.currentFrame === 3 && this.canPlayBloodSound) {
                game.sounds.playerBlood.play();
                this.canPlayBloodSound = false;
            }
            else if (this.animations.idle.currentFrame > 3) {
                this.canPlayBloodSound = true;
            }
        }

        if ((this.keyboardState.isKeyDown('Space') || game.inputTrigger.hasCurlInput) && (this.currentAnimation === 'idle' || (this.currentAnimation === 'attack' && this.animations.attack.currentFrame > 8))) {
            this.playAnimation('attack');
            this.flipped = !this.flipped;

            game.sounds.playerAttack.play();
        }

        if (this.currentAnimation === 'attack' && this.animations.attack.currentFrame === 3) {
            this.swordRect = new Rectangle(this.position.x + (this.flipped ? -20 * this.scale : 12 * this.scale), this.position.y - this.origin.y * this.scale, 24, 64 * this.scale);
        }
        else {
            this.swordRect = new Rectangle();
        }

        super.update();
    }

    draw() {
        super.draw();
    }
}

var game = new Game();

game.setScaling((Math.floor(window.innerHeight / 384 * 10) / 10));

var gameLoaded = false;

game.preload = function () {
    this.enemies = new EnemyGenerator();
    this.player = new Player(150, canvas.height - 50);

    this.inputTrigger = new InputTrigger();

    this.sounds.playerAttack = new Howl({ src: ['./GameAssets/PlayerAttack.mp3'] });
    this.sounds.enemyHit = new Howl({ src: ['./GameAssets/EnemyHit.mp3'] });
    this.sounds.enemySwing = new Howl({ src: ['./GameAssets/EnemySwing.mp3'] });
    this.sounds.enemyAttack = new Howl({ src: ['./GameAssets/EnemyAttack.mp3'] });
    this.sounds.enemyDie = new Howl({ src: ['./GameAssets/EnemyDie.mp3'], volume: 0.25 });
    this.sounds.playerBlood = new Howl({ src: ['./GameAssets/Blood.mp3'], volume: 0.1 });

    this.music.menuMusic = new Howl({ src: ['./GameAssets/Ruins.mp3'], loop: true, volume: 0.1 });
    this.music.gameMusic = new Howl({ src: ['./GameAssets/Sorrows.mp3'], loop: true, volume: 0.25 });

    this.backgroundColor = '#1A1A1A';

    this.score = 0;
    this.highScore = this.read('score');

    this.tutorialShown = this.read('tutorialShown') ? true : false;

    this.currentGameState = this.tutorialShown ? 'game' : 'tutorial';

    this.isRunning = false;

    this.startText = "Start";
    this.tutorialTexts = ['Do a rep to attack', 'Keep attacking to proceed', 'Attacks switch direction', 'Time attacks to hit enemies', 'Attacking after death restarts', 'Attack to begin game'];
    this.tutorialIndex = 0;

    this.keyboardState = new KeyboardState();

    this.startTextPositionCounter = 0;

    this.ground = new Image();
    this.ground.src = './GameAssets/GroundAlt.png';

    this.music.menuMusic.play();
}

game.update = function () {
    gameLoaded ? this.currentGameState === 'tutorial' ? this.updateTutorial() : this.updateGame() : this.updateLoading();
}

game.updateLoading = function () {
    this.startTextPositionCounter++;
}

game.updateGame = function () {
    this.enemies.update();
    this.player.update();

    this.inputTrigger.hasCurlInput = false;
    this.startTextPositionCounter++;

    if (this.score > this.highScore) {
        this.highScore = this.score;
        this.save('score', this.highScore);
    }
}

game.updateTutorial = function () {
    this.player.update();

    if ((this.keyboardState.isKeyDown('Space') || game.inputTrigger.hasCurlInput) && this.isRunning) this.tutorialIndex++;

    if (this.tutorialIndex === this.tutorialTexts.length) {
        this.save('tutorialShown', true);
        this.currentGameState = 'game';
    }

    this.inputTrigger.hasCurlInput = false;
    this.keyboardState.resetKeyboardState();
    this.startTextPositionCounter++;
}

game.draw = function () {
    gameLoaded ? this.currentGameState === 'tutorial' ? this.drawTutorial() : this.drawGame() : this.drawLoading();
}

game.drawLoading = function () {
    Primitives2D.drawText('Loading Game', 150 - ('Loading Game'.length * 9) / 2, 272 + 6 * Math.sin(this.startTextPositionCounter / 12), '#FFFFFF', '12px Arcadia-Regular');
    Primitives2D.drawText('Please allow camera access', 150 - ('Please allow camera access'.length * 5.75) / 2, 320 + 6 * Math.sin((this.startTextPositionCounter + 64) / 12), '#FFFFFF', '8px Arcadia-Regular');
}

game.drawGame = function () {
    SpriteBatch.draw(this.ground, new Rectangle(0, canvas.height - 36, canvas.width, 36));
    this.enemies.draw();
    this.player.draw();

    Primitives2D.drawText(this.score.toString(), 150 - (this.score.toString().length * 18) / 2, 96, '#FFFFFF', '36px Arcadia-Regular');

    if (!this.player.alive) {
        Primitives2D.drawText('Best', 150 - ('Best'.length * 9) / 2, 220 + 3 * Math.sin((this.startTextPositionCounter + 128) / 6), '#FF0000', '12px Arcadia-Regular');
        Primitives2D.drawText('Best', 150 - ('Best'.length * 9) / 2, 220 + 3 * Math.sin((this.startTextPositionCounter + 96) / 6), '#0000FF', '12px Arcadia-Regular');
        Primitives2D.drawText('Best', 150 - ('Best'.length * 9) / 2, 220 + 3 * Math.sin((this.startTextPositionCounter + 64) / 6), '#FFFFFF', '12px Arcadia-Regular');

        Primitives2D.drawText(this.highScore.toString(), 150 - (this.highScore.toString().length * 32) / 2, 272 + 3 * Math.sin((this.startTextPositionCounter + 128) / 6), '#FF0000', '48px Arcadia-Regular');
        Primitives2D.drawText(this.highScore.toString(), 150 - (this.highScore.toString().length * 32) / 2, 272 + 3 * Math.sin((this.startTextPositionCounter + 96) / 6), '#0000FF', '48px Arcadia-Regular');
        Primitives2D.drawText(this.highScore.toString(), 150 - (this.highScore.toString().length * 32) / 2, 272 + 3 * Math.sin((this.startTextPositionCounter + 64) / 6), '#FFFFFF', '48px Arcadia-Regular');

        if (this.score === this.highScore) {
            Primitives2D.drawText('New Best!', 150 - ('New Best!'.length * 9) / 2, 298 + 3 * Math.sin((this.startTextPositionCounter + 128) / 6), '#FF0000', '12px Arcadia-Regular');
            Primitives2D.drawText('New Best!', 150 - ('New Best!'.length * 9) / 2, 298 + 3 * Math.sin((this.startTextPositionCounter + 96) / 6), '#0000FF', '12px Arcadia-Regular');
            Primitives2D.drawText('New Best!', 150 - ('New Best!'.length * 9) / 2, 298 + 3 * Math.sin((this.startTextPositionCounter + 64) / 6), '#FFFFFF', '12px Arcadia-Regular');
        }
    }

    if (!this.isRunning) Primitives2D.drawText(this.startText, 150 - (this.startText.length * 9) / 2, 272 + 6 * Math.sin(this.startTextPositionCounter / 12), '#FFFFFF', '12px Arcadia-Regular');
}

game.drawTutorial = function () {
    SpriteBatch.draw(this.ground, new Rectangle(0, canvas.height - 36, canvas.width, 36));
    this.player.draw();

    if (!this.isRunning) Primitives2D.drawText(this.startText, 150 - (this.startText.length * 9) / 2, 272 + 6 * Math.sin(this.startTextPositionCounter / 12), '#FFFFFF', '12px Arcadia-Regular');
    else {
        Primitives2D.drawText(this.tutorialTexts[this.tutorialIndex], 150 - (this.tutorialTexts[this.tutorialIndex].length * 9) / 2, 272 + 6 * Math.sin(this.startTextPositionCounter / 16), '#FFFFFF', '12px Arcadia-Regular');
    }
}

game.run();