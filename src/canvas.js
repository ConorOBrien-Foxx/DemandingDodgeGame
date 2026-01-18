export class DDGCanvasContext {
    constructor(ctx) {
        this.ctx = ctx;
    }

    get width() { return this.ctx.canvas.width; }
    get height() { return this.ctx.canvas.height; }

    applyStyle({ stroke, strokeWidth, fill }) {
        if(stroke) {
            this.ctx.strokeStyle = stroke;
        }
        this.ctx.lineWidth = strokeWidth ?? 1;
        if(fill) {
            this.ctx.fillStyle = fill;
        }
        // TODO: composite operations
        // TODO: defaults for when e.g. composite operations are unspecified
    }

    fillCanvas(fill) {
        this.rect({ x: 0, y: 0, width: this.width, height: this.height, fill });
    }

    rect({ x, y, width, height, stroke, strokeWidth, fill }) {
        this.applyStyle({ stroke, strokeWidth, fill });
        if(fill) {
            this.ctx.fillRect(x, y, width, height);
        }
        if(stroke) {
            this.ctx.strokeRect(x, y, width, height);
        }
    }

    centeredRect({ x, y, width, height, stroke, strokeWidth, fill }) {
        this.rect({
            x: x - width / 2,
            y: y - height / 2,
            width,
            height,
            stroke,
            strokeWidth,
            fill
        });
    }
}
