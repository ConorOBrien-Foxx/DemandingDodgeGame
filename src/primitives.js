// shapes are stored at their *center*
export class DDGFieldElement {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

export class DDGRectangle extends DDGFieldElement {
    constructor(x, y, width, height) {
        super(x, y);
        this.width = width;
        this.height = height;
    }

    static from({ x, y, width, height }) {
        return new DDGRectangle(x, y, width, height);
    }

    static bottomLeftToTopRight(x1, y1, x2, y2) {
        if(x2 < x1 || y2 < y1) {
            throw new RangeError("Coordinates would draw inverted shape");
        } 
        let width = x2 - x1;
        let height = y2 - y1;
        return new DDGRectangle(x1 + width / 2, y1 + height / 2, width, height);
    }

    static rectangleRectangleIntersection(r1, r2) {
        // TODO: should this be <= and >=?
        return (
            r1.x - r1.width / 2 < r2.x + r2.width / 2 &&
            r1.x + r1.width / 2 > r2.x - r2.width / 2 &&
            r1.y - r1.height / 2 < r2.y + r2.height / 2 &&
            r1.y + r1.height / 2 > r2.y - r2.height / 2
        );
    }

    static rectangleHasPoint(rect, p) {
        // TODO: should this be <= and >=?
        return (
            rect.x - rect.width / 2 < p.x &&
            rect.x + rect.width / 2 > p.x &&
            rect.y - rect.height / 2 < p.y &&
            rect.y + rect.height / 2 > p.y
        );
    }

    intersectsRectangle(rect) {
        return DDGRectangle.rectangleRectangleIntersection(this, rect);
    }

    hasPoint(p) {
        return DDGRectangle.rectangleHasPoint(this, p);
    }
}

export class DDGPlayer extends DDGRectangle {
    constructor(x, y, width, speed) {
        super(x, y, width, width);
        this.speed = speed; // pixels moved per second
    }

    get size() {
        return this.width;
    }

    getPosition() {
        return { x: this.x, y: this. y };
    }
}
