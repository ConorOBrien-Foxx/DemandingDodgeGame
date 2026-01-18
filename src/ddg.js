import * as dom from "./dom.js";
import { DDGRenderer } from "./render.js";

window.addEventListener("load", () => {
    const game = dom.find("#game");
    const gameContainer = game.parentElement;
    let { width, height } = gameContainer.getBoundingClientRect();
    game.width = game.height = 1024;
    // TODO: recalculate view
    const squareWidth = Math.min(width, height);
    console.log({squareWidth});
    game.style.width = game.style.height = `${squareWidth}px`;
    const renderer = new DDGRenderer(game);
    renderer.renderLoop();
    window.addEventListener("blur", () => {
        renderer.pause();
    });
    window.addEventListener("focus", () => {

        renderer.resume();
    })
});
