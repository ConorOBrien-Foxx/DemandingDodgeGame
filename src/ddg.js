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

    // inline JavaScript code in index.html is responsible for removing the Ko-fi button if it's been 6 months (16070400000 milliseconds)
    dom.find(".hideme")?.addEventListener("click", () => {
        localStorage.hideConorKofi = +new Date();
        dom.find(".ko-fi").remove();
    });
});
