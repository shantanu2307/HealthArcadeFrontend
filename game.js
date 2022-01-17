class InputTrigger {
    constructor() {
        this.hasCurlInput = false;
    }
}

class Enemy extends GameObjects {
    constructor(x, y, flipped) {
        super();

        this.flipped = flipped;

        this.position = new Vector2(x, y);

        var enemyWalk = new Image();
        enemyWalk.src = './EnemyWalk.png';

        var enemyAttack = new Image();
        enemyAttack.src = './EnemyAttack.png';

        var enemyIdle = new Image();
        enemyIdle.src = './EnemyIdle.png';

        var enemyDie = new Image();
        enemyDie.src = './EnemyDie.png';

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
            if (this.currentAnimation !== 'die') { game.sounds.enemyHit.play(); game.score++; }
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

        super.update();
    }

    draw() {
        /*Primitives2D.fillRectangle(this.rectangle.x, this.rectangle.y, this.rectangle.width, this.rectangle.height, '#FF000044');*/
        super.draw();
    }
}

class EnemyGenerator {
    constructor() {
        this.enemies = [];
        this.enemyTimer = 0;
        this.enemyDelay = 50; //20

        this.lastSide = 'left';
    }

    addEnemy() {
        var shouldCreateEnemy = Math.random() > 0.5; //0.65 (create slowly but create more often)

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

        if (this.enemyTimer > this.enemyDelay && this.enemies.length < 4) {
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
        playerAttack.src = './PlayerAttack.png';

        var playerIdle = new Image();
        playerIdle.src = './PlayerIdle.png';

        var playerDie = new Image();
        playerDie.src = './PlayerDie.png';

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

    update() {
        if (!this.alive && this.currentAnimation !== 'die') {
            game.sounds.enemyAttack.play();
            this.playAnimation('die');
            super.update();

            return;
        }

        if (!this.alive && this.currentAnimation === 'die') {
            if (this.keyboardState.isKeyDown('Space') || game.inputTrigger.hasCurlInput) game.preload();
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
        /*Primitives2D.fillRectangle(this.swordRect.x, this.swordRect.y, this.swordRect.width, this.swordRect.height, '#FF000044');
        Primitives2D.fillRectangle(this.enemyArea.x, this.enemyArea.y, this.enemyArea.width, this.enemyArea.height, '#FFFFFF44');*/
        super.draw();
    }
}

var game = new Game();

game.preload = function () {
    this.enemies = new EnemyGenerator();
    this.player = new Player(150, canvas.height - 50);

    this.inputTrigger = new InputTrigger();

    this.sounds.playerAttack = new Howl({ src: ['PlayerAttack.mp3'] });
    this.sounds.enemyHit = new Howl({ src: ['EnemyHit.mp3'] });
    this.sounds.enemySwing = new Howl({ src: ['EnemySwing.mp3'] });
    this.sounds.enemyAttack = new Howl({ src: ['EnemyAttack.mp3'] });
    this.sounds.playerBlood = new Howl({ src: ['Blood.mp3'], volume: 0.1 });

    this.backgroundColor = '#222222';

    this.score = 0;
}

game.update = function () {
    this.enemies.update();
    this.player.update();

    this.inputTrigger.hasCurlInput = false;
}

game.draw = function () {
    this.enemies.draw();
    this.player.draw();
    Primitives2D.fillRectangle(0, 650, canvas.width, 650, '#00000066', 4);
    Primitives2D.drawText(this.score.toString(), 150 - (this.score.toString().length * 12) / 2, 40, '#FFFFFF', '24px Arial')
}

game.run();