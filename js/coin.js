// Класс монеты
export class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 12;
        this.h = 12;
        this.collected = false;
    }
    
    collect() {
        this.collected = true;
        return 1;
    }
    
    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
    
    draw(ctx, camera) {
        if (this.collected) return;
        const pos = camera.apply(this.x, this.y);
        
        ctx.fillStyle = "#f5bc42";
        ctx.beginPath();
        ctx.ellipse(pos.x + 6, pos.y + 6, 7, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#d48d1a";
        ctx.fillRect(pos.x + 4, pos.y + 2, 4, 8);
        ctx.fillStyle = "#ffec80";
        ctx.fillRect(pos.x + 5, pos.y + 3, 2, 6);
    }
}

// Фабрика монет - исправлено: монеты всегда спавнятся выше платформ
export class CoinFactory {
    static generateOnPlatforms(platforms, maxCoins) {
        const coins = [];
        const shuffled = [...platforms];
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        let generated = 0;
        for (let plat of shuffled) {
            if (generated >= maxCoins) break;
            if (Math.random() < 0.25) {
                // Монета спавнится по центру платформы, но ВЫШЕ неё
                const coinX = plat.x + (plat.w / 2) - 6;
                // Поднимаем монету на 12 пикселей выше платформы (вместо 38, чтобы монета была над платформой)
                const coinY = plat.y - 12;
                coins.push(new Coin(coinX, coinY));
                generated++;
            }
        }
        
        return coins;
    }
}