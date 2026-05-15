export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function rectCollide(r1, r2) {
    return !(r2.x > r1.x + r1.w ||
        r2.x + r2.w < r1.x ||
        r2.y > r1.y + r1.h ||
        r2.y + r2.h < r1.y);
}