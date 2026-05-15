// js/player.js - полный код класса Player

import { clamp } from './utils.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 32;
        this.h = 48;
        this.vx = 0;
        this.vy = 0;
        this.grounded = false;
        this.facingRight = true;
        this.hp = 100;
        this.maxHp = 100;
        this.invincibleTimer = 0;
        this.attackCooldown = 0;
        this.speed = 300;
        this.jumpPower = -470;
        this.gravity = 1100;
        this.worldWidth = 2800;
        this.worldHeight = 550;
        
        // Анимация ходьбы
        this.walkCycle = 0;
        this.walkSpeed = 12;
        this.isWalking = false;
        this.legOffset = 0;
        this.armOffset = 0;
    }
    
    update(deltaTime, platforms, input) {
        // Обновление таймеров
        if (this.invincibleTimer > 0) this.invincibleTimer -= deltaTime;
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        
        // Движение
        this.vx = 0;
        this.isWalking = false;
        
        if (input.isLeftPressed()) {
            this.vx = -this.speed;
            this.facingRight = false;
            this.isWalking = true;
        }
        if (input.isRightPressed()) {
            this.vx = this.speed;
            this.facingRight = true;
            this.isWalking = true;
        }
        
        // Анимация ходьбы
        if (this.isWalking && this.grounded) {
            this.walkCycle += this.walkSpeed * deltaTime;
            if (this.walkCycle > 1) this.walkCycle -= 1;
            
            const angle = this.walkCycle * Math.PI * 2;
            this.legOffset = Math.sin(angle) * 6;
            this.armOffset = Math.sin(angle) * 5;
        } else {
            this.legOffset *= 0.85;
            this.armOffset *= 0.85;
            if (Math.abs(this.legOffset) < 0.5) this.legOffset = 0;
            if (Math.abs(this.armOffset) < 0.5) this.armOffset = 0;
        }
        
        // Прыжок
        if (input.isJumpPressed() && this.grounded) {
            this.vy = this.jumpPower;
            this.grounded = false;
        }
        
        // Применение физики
        this.vy += this.gravity * deltaTime;
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Коллизии с платформами
        this.grounded = false;
        for (let plat of platforms) {
            if (this.x < plat.x + plat.w && this.x + this.w > plat.x &&
                this.y + this.h > plat.y && this.y < plat.y + plat.h) {
                
                if (this.vy >= 0 && (this.y + this.h - plat.y) <= 30) {
                    this.y = plat.y - this.h;
                    this.vy = 0;
                    this.grounded = true;
                } else if (this.vy < 0) {
                    this.y = plat.y + plat.h;
                    this.vy = 0;
                }
            }
        }
        
        // Границы мира
        this.x = clamp(this.x, 0, this.worldWidth - this.w);
        
        if (this.y + this.h > this.worldHeight) {
            this.hp = 0;
        }
        if (this.y < 0) {
            this.y = 0;
            this.vy = 0;
        }
    }
    
    takeDamage(amount) {
        if (this.invincibleTimer > 0) return;
        this.hp = Math.max(0, this.hp - amount);
        this.invincibleTimer = 0.8;
        this.vx = this.facingRight ? -3.5 : 3.5;
        this.vy = -6;
    }
    
    canAttack() {
        return this.attackCooldown <= 0;
    }
    
    performAttack() {
        if (!this.canAttack()) return false;
        this.attackCooldown = 0.4;
        return true;
    }
    
    getAttackHitbox() {
        if (this.facingRight) {
            return { x: this.x + this.w + 5, y: this.y + this.h / 2 - 15, w: 55, h: 40 };
        } else {
            return { x: this.x - 55, y: this.y + this.h / 2 - 15, w: 55, h: 40 };
        }
    }
    
    isAlive() {
        return this.hp > 0;
    }
    
    reset(x, y, worldWidth) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.grounded = false;
        this.hp = this.maxHp;
        this.invincibleTimer = 0;
        this.attackCooldown = 0;
        this.facingRight = true;
        this.worldWidth = worldWidth;
        this.walkCycle = 0;
        this.legOffset = 0;
        this.armOffset = 0;
        this.isWalking = false;
    }
    
    draw(ctx, camera) {
        const pos = camera.apply(this.x, this.y);
        
        // Эффект мигания при неуязвимости
        if (this.invincibleTimer > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        ctx.save();
        
        // Поворот персонажа
        if (!this.facingRight) {
            ctx.translate(pos.x + this.w / 2, pos.y + this.h / 2);
            ctx.scale(-1, 1);
            ctx.translate(-(pos.x + this.w / 2), -(pos.y + this.h / 2));
        }
        
        const drawX = pos.x;
        
        // === ПЛАЩ (задний слой) ===
        ctx.fillStyle = "#4a2a1a";
        ctx.fillRect(drawX + 2, pos.y + 20, 28, 26);
        
        // === ТЕЛО (туника) ===
        ctx.fillStyle = "#6ab04c";
        ctx.fillRect(drawX + 6, pos.y + 16, 20, 30);
        
        // === ПОЯС ===
        ctx.fillStyle = "#c49a3a";
        ctx.fillRect(drawX + 4, pos.y + 32, 24, 6);
        
        // Пряжка пояса
        ctx.fillStyle = "#e0b84d";
        ctx.fillRect(drawX + 13, pos.y + 31, 6, 8);
        
        // === НОГИ С АНИМАЦИЕЙ ===
        ctx.fillStyle = "#4a7a2a";
        const leftLegY = pos.y + 42 + (this.legOffset * 0.5);
        ctx.fillRect(drawX + 6, leftLegY, 7, 10);
        
        const rightLegY = pos.y + 42 - (this.legOffset * 0.5);
        ctx.fillRect(drawX + 19, rightLegY, 7, 10);
        
        // Обувь
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(drawX + 4, leftLegY + 7, 10, 5);
        ctx.fillRect(drawX + 18, rightLegY + 7, 10, 5);
        
        // === РУКИ С АНИМАЦИЕЙ ===
        ctx.fillStyle = "#6ab04c";
        const leftArmY = pos.y + 20 + (this.armOffset * 0.7);
        ctx.fillRect(drawX, leftArmY, 6, 14);
        
        ctx.fillStyle = "#f5cba0";
        ctx.fillRect(drawX - 2, leftArmY + 10, 8, 6);
        
        ctx.fillStyle = "#6ab04c";
        const rightArmY = pos.y + 20 - (this.armOffset * 0.7);
        ctx.fillRect(drawX + 26, rightArmY, 6, 14);
        
        ctx.fillStyle = "#f5cba0";
        ctx.fillRect(drawX + 26, rightArmY + 10, 8, 6);
        
        // === ГОЛОВА ===
        ctx.fillStyle = "#f5cba0";
        ctx.fillRect(drawX + 8, pos.y + 2, 16, 16);
        
        // === ВОЛОСЫ (эльфийские) ===
        ctx.fillStyle = "#d4a853";
        ctx.fillRect(drawX + 6, pos.y, 20, 10);
        ctx.fillRect(drawX + 4, pos.y + 4, 6, 10);
        ctx.fillRect(drawX + 22, pos.y + 4, 6, 10);
        ctx.fillRect(drawX + 10, pos.y - 2, 12, 6);
        
        // === ЭЛЬФИЙСКИЕ УШИ ===
        ctx.fillStyle = "#f0b87a";
        ctx.beginPath();
        ctx.moveTo(drawX + 2, pos.y + 6);
        ctx.lineTo(drawX - 4, pos.y + 2);
        ctx.lineTo(drawX + 2, pos.y + 12);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(drawX + 30, pos.y + 6);
        ctx.lineTo(drawX + 36, pos.y + 2);
        ctx.lineTo(drawX + 30, pos.y + 12);
        ctx.fill();
        
        // === ГЛАЗА ===
        ctx.fillStyle = "#2c3e2a";
        ctx.fillRect(drawX + 11, pos.y + 8, 3, 3);
        ctx.fillRect(drawX + 18, pos.y + 8, 3, 3);
        
        // Зрачки (смотрят по направлению)
        ctx.fillStyle = "#ffffff";
        if (this.facingRight) {
            ctx.fillRect(drawX + 13, pos.y + 8, 1, 2);
            ctx.fillRect(drawX + 20, pos.y + 8, 1, 2);
        } else {
            ctx.fillRect(drawX + 11, pos.y + 8, 1, 2);
            ctx.fillRect(drawX + 18, pos.y + 8, 1, 2);
        }
        
        // Блики в глазах
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(drawX + 12, pos.y + 7, 1, 1);
        ctx.fillRect(drawX + 19, pos.y + 7, 1, 1);
        
        // === РОТ ===
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(drawX + 13, pos.y + 14, 6, 2);
        
        // === БРОВИ ===
        ctx.fillStyle = "#8b6914";
        ctx.fillRect(drawX + 10, pos.y + 6, 5, 2);
        ctx.fillRect(drawX + 17, pos.y + 6, 5, 2);
        
        // === НОС ===
        ctx.fillStyle = "#e0a878";
        ctx.fillRect(drawX + 15, pos.y + 11, 2, 2);
        
        // === РУНЫ НА ПОЯСЕ ===
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(drawX + 14, pos.y + 33, 1, 3);
        ctx.fillRect(drawX + 17, pos.y + 33, 1, 3);
        
        // === ДИАГОНАЛЬНЫЙ МЕЧ (СЛЕВА ИЛИ СПРАВА) ===
        if (this.attackCooldown > 0.2) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#ffcc44";
            
            // Временно игнорируем зеркалирование, чтобы нарисовать меч правильно
            ctx.restore();
            ctx.save();
            
            if (this.facingRight) {
                // Меч диагонально вверх-вправо
                ctx.beginPath();
                ctx.moveTo(pos.x + 28, pos.y + 24);
                ctx.lineTo(pos.x + 65, pos.y + 8);
                ctx.lineTo(pos.x + 68, pos.y + 14);
                ctx.lineTo(pos.x + 32, pos.y + 30);
                ctx.fillStyle = "#e0e0e0";
                ctx.fill();
                
                // Лезвие
                ctx.beginPath();
                ctx.moveTo(pos.x + 65, pos.y + 8);
                ctx.lineTo(pos.x + 78, pos.y + 0);
                ctx.lineTo(pos.x + 72, pos.y + 8);
                ctx.fillStyle = "#c0c0c0";
                ctx.fill();
                
                // Рукоять
                ctx.fillStyle = "#8b5a2b";
                ctx.fillRect(pos.x + 24, pos.y + 26, 8, 6);
                
                // Гарда
                ctx.fillStyle = "#d4af37";
                ctx.fillRect(pos.x + 22, pos.y + 28, 12, 2);
                
                // Блеск
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(pos.x + 55, pos.y + 12, 8, 3);
            } else {
                // Меч диагонально вверх-влево
                ctx.beginPath();
                ctx.moveTo(pos.x + 4, pos.y + 24);
                ctx.lineTo(pos.x - 33, pos.y + 8);
                ctx.lineTo(pos.x - 36, pos.y + 14);
                ctx.lineTo(pos.x, pos.y + 30);
                ctx.fillStyle = "#e0e0e0";
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(pos.x - 33, pos.y + 8);
                ctx.lineTo(pos.x - 46, pos.y + 0);
                ctx.lineTo(pos.x - 40, pos.y + 8);
                ctx.fillStyle = "#c0c0c0";
                ctx.fill();
                
                ctx.fillStyle = "#8b5a2b";
                ctx.fillRect(pos.x, pos.y + 26, 8, 6);
                
                ctx.fillStyle = "#d4af37";
                ctx.fillRect(pos.x - 2, pos.y + 28, 12, 2);
                
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(pos.x - 23, pos.y + 12, 8, 3);
            }
            ctx.shadowBlur = 0;
        }
        
        // === ПОЛОСКА ЗДОРОВЬЯ НАД ГОЛОВОЙ ===
        const hpPercent = this.hp / this.maxHp;
        ctx.fillStyle = "#6d2e2e";
        ctx.fillRect(drawX + 4, pos.y - 8, 24, 5);
        ctx.fillStyle = "#eaa04c";
        ctx.fillRect(drawX + 4, pos.y - 8, 24 * hpPercent, 5);
        
        // === ЭФФЕКТ ХОДЬБЫ (пыль под ногами) ===
        if (this.isWalking && this.grounded && Math.random() < 0.3) {
            ctx.fillStyle = "rgba(200, 180, 100, 0.4)";
            ctx.fillRect(drawX + 8, pos.y + 48, 4, 2);
            ctx.fillRect(drawX + 20, pos.y + 48, 4, 2);
        }
        
        ctx.restore();
        ctx.globalAlpha = 1;
    }
}