export const DDGKeys = {
    Up: Symbol("DDGKeys.Up"),
    Down: Symbol("DDGKeys.Down"),
    Left: Symbol("DDGKeys.Left"),
    Right: Symbol("DDGKeys.Right"),
    Pause: Symbol("DDGKeys.Pause"),
};
const DirectionKeys = [
    DDGKeys.Up,
    DDGKeys.Down,
    DDGKeys.Left,
    DDGKeys.Right,
];

class DDGFieldElement {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class DDGRectangle extends DDGFieldElement {
    constructor(x, y, width, height) {
        super(x, y); // shape center
        this.width = width;
        this.height = height;
    }

    static bottomLeftToTopRight(x1, y1, x2, y2) {
        if(x2 < x1 || y2 < y1) {
            throw new RangeError("Coordinates would draw inverted shape");
        } 
        let width = x2 - x1;
        let height = y2 - y1;
        return new DDGRectangle(x1 + width / 2, y1 + height / 2, width, height);
    }

    intersectsRectangle(rect) {
        return (
            this.x - this.width / 2 < rect.x + rect.width / 2 &&
            this.x + this.width / 2 > rect.x - rect.width / 2 &&
            this.y - this.height / 2 < rect.y + rect.height / 2 &&
            this.y + this.height / 2 > rect.y - rect.height / 2
        );
    }
}

class DDGPlayer extends DDGRectangle {
    constructor(x, y, width, speed) {
        super(x, y, width, width);
        this.speed = speed; // pixels moved per second
    }

    get size() {
        return this.width;
    }

    getPosition() {
        return { x: this.x, y: this. y };
    }
}

export class DDGLogic {
    #pressed = {
        [DDGKeys.Up]: false,
        [DDGKeys.Down]: false,
        [DDGKeys.Left]: false,
        [DDGKeys.Right]: false,
    };
    #paused = false;
    #lastMillisecondsElapsed;
    #deltaRemaining = 0.0;
    #MIN_SIMULATION_STEP = 10; // milliseconds
    #cursor = { x: undefined, y: undefined };

    width = 1024;
    height = 1024;

    player = new DDGPlayer(200, 200, 32, 320 / 1000); // division resolves to pixels moved per millisecond
    obstacles = [];
    hazards = [];

    constructor() {
        this.obstacles.push(DDGRectangle.bottomLeftToTopRight(0, 0, this.width, 50));
        this.obstacles.push(DDGRectangle.bottomLeftToTopRight(0, 0, 50, this.height));
        this.obstacles.push(DDGRectangle.bottomLeftToTopRight(0, this.height - 50, this.width, this.height));
        this.obstacles.push(DDGRectangle.bottomLeftToTopRight(this.width - 50, 0, this.width, this.height));
        this.hazards.push(new DDGRectangle(512, 512, 50, 50));
    }

    get paused() { return this.#paused; }

    pause() {
        this.#paused = true;
        for(let key of DirectionKeys) {
            this.sendKeyUp(key);
        }
    }

    resume() {
        this.#paused = false;
    }

    togglePause() {
        if(this.#paused) {
            this.resume();
        }
        else {
            this.pause();
        }
    }

    sendKeyDown(key) {
        if(key in this.#pressed) {
            this.#pressed[key] = true;
        }
        if(key === DDGKeys.Pause) {
            this.togglePause();
        }
    }

    sendKeyUp(key) {
        this.#pressed[key] = false;
    }

    sendCursorPosition(position) {
        this.#cursor.x = position.x;
        this.#cursor.y = position.y;
    }

    liftCursor() {
        this.#cursor.x = this.#cursor.y = undefined;
    }

    get cursorPosition() {
        return { x: this.#cursor.x, y: this.#cursor.y };
    }

    #updateDelta(millisecondsElapsed) {
        const delta = this.#lastMillisecondsElapsed === undefined
            ? 0
            : millisecondsElapsed - this.#lastMillisecondsElapsed;
        this.#lastMillisecondsElapsed = millisecondsElapsed;
        this.#deltaRemaining += delta;
    }

    resetPlayer() {
        // TODO: programmable reset points
        this.player.x = 200;
        this.player.y = 200;
    }

    // NOTE: mutates coordinates, and does not restore them
    #testPlayerCoordinates(testX, testY) {
        this.player.x = testX;
        this.player.y = testY;
        for(let obstacle of this.obstacles) {
            if(this.player.intersectsRectangle(obstacle)) {
                return false;
            }
        }
        return true;
    }

    // if collision cannot be resolved, player position is left as (oldX,oldY)
    #resolveCollision(oldX, oldY, newX, newY) {
        if(this.#testPlayerCoordinates(newX, oldY)) {
            return;
        }
        if(this.#testPlayerCoordinates(oldX, newY)) {
            return;
        }
        if(this.#testPlayerCoordinates(oldX, oldY)) {
            return;
        }
        console.warn("Could not resolve collision.");
    }

    #stepPlayer(delta) {
        let dx = 0;
        let dy = 0;

        if(this.#pressed[DDGKeys.Up]) {
            dy++;
        }
        if(this.#pressed[DDGKeys.Down]) {
            dy--;
        }
        if(this.#pressed[DDGKeys.Left]) {
            dx--;
        }
        if(this.#pressed[DDGKeys.Right]) {
            dx++;
        }

        const oldX = this.player.x;
        const oldY = this.player.y;

        const newX = this.player.x + dx * this.player.speed * delta;
        const newY = this.player.y + dy * this.player.speed * delta;
        
        this.player.x = newX;
        this.player.y = newY;

        // TODO: optimize by testing only obstacles and hazards close to player
        for(const obstacle of this.obstacles) {
            if(this.player.intersectsRectangle(obstacle)) {
                this.#resolveCollision(oldX, oldY, newX, newY);
                break;
            }
        }
        for(let hazard of this.hazards) {
            if(this.player.intersectsRectangle(hazard)) {
                this.resetPlayer();
                break;
            }
        }
    }

    #discreteStep(delta) {
        // delta guaranteed to be equal to this.#MIN_SIMULATION_STEP
        if(this.#paused) {
            // TODO: optimize by not calling discreteStep?
            return;
        }

        this._tempHazardTimer ??= 0;
        this._tempHazardTimer += delta;
        if(this._tempHazardTimer >= 500/*ms*/) {
            this._tempHazardTimer = 0;
            this.hazards[0].x = Math.random() * 1024 | 0;
            this.hazards[0].y = Math.random() * 1024 | 0;
        }
        this.#stepPlayer(delta);
    }

    step(millisecondsElapsed) {
        this.#updateDelta(millisecondsElapsed);
        // console.log("Delta:", this.#deltaRemaining);

        if(this.#deltaRemaining === 0) {
            return;
        }

        while(this.#deltaRemaining >= this.#MIN_SIMULATION_STEP) {
            this.#deltaRemaining -= this.#MIN_SIMULATION_STEP;
            this.#discreteStep(this.#MIN_SIMULATION_STEP);
        }
    }
};
