import { DDGKeys } from "./logic.js";

export class DDGController {
    constructor(renderer, logic) {
        this.renderer = renderer;
        this.logic = logic
    }

    #recalculateGameDisplayBounds() {
        let { width, height } = game.parentElement.getBoundingClientRect();
        const squareWidth = Math.min(width, height);
        game.style.width = game.style.height = `${squareWidth}px`;
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
    };
    start() {
        window.addEventListener("blur", () => {
            this.logic.pause();
        });
        window.addEventListener("focus", () => {
            this.logic.resume();
        });
        window.addEventListener("keydown", (ev) => {
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
    }
};
