export class Portal {
    constructor(x, y, width = 80, height = 120) {
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
        this.active = true;
        this.animTime = 0;
    }
    
    update(deltaTime) {
        this.animTime += deltaTime;
    }
    
    draw(ctx, camera) {
        if (!this.active) return;
        const pos = camera.apply(this.x, this.y);
        
        // Эффект парящей платформы под порталом (опционально)
        ctx.fillStyle = "rgba(100, 50, 150, 0.5)";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#cc44ff";
        
        // Основное тело портала
        ctx.fillStyle = "#9b30ff";
        ctx.fillRect(pos.x, pos.y, this.w, this.h);
        
        // Внутреннее свечение
        ctx.fillStyle = "#ddaaff";
        ctx.fillRect(pos.x + 5, pos.y + 10, 70, 100);
        
        // Анимированные частицы внутри портала
        ctx.fillStyle = "#ff66cc";
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(pos.x + 40 + Math.sin(this.animTime * 6 + i) * 15, 
                    pos.y + 60 + Math.cos(this.animTime * 5 + i) * 20, 
                    6, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Свечение вокруг портала
        ctx.fillStyle = "rgba(255, 100, 200, 0.3)";
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.arc(pos.x + 40 + Math.sin(this.animTime * 4 + i) * 25, 
                    pos.y + 60 + Math.cos(this.animTime * 3 + i) * 30, 
                    3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.shadowBlur = 0;
    }
}