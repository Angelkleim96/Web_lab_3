// Класс платформы
export class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
    }
    
    draw(ctx, camera) {
        const pos = camera.apply(this.x, this.y);
        ctx.fillStyle = "#7c5e3a";
        ctx.fillRect(pos.x, pos.y, this.w, this.h);
        ctx.fillStyle = "#9b7548";
        ctx.fillRect(pos.x, pos.y - 4, this.w, 6);
        ctx.fillStyle = "#5a3e22";
        ctx.fillRect(pos.x, pos.y + 2, this.w, 3);
    }
}