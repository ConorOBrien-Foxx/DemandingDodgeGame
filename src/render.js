import { DDGCanvasContext } from "./canvas.js";

export const DDGButtonActions = {
    Reset: Symbol("DDGButtonActions.Reset"),
};

export class DDGRenderer {
    #renderStartTimestamp;
    #pauseMenuTextElements = [
        {
            text: "Paused",
            x: 512,
            y: 128,
            font: "100px Geo",
            fill: "black",
        },
        {
            text: "Reset",
            x: 512,
            y: 256,
            font: "80px Geo",
            fill: "black",
            action: DDGButtonActions.Reset,
        },
    ];
    textElements = [];
    #clickRegions = [];
    #isRenderingPauseFrame = false;
    #textIsHovered = [];

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
            // console.log(hazard);

            // debug path
            hazard.path.forEach(({ x, y }, idx) => {
                let screenXY = this.#toScreenCoordinates({ x, y });
                this.dcc.centeredRect({
                    ...screenXY,
                    width: 20, height: 20, fill: "red"
                });
                this.dcc.text({
                    ...screenXY,
                    font: "20px Arial",
                    fill: "white",
                    text: idx,
                });
            });

            this.dcc.centeredRect({
                ...this.#toScreenCoordinates(hazard.hitbox),
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

    #renderDebug() {
        this.dcc.text({
            x: 15, y: 15,
            font: "32px Arial",
            fill: "black",
            textAlign: "left",
            verticalAlign: "top",
            text: this.logic.debugText(),
        })
    }

    #renderFrame() {
        this.#clearFrame();

        this.#renderField();
        this.#renderPlayer();
        this.#renderDebug();
    }

    // TODO: extract click handling logic out of the renderer
    // TODO: make clickable regions look visibly different from other text elements
    #renderPauseFrame() {
        if(this.logic.paused) {
            let anyTargeted = false;
            if(!this.#isRenderingPauseFrame) {
                this.textElements = this.#pauseMenuTextElements;
                this.#clickRegions = [];
            }
            this.dcc.fillCanvas("rgba(0, 0, 0, 0.3)");
            let calculateClickRegion = !this.#isRenderingPauseFrame;
            // TODO: break `.text` into a separate `calculateText` function?
            this.textElements.forEach((text, idx) => {
                let isClickable = !!text.action;
                let precalculatedClickRegion = this.#clickRegions[idx];
                let targeted = isClickable &&
                    precalculatedClickRegion &&
                    precalculatedClickRegion.hasPoint(this.logic.cursorPosition);
                this.#textIsHovered[idx] = targeted;
                let fill = targeted ? "blue" : "white";

                let clickRegion = this.dcc.text({
                    ...text,
                    verticalAlign: "center",
                    box: { fill },
                    calculateClickRegion: isClickable && calculateClickRegion,
                });

                if(calculateClickRegion) {
                    this.#clickRegions[idx] = clickRegion;
                }

                anyTargeted ||= targeted;
            });

            this.canvas.style.cursor = anyTargeted ? "pointer" : "";
        }
        else if(this.#isRenderingPauseFrame) {
            this.textElements = [];
            this.#textIsHovered = [];
            this.canvas.style.cursor = "";
        }
        this.#isRenderingPauseFrame = this.logic.paused;
    }

    getTopHover() {
        return this.textElements.find((_, idx) => this.#textIsHovered[idx]);
    }

    #renderCursor() {
        return; // usually just for debugging
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
        this.#renderPauseFrame();
        this.#renderCursor();

        window.requestAnimationFrame(this.#renderLoopFrame.bind(this));
    }

    startRenderLoop() {
        this.#clearFrame();
        window.requestAnimationFrame(this.#renderLoopFrame.bind(this));
    }
};
