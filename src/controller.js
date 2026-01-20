import { DDGKeys, DDGPauseSource } from "./logic.js";
import * as dom from "./dom.js";
import { DDGButtonActions } from "./render.js";

export class DDGController {
    #disableRepeatKeys = true;
    #canvasWidth;
    get #canvasHeight() { return this.#canvasWidth; }

    constructor(game, renderer, logic) {
        this.game = game;
        this.renderer = renderer;
        this.logic = logic;
    }

    #recalculateGameDisplayBounds() {
        let { width, height } = dom.bounds(game.parentElement);
        this.#canvasWidth = Math.min(width, height);
        game.style.width = game.style.height = `${this.#canvasWidth}px`;
    }


    initialize() {
        window.addEventListener("resize", () => {
            this.#recalculateGameDisplayBounds();
        });
        this.#recalculateGameDisplayBounds();
    }

    // TODO: user-configurable controls
    #keyMap = {
        "w": DDGKeys.Up,
        "s": DDGKeys.Down,
        "a": DDGKeys.Left,
        "d": DDGKeys.Right,
        "ArrowUp": DDGKeys.Up,
        "ArrowDown": DDGKeys.Down,
        "ArrowLeft": DDGKeys.Left,
        "ArrowRight": DDGKeys.Right,
        "p": DDGKeys.Pause,
        "Escape": DDGKeys.Pause,
    };
    start() {
        window.addEventListener("blur", () => {
            this.logic.pause(DDGPauseSource.WindowFocus);
            this.logic.liftCursor();
        });
        window.addEventListener("focus", () => {
            this.logic.resume(DDGPauseSource.WindowFocus);
        });
        window.addEventListener("keydown", (ev) => {
            if(ev.repeat && this.#disableRepeatKeys) {
                return;
            }
            let instructionKey = this.#keyMap[ev.key];
            if(instructionKey) {
                this.logic.sendKeyDown(instructionKey);
            }
        });
        window.addEventListener("keyup", (ev) => {
            let instructionKey = this.#keyMap[ev.key];
            if(instructionKey) {
                this.logic.sendKeyUp(instructionKey);
            }
        });
        this.game.addEventListener("mousemove", (ev) => {
            let box = dom.bounds(this.game);
            let scaleX = this.#canvasWidth / this.logic.width;
            let scaleY = this.#canvasWidth / this.logic.height;
            this.logic.sendCursorPosition({
                x: (ev.clientX - box.left) / scaleX,
                y: (ev.clientY - box.top) / scaleY,
            });
            // let { clientX, clientY } = ev;
            // console.log(ev);
            // this.logic.sendCursorPosition({ x: clientX, y: clientY });
        });
        this.game.addEventListener("click", (ev) => {
            // TODO: extract click handling logic out of the renderer
            let hover = this.renderer.getTopHover();
            if(!hover) {
                return;
            }

            if(hover.action === DDGButtonActions.Reset) {
                this.logic.resetLevel();
                this.logic.resume(DDGPauseSource.Force);
            }
        });
        this.game.addEventListener("mouseout", () => {
            this.logic.liftCursor();
        });
    }
};
