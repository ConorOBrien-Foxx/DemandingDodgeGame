import * as dom from "./dom.js";
import { DDGRenderer } from "./render.js";
import { DDGLogic } from "./logic.js";
import { DDGController } from "./controller.js";
import { DDGGameRunner } from "./runner.js";

window.addEventListener("load", () => {
    const game = dom.find("#game");
    let runner = new DDGGameRunner(game);
    runner.initialize();
    runner.start();
});
