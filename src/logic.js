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

    width = 1024;
    height = 1024;

    player = new DDGPlayer(30, 30, 32, 320 / 1000); // division resolves to pixels moved per millisecond
    obstacles = [];

    constructor() {
        this.obstacles.push(new DDGRectangle(500, 500, 30, 70));
        this.obstacles.push(new DDGRectangle(30, 500, 130, 70));
        this.obstacles.push(new DDGRectangle(500, 30, 200, 350));
        this.obstacles.push(new DDGRectangle(1000, 1000, 10, 10));
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

    #updateDelta(millisecondsElapsed) {
        const delta = this.#lastMillisecondsElapsed === undefined
            ? 0
            : millisecondsElapsed - this.#lastMillisecondsElapsed;
        this.#lastMillisecondsElapsed = millisecondsElapsed;
        this.#deltaRemaining += delta;
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

        this.player.x += dx * this.player.speed * delta;
        this.player.y += dy * this.player.speed * delta;
    }

    #discreteStep(delta) {
        // delta guaranteed to be equal to this.#MIN_SIMULATION_STEP
        if(this.#paused) {
            // TODO: optimize by not calling discreteStep?
            return;
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
