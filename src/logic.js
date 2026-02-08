import { euclideanDistance, euclideanDistancePoints, lerp2d, bezier } from "./core.js";
import { DDGPlayer, DDGRectangle } from "./primitives.js";

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
// priorities: higher is more important
export const DDGPauseSource = {
    WindowFocus: 1,
    User: 2,
    Force: 4096,
};

class DDGHazard {
    // path is a list of waypoints { x, y, duration (milliseconds) }
    // supports duration=0 for teleportation between waypoints
    constructor({ hitbox, path, easing }) {
        this.hitbox = hitbox;
        this.path = path;
        this.easing = easing || null;
        this.totalDuration = this.path.reduce((acc, waypoint) => acc + waypoint.duration, 0);
        /*
        let pathLength = 0;
        this.path.forEach((p, idx) => {
            // circular, so wrap around with idx == 0 going to -1
            let prev = this.path.at(idx - 1);
            pathLength += euclideanDistancePoints(p, prev);
        });
        console.log(pathLength);
        this.cycleTime = pathLength / this.speed;
        */
    }

    inferPosition(levelTimer) {
        let timerOffset = levelTimer % this.totalDuration;
        let sourceIdx = this.path.findIndex(waypoint => (timerOffset -= waypoint.duration) < 0);
        let targetIdx = (sourceIdx + 1) % this.path.length;

        let source = this.path[sourceIdx];
        let target = this.path[targetIdx];
        let { duration } = source;
        
        // timerOffset is now negative, fix the offset
        timerOffset += duration;
        let lerpAmount = timerOffset / duration;

        if(this.easing) {
            lerpAmount = this.easing(lerpAmount);
        }

        let interpolated = lerp2d(source, target, lerpAmount);

        this.hitbox.x = interpolated.x;
        this.hitbox.y = interpolated.y;
    }

    // TODO: helper constructor that is given a hitbox, path without durations, and speed, and calculates durations 
}

class DDGLevel {
    startPoint = { x: undefined, y: undefined };
    obstacles = [];
    hazards = [];

    // TODO: level might (will) have multiple start points, and might (will) depend on where the player enters the level
    setStartPoint(startPoint) {
        this.startPoint = startPoint;
        return this;
    }

    addObstacle(rect) {
        this.obstacles.push(rect);
        return this;
    }

    addHazard(hazard) {
        this.hazards.push(hazard);
        return this;
    }
}

export class DDGLogic {
    #pressed = {
        [DDGKeys.Up]: false,
        [DDGKeys.Down]: false,
        [DDGKeys.Left]: false,
        [DDGKeys.Right]: false,
    };
    #pausePriorityLevel = 0;
    #lastMillisecondsElapsed;
    #deltaRemaining = 0.0;
    #MIN_SIMULATION_STEP = 10; // milliseconds
    #cursor = { x: undefined, y: undefined };
    #levelTimer = 0.0;

    width = 1024;
    height = 1024;

    // TODO: load from json
    level = new DDGLevel()
        .setStartPoint({ x: 200, y: 200 })
        .addObstacle(DDGRectangle.bottomLeftToTopRight(0, 0, this.width, 50))
        .addObstacle(DDGRectangle.bottomLeftToTopRight(0, 0, 50, this.height))
        .addObstacle(DDGRectangle.bottomLeftToTopRight(0, this.height - 50, this.width, this.height))
        .addObstacle(DDGRectangle.bottomLeftToTopRight(this.width - 50, 0, this.width, this.height))
        .addHazard(new DDGHazard({
            hitbox: new DDGRectangle(512, 512, 50, 50),
            path: [
                { x: 500, y: 200, duration: 2000 },
                { x: 412, y: 100, duration: 1000 },
                { x: 712, y: 634, duration: 500 },
                { x: 100, y: 412, duration: 250 },
            ],
            easing: bezier(0.6, 0, 0.4, 1),
        }))
        ;
    player = new DDGPlayer(undefined, undefined, 32, 320 / 1000); // division resolves to pixels moved per millisecond
    obstacles = [];
    hazards = [];

    constructor() {
        this.loadLevel();
    }

    loadLevel() {
        this.obstacles = this.level.obstacles;
        this.hazards = this.level.hazards;
        this.resetLevel();
    }

    resetLevel() {
        this.#levelTimer = 0.0;
        this.player.x = this.level.startPoint.x;
        this.player.y = this.level.startPoint.y;
        this.hazards.forEach(hazard => {
            // we're okay mutating hitbox x/y since that isn't crucial to instantiating the level
            hazard.hitbox.x = hazard.path[0].x;
            hazard.hitbox.y = hazard.path[0].y;
        });
    }

    debugText() {
        return `${this.#levelTimer}ms`;
    }

    get paused() { return this.#pausePriorityLevel !== 0; }

    pause(priorityLevel = DDGPauseSource.User) {
        if(priorityLevel <= this.#pausePriorityLevel) {
            return;
        }
        this.#pausePriorityLevel = priorityLevel;
        for(let key of DirectionKeys) {
            this.sendKeyUp(key);
        }
    }

    resume(resumeSource = DDGPauseSource.User) {
        // console.log(this.#pausePriorityLevel, resumeSource);
        if(resumeSource < this.#pausePriorityLevel) {
            // e.g. do not unpause the user when focusing back
            return;
        }
        this.#pausePriorityLevel = 0;
    }

    togglePause(pauseSource) {
        if(this.#pausePriorityLevel) {
            this.resume(pauseSource);
        }
        else {
            this.pause(pauseSource);
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
            if(this.player.intersectsRectangle(hazard.hitbox)) {
                this.resetLevel();
                break;
            }
        }
    }

    #stepHazards(delta) {
        for(let hazard of this.hazards) {
            hazard.inferPosition(this.#levelTimer);
        }
    }

    #discreteStep(delta) {
        // delta guaranteed to be equal to this.#MIN_SIMULATION_STEP
        if(this.paused) {
            // TODO: optimize by not calling discreteStep?
            return;
        }

        /*
        this._tempHazardTimer ??= 0;
        this._tempHazardTimer += delta;
        if(this._tempHazardTimer >= 500) {
            this._tempHazardTimer = 0;
            this.hazards[0].x = Math.random() * 1024 | 0;
            this.hazards[0].y = Math.random() * 1024 | 0;
        }*/
        this.#stepHazards(delta);
        this.#stepPlayer(delta);

        this.#levelTimer += delta;
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
