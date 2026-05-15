// Класс шипа
export class Spike {
    constructor(x, y, width, height, damage = 10) {
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
        this.damage = damage;
        this.active = true;
    }
    
    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
    
    draw(ctx, camera) {
        const pos = camera.apply(this.x, this.y);
        
        ctx.fillStyle = "#6a4c2c";
        ctx.fillRect(pos.x, pos.y, this.w, this.h);
        
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = "#cc5533";
            ctx.beginPath();
            ctx.moveTo(pos.x + 5 + i * 8, pos.y - 5);
            ctx.lineTo(pos.x + 2 + i * 8, pos.y);
            ctx.lineTo(pos.x + 8 + i * 8, pos.y);
            ctx.fill();
        }
    }
}