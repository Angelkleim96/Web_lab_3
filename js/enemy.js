export class Enemy {
    constructor(x, y, patrolLeft, patrolRight, hp, speed) {
        this.x = x;
        this.y = y;
        this.w = 32;
        this.h = 44;
        this.hp = hp;
        this.maxHp = hp;
        this.baseSpeed = speed;
        this.speed = speed;
        this.patrolLeft = patrolLeft;
        this.patrolRight = patrolRight;
        this.direction = 1;
        this.active = true;
        this.knockbackTimer = 0;
        this.knockbackSpeed = 0;
        this.stopped = false;
        this.stopTimer = 0;
        
        // Стабилизация гравитации
        this.onGround = true;
        this.groundY = null;
        
        this.colorVariant = Math.floor(Math.random() * 3);
    }
    
    update(deltaTime, platforms) {
        if (!this.active) return;
        
        // Отбрасывание при ударе
        if (this.knockbackTimer > 0) {
            this.knockbackTimer -= deltaTime;
            this.x += this.knockbackSpeed * deltaTime * 60;
            if (this.knockbackTimer <= 0) {
                this.speed = this.baseSpeed;
                this.stopped = false;
            }
            this.applyStableGravity(platforms);
            return;
        }
        
        // Остановка у границы
        if (this.stopped) {
            this.stopTimer -= deltaTime;
            if (this.stopTimer <= 0) {
                this.stopped = false;
                this.direction = -this.direction;
            }
            this.applyStableGravity(platforms);
            return;
        }
        
        // Плавное движение
        let moveDistance = this.speed * this.direction * deltaTime * 60;
        let targetX = this.x + moveDistance;
        
        // Проверка границ
        if (this.direction === 1 && targetX + this.w >= this.patrolRight) {
            targetX = this.patrolRight - this.w;
            this.x = targetX;
            this.stopped = true;
            this.stopTimer = 0.3;
            this.applyStableGravity(platforms);
            return;
        }
        
        if (this.direction === -1 && targetX <= this.patrolLeft) {
            targetX = this.patrolLeft;
            this.x = targetX;
            this.stopped = true;
            this.stopTimer = 0.3;
            this.applyStableGravity(platforms);
            return;
        }
        
        this.x = targetX;
        this.applyStableGravity(platforms);
    }
    
    // Стабильная гравитация без мельтешения
    applyStableGravity(platforms) {
        let foundGround = false;
        let newY = this.y;
        
        // Находим платформу под врагом
        for (let plat of platforms) {
            // Проверка по горизонтали
            if (this.x + this.w > plat.x && this.x < plat.x + plat.w) {
                // Верх платформы
                const platformTop = plat.y;
                
                // Если враг над платформой (или немного ниже)
                if (this.y + this.h <= platformTop + 15 && this.y + this.h >= platformTop - 5) {
                    newY = platformTop - this.h;
                    foundGround = true;
                    break;
                }
            }
        }
        
        // Если нашли платформу - прижимаем к ней
        if (foundGround) {
            this.y = newY;
            this.onGround = true;
        } else {
            // Падение вниз
            this.y += 5.5;
            this.onGround = false;
        }
        
        // Смерть при падении
        if (this.y + this.h > 550) {
            this.active = false;
        }
        
        // Ограничение сверху
        if (this.y < 0) {
            this.y = 0;
        }
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        this.knockbackTimer = 0.35;
        this.knockbackSpeed = this.direction === 1 ? -5 : 5;
        this.speed = 0;
        this.stopped = false;
        
        if (this.hp <= 0) {
            this.active = false;
        }
    }
    
    draw(ctx, camera) {
        if (!this.active) return;
        const pos = camera.apply(this.x, this.y);
        
        let bodyColor, clothColor;
        switch(this.colorVariant) {
            case 0:
                bodyColor = "#4a2a2a";
                clothColor = "#8b3a3a";
                break;
            case 1:
                bodyColor = "#3a2a4a";
                clothColor = "#6a3a8b";
                break;
            default:
                bodyColor = "#2a4a3a";
                clothColor = "#3a6a4a";
        }
        
        // ТЕЛО
        ctx.fillStyle = clothColor;
        ctx.fillRect(pos.x + 6, pos.y + 12, 20, 30);
        
        // ПЛАЩ
        ctx.fillStyle = bodyColor;
        ctx.fillRect(pos.x + 2, pos.y + 16, 28, 26);
        
        // ПОЯС
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(pos.x + 4, pos.y + 30, 24, 5);
        
        // Пряжка
        ctx.fillStyle = "#d4af37";
        ctx.fillRect(pos.x + 13, pos.y + 29, 6, 7);
        
        // НОГИ (статичные)
        ctx.fillStyle = "#3a2a1a";
        ctx.fillRect(pos.x + 6, pos.y + 38, 7, 10);
        ctx.fillRect(pos.x + 19, pos.y + 38, 7, 10);
        
        // Обувь
        ctx.fillStyle = "#5a3a1a";
        ctx.fillRect(pos.x + 4, pos.y + 45, 10, 5);
        ctx.fillRect(pos.x + 18, pos.y + 45, 10, 5);
        
        // РУКИ
        ctx.fillStyle = clothColor;
        ctx.fillRect(pos.x, pos.y + 16, 6, 12);
        ctx.fillRect(pos.x + 26, pos.y + 16, 6, 12);
        
        // Кисти рук
        ctx.fillStyle = "#c4a882";
        ctx.fillRect(pos.x - 2, pos.y + 24, 8, 5);
        ctx.fillRect(pos.x + 26, pos.y + 24, 8, 5);
        
        // ГОЛОВА
        ctx.fillStyle = "#c4a882";
        ctx.fillRect(pos.x + 8, pos.y + 2, 16, 16);
        
        // КАПЮШОН
        ctx.fillStyle = bodyColor;
        ctx.fillRect(pos.x + 6, pos.y, 20, 10);
        ctx.fillRect(pos.x + 4, pos.y + 4, 6, 8);
        ctx.fillRect(pos.x + 22, pos.y + 4, 6, 8);
        
        // ГЛАЗА
        ctx.fillStyle = "#ff3333";
        ctx.fillRect(pos.x + 11, pos.y + 8, 4, 3);
        ctx.fillRect(pos.x + 17, pos.y + 8, 4, 3);
        
        // Зрачки
        ctx.fillStyle = "#000000";
        if (this.direction === 1) {
            ctx.fillRect(pos.x + 13, pos.y + 9, 1, 2);
            ctx.fillRect(pos.x + 19, pos.y + 9, 1, 2);
        } else {
            ctx.fillRect(pos.x + 11, pos.y + 9, 1, 2);
            ctx.fillRect(pos.x + 17, pos.y + 9, 1, 2);
        }
        
        // БРОВИ
        ctx.fillStyle = "#2a1a0a";
        ctx.fillRect(pos.x + 9, pos.y + 6, 6, 2);
        ctx.fillRect(pos.x + 17, pos.y + 6, 6, 2);
        
        // РОТ
        ctx.fillStyle = "#8b0000";
        ctx.fillRect(pos.x + 12, pos.y + 14, 8, 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(pos.x + 13, pos.y + 13, 2, 2);
        ctx.fillRect(pos.x + 17, pos.y + 13, 2, 2);
        
        // ШРАМ
        ctx.fillStyle = "#6a2a2a";
        ctx.fillRect(pos.x + 20, pos.y + 5, 4, 2);
        
        // ОРУЖИЕ
        if (this.direction === 1) {
            ctx.fillStyle = "#888888";
            ctx.fillRect(pos.x + 28, pos.y + 20, 12, 4);
            ctx.fillStyle = "#aaaaaa";
            ctx.fillRect(pos.x + 36, pos.y + 18, 4, 8);
            ctx.fillStyle = "#8b5a2b";
            ctx.fillRect(pos.x + 26, pos.y + 21, 4, 3);
        } else {
            ctx.fillStyle = "#888888";
            ctx.fillRect(pos.x - 8, pos.y + 20, 12, 4);
            ctx.fillStyle = "#aaaaaa";
            ctx.fillRect(pos.x - 8, pos.y + 18, 4, 8);
            ctx.fillStyle = "#8b5a2b";
            ctx.fillRect(pos.x - 8, pos.y + 21, 4, 3);
        }
        
        // ПОЛОСКА ЗДОРОВЬЯ
        const hpPercent = this.hp / this.maxHp;
        ctx.fillStyle = "#6d2e2e";
        ctx.fillRect(pos.x + 4, pos.y - 8, 24, 5);
        ctx.fillStyle = "#d93f21";
        ctx.fillRect(pos.x + 4, pos.y - 8, 24 * hpPercent, 5);
        
        // ЭФФЕКТ ГНЕВА
        if (this.hp < this.maxHp * 0.3) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            ctx.fillRect(pos.x + 8, pos.y + 2, 16, 16);
        }
        
        // ЭФФЕКТ ОСТАНОВКИ
        if (this.stopped) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.font = "bold 14px monospace";
            ctx.fillText("?", pos.x + 12, pos.y - 10);
        }
    }
}