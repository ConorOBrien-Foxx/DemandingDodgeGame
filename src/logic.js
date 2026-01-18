export const DDGKeys = {
    Up: Symbol("DDGKeys.Up"),
    Down: Symbol("DDGKeys.Down"),
    Left: Symbol("DDGKeys.Left"),
    Right: Symbol("DDGKeys.Right"),
};

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

    constructor() {
        this.player = {
            position: { x: 30, y: 30 }, // player center
            size: 32, // pixels; square width and height
            speed: 320 / 1000, // pixels moved per second; division resolves to pixels moved per millisecond
        };
    }

    get paused() { return this.#paused; }

    pause() {
        this.#paused = true;
    }

    resume() {
        this.#paused = false;
    }

    sendKeyDown(key) {
        this.#pressed[key] = true;
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

        this.player.position.x += dx * this.player.speed * delta;
        this.player.position.y += dy * this.player.speed * delta;
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
