import { DDGRectangle } from "./primitives.js";

export class DDGCanvasContext {
    constructor(ctx) {
        this.ctx = ctx;
    }

    get width() { return this.ctx.canvas.width; }
    get height() { return this.ctx.canvas.height; }

    applyStyle({ stroke, strokeWidth = 1, fill }) {
        if(stroke) {
            this.ctx.strokeStyle = stroke;
        }
        this.ctx.lineWidth = strokeWidth;
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

    text({ x, y, text, font, textAlign = "center", verticalAlign = "center", stroke, strokeWidth, fill, box }) {
        this.ctx.font = font;
        this.ctx.textAlign = textAlign;
        let {
            actualBoundingBoxLeft, actualBoundingBoxRight,
            actualBoundingBoxAscent, actualBoundingBoxDescent,
        } = this.ctx.measureText(text);
        let textWidth = actualBoundingBoxLeft + actualBoundingBoxRight;
        let textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;
        if(box) {
            let { padding = 16 } = box ?? {};
            let width = textWidth + padding * 2;
            let height = textHeight + padding * 2;
            this.centeredRect({
                ...box, x, y, width, height,
            });
        }
        this.applyStyle({ stroke, strokeWidth, fill });
        if(verticalAlign === "center") {
            y += textHeight / 2;
        }
        else if(verticalAlign === "top") {
            y += textHeight;
        }
        else if(verticalAlign === "bottom") {
            // default
        }
        else {
            throw new Error(`Unknown verticalAlign value ${verticalAlign}`);
        }

        if(fill) {
            this.ctx.fillText(text, x, y);
        }
        if(stroke) {
            this.ctx.strokeText(text, x, y);
        }
    }
}
