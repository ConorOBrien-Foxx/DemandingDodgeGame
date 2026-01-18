export class DDGRenderer {
    #renderStartTimestamp;
    #paused = false;

    constructor(canvasOrCtx) {
        this.canvas = canvasOrCtx.canvas ?? canvasOrCtx;
        this.ctx = canvasOrCtx.canvas ? canvasOrCtx : this.canvas.getContext("2d");
    }

    get width() { return this.canvas.width; }
    get height() { return this.canvas.height; }

    #clearFrame() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // temp illustration
    #renderLine() {
        this.ctx.lineWidth = 10;
        this.ctx.strokeStyle = "blue";
        const x1 = Math.random() * this.width;
        const y1 = Math.random() * this.height;
        const x2 = Math.random() * this.width;
        const y2 = Math.random() * this.height;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    #renderFrame() {
        // TODO
    }

    #renderLoopFrame(timestamp) {
        if(this.#paused) {
            // temp illustration
            this.lineCount = 0;
            return;
        }
        if(this.#renderStartTimestamp === undefined) {
            this.#renderStartTimestamp = timestamp;
        }
        const millisecondsElapsed = timestamp - this.#renderStartTimestamp;
        // console.log(timestamp, this.#renderStartTimestamp);

        // temp illustration
        this.lineCount ??= 0;
        this.lineFrequency ??= 300; //ms
        let dbg = 0;
        while(this.lineCount * this.lineFrequency < millisecondsElapsed) {
            this.#renderLine();
            this.lineCount++;
            if(++dbg > 5) {
                break;
            }
        }

        this.#renderFrame();

        window.requestAnimationFrame(this.#renderLoopFrame.bind(this));
    }

    #renderPauseFrame() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = "black";
        this.ctx.font = "100px Geo";
        this.ctx.fillText("Paused", 512, 512);
    }

    pause() {
        if(this.#paused) {
            return;
        }
        this.#renderStartTimestamp = undefined;
        this.#renderPauseFrame();
        this.#paused = true;
    }

    resume() {
        if(!this.#paused) {
            return;
        }

        this.#paused = false;

        this.renderLoop();
    }

    renderLoop() {
        this.#clearFrame();
        window.requestAnimationFrame(this.#renderLoopFrame.bind(this));
    }
};
