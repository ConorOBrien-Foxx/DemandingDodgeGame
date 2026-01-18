export class DDGRenderer {
    #renderStartTimestamp;

    constructor(canvasOrCtx, logic) {
        this.canvas = canvasOrCtx?.canvas ?? canvasOrCtx;
        this.ctx = canvasOrCtx.canvas ? canvasOrCtx : this.canvas.getContext("2d");
        this.logic = logic;

        this.canvas.width = this.canvas.height = 1024;
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

    #tempLineDisplay(millisecondsElapsed) {
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
    }

    #renderPlayer() {
        let { size, position } = this.logic.player;
        this.ctx.fillStyle = "red";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 8;
        // TODO: helper functions
        this.ctx.fillRect(position.x - size / 2, position.y - size / 2, size, size);
        this.ctx.strokeRect(position.x - size / 2, position.y - size / 2, size, size);
    }

    #renderFrame(millisecondsElapsed) {
        this.#clearFrame();

        this.#renderPlayer();
    }

    #renderPauseFrame() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = "black";
        this.ctx.font = "100px Geo";
        this.ctx.fillText("Paused", 512, 512);
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

        window.requestAnimationFrame(this.#renderLoopFrame.bind(this));
    }

    startRenderLoop() {
        this.#clearFrame();
        window.requestAnimationFrame(this.#renderLoopFrame.bind(this));
    }
};
