import { DDGRenderer } from "./render.js";
import { DDGLogic } from "./logic.js";
import { DDGController } from "./controller.js";

export class DDGGameRunner {
    constructor(game) {
        this.game = game;
        this.logic = new DDGLogic();
        this.renderer = new DDGRenderer(this.game, this.logic);
        this.controller = new DDGController(this.renderer, this.logic);
    }

    initialize() {
        this.controller.initialize();
    }

    start() {
        this.controller.start();
        this.renderer.startRenderLoop();
    }
};
