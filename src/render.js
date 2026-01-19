import { DDGCanvasContext } from "./canvas.js";

export class DDGRenderer {
    #renderStartTimestamp;

    constructor(canvasOrCtx, logic) {
        this.canvas = canvasOrCtx?.canvas ?? canvasOrCtx;
        this.ctx = canvasOrCtx.canvas ? canvasOrCtx : this.canvas.getContext("2d");
        this.dcc = new DDGCanvasContext(this.ctx);
        this.logic = logic;

        this.canvas.width = this.canvas.height = 1024;
    }

    get width() { return this.canvas.width; }
    get height() { return this.canvas.height; }

    #clearFrame() {
        this.dcc.fillCanvas("white");
    }

    #toScreenCoordinates(obj) {
        const { x, y } = obj;
        return {
            ...obj,
            x: x / this.logic.width * this.width,
            y: this.height - y / this.logic.height * this.height,
        };
    }

    #renderField() {
        for(let obstacle of this.logic.obstacles) {
            this.dcc.centeredRect({
                ...this.#toScreenCoordinates(obstacle),
                fill: "blue",
            });
        }
        for(let hazard of this.logic.hazards) {
            this.dcc.centeredRect({
                ...this.#toScreenCoordinates(hazard),
                fill: "orange",
            });
        }
    }

    #renderPlayer() {
        let { player } = this.logic;
        this.dcc.centeredRect({
            ...this.#toScreenCoordinates(player.getPosition()),
            width: player.size,
            height: player.size,
            fill: "red",
            stroke: "black",
            strokeWidth: 8,
        });
    }

    #renderFrame() {
        this.#clearFrame();

        this.#renderField();
        this.#renderPlayer();
    }

    #renderPauseFrame() {
        this.dcc.fillCanvas("rgba(0, 0, 0, 0.5)");
        this.ctx.fillStyle = "black";
        this.ctx.font = "100px Geo";
        this.ctx.fillText("Paused", 512, 512);
    }

    #renderCursor() {
        let { x, y } = this.logic.cursorPosition;
        if(x === undefined || y === undefined) {
            return;
        }
        this.dcc.centeredRect({
            x, y,
            width: 30, height: 30,
            fill: "pink",
        });
    }

    #renderLoopFrame(timestamp) {
        if(this.#renderStartTimestamp === undefined) {
            this.#renderStartTimestamp = timestamp;
        }

        const millisecondsElapsed = timestamp - this.#renderStartTimestamp;
        
        this.logic.step(millisecondsElapsed);

        this.#renderFrame(millisecondsElapsed);

        if(this.logic.paused) {
            this.#renderPauseFrame();
        }

        this.#renderCursor();

        window.requestAnimationFrame(this.#renderLoopFrame.bind(this));
    }

    startRenderLoop() {
        this.#clearFrame();
        window.requestAnimationFrame(this.#renderLoopFrame.bind(this));
    }
};
