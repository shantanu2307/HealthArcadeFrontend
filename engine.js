/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

class KeyboardState {
    constructor() {
        this.keys = {};

        function keyUpCallback(e) {
            e.preventDefault();
            this.keys[e.code] = false;
        }

        function keyDownCallback(e) {
            e.preventDefault();
            this.keys[e.code] = true;
        }

        keyUpCallback = keyUpCallback.bind(this);
        keyDownCallback = keyDownCallback.bind(this);

        window.addEventListener("keydown", keyDownCallback);
        window.addEventListener("keyup", keyUpCallback);
    }

    isKeyDown(key) {
        return this.keys[key];
    }

    isKeyUp(key) {
        return !this.keys[key];
    }

    resetKeyboardState() {
        this.keys = {};
    }
}

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    static add(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    static subtract(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }

    static multiply(v1, v2) {
        return new Vector2(v1.x * v2.x, v1.y * v2.y);
    }

    static divide(v1, v2) {
        return new Vector2(v1.x / v2.x, v1.y / v2.y);
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    static cross(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    }

    static distance(v1, v2) {
        return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
    }

    static angleBetween(v1, v2) {
        return Math.acos(Vector2.dot(v1, v2) / (v1.magnitude() * v2.magnitude()));
    }

    static angleBetweenDegrees(v1, v2) {
        return Vector2.angleBetween(v1, v2) * 180 / Math.PI;
    }

    static normalize(v1) {
        return Vector2.divide(v1, v1.magnitude());
    }

    static zero() {
        return new Vector2(0, 0);
    }

    static one() {
        return new Vector2(1, 1);
    }
}

class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    static distance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }
    static zero() {
        return new Point(0, 0);
    }

    static one() {
        return new Point(1, 1);
    }
}

class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    static contains(rect, point) {
        return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
    }

    static intersects(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
    }
}

class Primitives2D {
    static drawLine(x1, y1, x2, y2, color = '#000000', lineWidth = 1) {
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
    }

    static drawRectangle(x, y, width, height, color = '#000000', lineWidth = 1) {
        ctx.closePath();

        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
    }

    static fillRectangle(x, y, width, height, color = '#000000') {
        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        ctx.closePath();

        ctx.beginPath();
    }

    static drawCircle(x, y, radius, color = '#000000', lineWidth = 1) {
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
    }

    static fillCircle(x, y, radius, color = '#000000') {
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
    }

    static drawText(text, x, y, color = '#000000', font = '10px Arial') {
        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.fillText(text, x, y);
        ctx.closePath();

        ctx.beginPath();
    }
}

class SpriteBatch {
    /*static draw(texture, destinationRect, sourceRect = new Rectangle(0, 0, texture.width, texture.height), flipped = false, origin = Vector2.zero, scale = 0) {
        ctx.save();

        destinationRect.x = flipped ? (destinationRect.x + origin.x * scale / 2 ) * -1 : destinationRect.x - origin.x * scale / 2;
        ctx.scale(flipped ? -1 : 1, 1);
        ctx.drawImage(texture, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, destinationRect.x, destinationRect.y - origin.y * scale, destinationRect.width * scale, destinationRect.height * scale);

        ctx.restore();
    }*/

    static draw(texture, destinationRect) {
        ctx.drawImage(texture, destinationRect.x, destinationRect.y, destinationRect.width, destinationRect.height);
    }
}

class Animation {
    constructor(texture, frameWidth, frameRate = 4, looping = false, scale = 1, nextAnimation = '', opacity = 1) {
        this.texture = texture;
        this.frameWidth = frameWidth;
        this.frameRate = frameRate;
        this.looping = looping;

        this.currentFrame = 0;

        this.time = 0;
        this.scale = scale;
        this.opacity = opacity;

        this.finishedPlaying = false;
        this.nextAnimation = nextAnimation;
    }

    play() {
        this.finishedPlaying = false;
        this.currentFrame = 0;
    }

    update() {
        this.time++;

        if (this.time > this.frameRate) {
            this.time = 0;
            this.currentFrame++;

            if (this.currentFrame > this.texture.width / this.frameWidth - 1) {
                if (this.looping) {
                    this.currentFrame = 0;
                }
                else {
                    this.currentFrame = this.texture.width / this.frameWidth - 1;
                    this.finishedPlaying = true;
                }
            }
        }
    }

    draw(x, y, flipped = false, origin = Vector2.zero) {
        ctx.save();

        x = flipped ? (x + origin.x * this.scale / 2 ) * -1 : x - origin.x * this.scale / 2;
        ctx.scale(flipped ? -1 : 1, 1);
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(this.texture, this.currentFrame * this.frameWidth, 0, this.frameWidth, this.texture.height, x, y - origin.y * this.scale, this.frameWidth * this.scale, this.texture.height * this.scale);

        ctx.restore();
    }
}

class GameObjects {
    animations = {};
    currentAnimation = '';
    flipped = false;
    position = new Vector2();
    rectangle = new Rectangle();
    origin = new Vector2();
    scale = 1;

    updateAnimation() {
        if (this.animations[this.currentAnimation]) {
            if (this.animations[this.currentAnimation].finishedPlaying && this.animations[this.currentAnimation].nextAnimation != '') {
                this.playAnimation(this.animations[this.currentAnimation].nextAnimation);
            }
            else {
                this.animations[this.currentAnimation].update();
            }
        }
    }

    playAnimation(animation) {
        if (animation.length > 0 && this.animations[animation]) {
            this.currentAnimation = animation;
            this.animations[animation].play();
            this.scale = this.animations[animation].scale;
        }
    }

    update() {
        this.updateAnimation();
    }

    draw() {
        if (this.currentAnimation.length > 0 && this.animations[this.currentAnimation]) {
            this.animations[this.currentAnimation].draw(this.position.x, this.position.y, this.flipped, this.origin);
        }
    }
}

class Game {
    constructor() {
        this.backgroundColor = '#000000';
        this.sounds = {};
        this.scaling = 1;

        this.music = {};
    }

    setScaling(scaling) {
        this.scaling = scaling;
        canvas.style.setProperty('--scaleFactor', scaling);
    }

    save(key, value) {
        window.localStorage.setItem(key, JSON.stringify(value));
    }

    read(key) {
        return JSON.parse(window.localStorage.getItem(key)) ? JSON.parse(window.localStorage.getItem(key)) : null;
    }

    run() {
        this.preload();
        //setInterval(() => this.loop(), 1000 / 60);
    }

    loop () {
        this.update();
        this.drawLoop();
    }

    preload() {
        
    }

    update() {
        
    }

    clear() {
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    }

    drawLoop() {
        this.clear();

        ctx.beginPath();
        this.draw();
        ctx.closePath();
    }

    draw() {

    }

    shake(duration = 250) {
        canvas.style.animation = `shake 0.${duration}s`;
        setTimeout(() => { canvas.style.animation = ''; }, duration);
    }
}