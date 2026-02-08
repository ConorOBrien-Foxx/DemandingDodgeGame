// misc library functions
export const euclideanDistance = (x1, y1, x2, y2) =>
    Math.hypot(x2 - x1, y2 - y1);

export const euclideanDistancePoints = (p1, p2) =>
    Math.hypot(p2.x - p1.x, p2.y - p1.y);

export const lerp = (n1, n2, ratio) => (n2 - n1) * ratio + n1;

export const lerp2d = (p1, p2, ratio) => ({
    x: lerp(p1.x, p2.x, ratio),
    y: lerp(p1.y, p2.y, ratio),
});
