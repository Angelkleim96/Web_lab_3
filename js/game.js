import { Camera } from './camera.js';
import { Player } from './player.js';
import { Platform } from './platform.js';
import { Enemy } from './enemy.js';
import { Coin } from './coin.js';
import { Spike } from './spike.js';
import { Portal } from './portal.js';
import { ScoreSystem } from './scoreSystem.js';
import { rectCollide } from './utils.js';

export class Game {
    constructor(canvas, input) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = input;
        
        this.currentLevel = 1;
        this.worldWidth = 2800;
        this.worldHeight = 550;
        
        this.camera = new Camera(canvas.width, canvas.height, this.worldWidth, this.worldHeight);
        this.player = null;
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.spikes = [];
        this.portal = null;
        
        this.scoreSystem = new ScoreSystem();
        this.coinScore = 0;
        
        this.gameRunning = true;
        this.isPaused = false;      // Флаг паузы
        this.levelCompleted = false;
        this.gameTime = 0;
        this.prevPlayerX = 0;
        
        this.backgroundImages = {
            level1: null,
            level2: null,
            level3: null
        };
        
        this.previousPlayer = null;
        this.interpolationAlpha = 0;
        
        this.initLevel = this.initLevel.bind(this);
        this.initLevel();
    }
    
    // ========== МЕТОДЫ УПРАВЛЕНИЯ ==========
    
    startGame() {
        if (!this.gameRunning && !this.levelCompleted) {
            // Если игра окончена (смерть) - рестартим
            this.resetGame();
        } else if (this.isPaused) {
            // Если на паузе - снимаем паузу
            this.resumeGame();
        } else if (!this.gameRunning && this.levelCompleted) {
            // Если уровень пройден - ничего не делаем
            return;
        }
    }
    
  
    resumeGame() {
        if (this.isPaused) {
            this.isPaused = false;
            this.updateGameStatusUI();
            
            // Меняем иконку кнопки паузы обратно на ⏸
            const pauseBtn = document.getElementById('pauseBtnOverlay');
            if (pauseBtn) pauseBtn.innerHTML = '❚❚';
            
            // Скрываем оверлей паузы
            const pauseOverlay = document.getElementById('pauseOverlay');
            if (pauseOverlay) pauseOverlay.classList.add('hidden');
        }
    }

    pauseGame() {
        if (this.gameRunning && !this.levelCompleted && !this.isPaused) {
            this.isPaused = true;
            this.updateGameStatusUI();
            
            // Меняем иконку кнопки паузы на ▶️ (для возобновления)
            const pauseBtn = document.getElementById('pauseBtnOverlay');
            if (pauseBtn) pauseBtn.innerHTML = '▶';
            
            // Показываем оверлей паузы
            const pauseOverlay = document.getElementById('pauseOverlay');
            if (pauseOverlay) pauseOverlay.classList.remove('hidden');
        }
    }
    
    restartGame() {
        this.resetGame();
    }
    
    updateGameStatusUI() {
        const statusElement = document.getElementById('gameStatus');
        if (!statusElement) return;
        
        if (this.isPaused) {
            statusElement.innerHTML = '⏸️ ПАУЗА';
            statusElement.className = 'game-status paused';
        } else if (!this.gameRunning && !this.levelCompleted) {
            statusElement.innerHTML = '💀 GAME OVER';
            statusElement.className = 'game-status gameover';
        } else if (this.levelCompleted) {
            statusElement.innerHTML = '🏆 УРОВЕНЬ ПРОЙДЕН';
            statusElement.className = 'game-status gameover';
        } else {
            statusElement.innerHTML = 'Эльф - Странник';
            statusElement.className = 'game-status running';
        }
    }
    
    // ========== ОСТАЛЬНЫЕ МЕТОДЫ ==========
    
    loadBackground(level, imageUrl) {
        const img = new Image();
        img.onload = () => {
            console.log(`Фон для уровня ${level} загружен`);
            if (level === 1) this.backgroundImages.level1 = img;
            if (level === 2) this.backgroundImages.level2 = img;
            if (level === 3) this.backgroundImages.level3 = img;
        };
        img.onerror = () => {
            console.warn(`Не удалось загрузить фон для уровня ${level}: ${imageUrl}`);
        };
        img.src = imageUrl;
    }
    
    setBackground(level, imageUrl) {
        this.loadBackground(level, imageUrl);
    }
    
    addCoinAbovePlatform(platform, offsetX = 0) {
        const coinX = platform.x + (platform.w / 2) - 6 + offsetX;
        const coinY = platform.y - 14;
        this.coins.push(new Coin(coinX, coinY));
    }
    
    initLevel() {
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.spikes = [];
        this.isPaused = false;
        
        // Скрываем оверлей паузы если он был
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (pauseOverlay) pauseOverlay.classList.add('hidden');
        
        if (this.currentLevel === 1) {
            this.worldWidth = 2800;
            this.platforms.push(new Platform(60, 470, 140, 20));
            this.platforms.push(new Platform(320, 400, 140, 20));
            this.platforms.push(new Platform(620, 340, 140, 20));
            this.platforms.push(new Platform(920, 380, 140, 20));
            this.platforms.push(new Platform(1220, 310, 140, 20));
            this.platforms.push(new Platform(1520, 360, 140, 20));
            this.platforms.push(new Platform(1820, 280, 140, 20));
            this.platforms.push(new Platform(2120, 350, 140, 20));
            this.platforms.push(new Platform(2420, 400, 140, 20));
            this.platforms.push(new Platform(2680, 440, 120, 20));
            
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[0], 20);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[0], -20);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[1], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[2], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[3], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[4], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[5], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[6], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[7], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[8], 0);
            
            this.enemies = [];
            this.enemies.push(new Enemy(370, 360, 320, 460, 30, 0.5));
            this.enemies.push(new Enemy(970, 340, 920, 1060, 30, 0.5));
            this.enemies.push(new Enemy(1570, 320, 1520, 1660, 30, 0.5));
            
            this.spikes = [];
            this.spikes.push(new Spike(660, 325, 30, 16, 10));
            this.spikes.push(new Spike(960, 365, 28, 16, 10));
            this.spikes.push(new Spike(1560, 345, 30, 16, 10));
            this.spikes.push(new Spike(1860, 265, 28, 16, 10));
            this.spikes.push(new Spike(2460, 385, 30, 16, 10));
            
            this.portal = new Portal(2720, 300);
            
        } else if (this.currentLevel === 2) {
            this.worldWidth = 3000;
            this.platforms.push(new Platform(60, 470, 150, 20));
            this.platforms.push(new Platform(340, 400, 150, 20));
            this.platforms.push(new Platform(650, 330, 150, 20));
            this.platforms.push(new Platform(960, 380, 150, 20));
            this.platforms.push(new Platform(1270, 300, 150, 20));
            this.platforms.push(new Platform(1580, 360, 150, 20));
            this.platforms.push(new Platform(1890, 270, 150, 20));
            this.platforms.push(new Platform(2200, 350, 150, 20));
            this.platforms.push(new Platform(2510, 410, 150, 20));
            this.platforms.push(new Platform(2820, 450, 130, 20));
            
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[0], 30);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[0], -30);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[1], 20);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[1], -20);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[2], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[3], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[4], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[5], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[6], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[7], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[8], 20);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[8], -20);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[9], 0);
            
            this.enemies = [];
            this.enemies.push(new Enemy(390, 360, 340, 490, 35, 0.55));
            this.enemies.push(new Enemy(1010, 340, 960, 1110, 35, 0.55));
            this.enemies.push(new Enemy(1630, 320, 1580, 1730, 35, 0.55));
            this.enemies.push(new Enemy(2250, 310, 2200, 2350, 35, 0.55));
            
            this.spikes = [];
            this.spikes.push(new Spike(690, 315, 30, 16, 10));
            this.spikes.push(new Spike(1000, 365, 28, 16, 10));
            this.spikes.push(new Spike(1620, 345, 30, 16, 10));
            this.spikes.push(new Spike(1930, 255, 28, 16, 10));
            this.spikes.push(new Spike(2550, 395, 30, 16, 10));
            
            this.portal = new Portal(2900, 300);
            
        } else {
            this.worldWidth = 3200;
            this.platforms.push(new Platform(60, 470, 160, 20));
            this.platforms.push(new Platform(350, 380, 160, 20));
            this.platforms.push(new Platform(670, 310, 160, 20));
            this.platforms.push(new Platform(990, 370, 160, 20));
            this.platforms.push(new Platform(1310, 280, 160, 20));
            this.platforms.push(new Platform(1630, 340, 160, 20));
            this.platforms.push(new Platform(1950, 250, 160, 20));
            this.platforms.push(new Platform(2270, 330, 160, 20));
            this.platforms.push(new Platform(2590, 390, 160, 20));
            this.platforms.push(new Platform(2910, 440, 150, 20));
            
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[0], 40);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[0], -40);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[1], 30);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[1], -30);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[2], 20);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[2], -20);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[3], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[4], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[5], 20);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[5], -20);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[6], 0);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[7], 20);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[7], -20);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[8], 30);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[8], -30);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[9], 20);
            if (Math.random() < 0.3) this.addCoinAbovePlatform(this.platforms[9], -20);
            
            this.enemies = [];
            this.enemies.push(new Enemy(400, 340, 350, 510, 40, 0.6));
            this.enemies.push(new Enemy(1040, 330, 990, 1150, 40, 0.6));
            this.enemies.push(new Enemy(1680, 300, 1630, 1790, 40, 0.6));
            this.enemies.push(new Enemy(2000, 210, 1950, 2110, 40, 0.6));
            this.enemies.push(new Enemy(2320, 290, 2270, 2430, 40, 0.6));
            
            this.spikes = [];
            this.spikes.push(new Spike(720, 295, 30, 16, 10));
            this.spikes.push(new Spike(1040, 355, 28, 16, 10));
            this.spikes.push(new Spike(1680, 325, 30, 16, 10));
            this.spikes.push(new Spike(2000, 235, 28, 16, 10));
            this.spikes.push(new Spike(2640, 375, 30, 16, 10));
            
            this.portal = new Portal(3100, 370);
        }
        
        this.player = new Player(100, 430);
        this.player.worldWidth = this.worldWidth;
        
        this.camera.worldWidth = this.worldWidth;
        this.camera.worldHeight = this.worldHeight;
        this.camera.reset();
        
        this.coinScore = 0;
        this.gameTime = 0;
        this.gameRunning = true;
        this.levelCompleted = false;
        this.isPaused = false;
        this.previousPlayer = null;
        this.prevPlayerX = this.player.x;
        this.updateUI();
        this.updateGameStatusUI();
    }
    
    updateUI() {
        const percent = (this.player.hp / this.player.maxHp) * 100;
        const healthFill = document.getElementById('healthFill');
        if (healthFill) healthFill.style.width = `${Math.max(0, percent)}%`;
        
        const coinCounter = document.getElementById('coinCounter');
        if (coinCounter) coinCounter.innerText = this.coinScore;
        
        const levelDisplay = document.getElementById('levelDisplay');
        if (levelDisplay) levelDisplay.innerText = this.currentLevel;
        
        document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
        if (this.currentLevel === 1) {
            const btn = document.getElementById('level1Btn');
            if (btn) btn.classList.add('active');
        } else if (this.currentLevel === 2) {
            const btn = document.getElementById('level2Btn');
            if (btn) btn.classList.add('active');
        } else if (this.currentLevel === 3) {
            const btn = document.getElementById('level3Btn');
            if (btn) btn.classList.add('active');
        }
    }
    
    update(deltaTime) {
        // Если игра на паузе - не обновляем логику
        if (this.isPaused) return;
        
        if (!this.gameRunning || this.levelCompleted) return;
        
        this.gameTime += deltaTime;
        
        if (this.scoreSystem) {
            this.scoreSystem.updateDistance(this.player.x, this.prevPlayerX);
        }
        this.prevPlayerX = this.player.x;
        
        if (!this.previousPlayer) {
            this.previousPlayer = { x: this.player.x, y: this.player.y };
        } else {
            this.previousPlayer.x = this.player.x;
            this.previousPlayer.y = this.player.y;
        }
        
        this.player.update(deltaTime, this.platforms, this.input);
        
        this.camera.follow(this.player, this.player.w, this.player.h);
        
        if (!this.player.isAlive()) {
            this.gameRunning = false;
            this.updateGameStatusUI();
            const deathScreen = document.getElementById('deathScreen');
            if (deathScreen) deathScreen.classList.remove('hidden');
            return;
        }
        
        for (let enemy of this.enemies) {
            enemy.update(deltaTime, this.platforms);
        }
        this.enemies = this.enemies.filter(e => e.active);
        
        if (this.portal) this.portal.update(deltaTime);
        
        for (let spike of this.spikes) {
            if (rectCollide(
                { x: this.player.x, y: this.player.y, w: this.player.w, h: this.player.h },
                { x: spike.x, y: spike.y, w: spike.w, h: spike.h }
            )) {
                this.player.takeDamage(spike.damage);
                this.updateUI();
            }
        }
        
        for (let enemy of this.enemies) {
            if (rectCollide(
                { x: this.player.x, y: this.player.y, w: this.player.w, h: this.player.h },
                { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h }
            )) {
                const enemyDamage = 5 + Math.floor(this.gameTime / 10) * 5;
                this.player.takeDamage(enemyDamage);
                this.updateUI();
            }
        }
        
        for (let coin of this.coins) {
            if (!coin.collected && rectCollide(
                { x: this.player.x, y: this.player.y, w: this.player.w, h: this.player.h },
                { x: coin.x, y: coin.y, w: coin.w, h: coin.h }
            )) {
                this.coinScore += coin.collect();
                if (this.scoreSystem) this.scoreSystem.addCoinScore();
                this.updateUI();
            }
        }
        this.coins = this.coins.filter(c => !c.collected);
        
        if (this.input.consumeAttack() && this.player.canAttack()) {
            this.player.performAttack();
            const attackBox = this.player.getAttackHitbox();
            for (let enemy of this.enemies) {
                if (rectCollide(attackBox, { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h })) {
                    enemy.takeDamage(10);
                    if (this.scoreSystem) this.scoreSystem.addEnemyScore();
                    enemy.knockbackTimer = 0.35;
                    enemy.knockbackSpeed = this.player.facingRight ? -5 : 5;
                    enemy.speed = 0;
                }
            }
            this.enemies = this.enemies.filter(e => e.active);
        }
        
        if (this.portal && rectCollide(
            { x: this.player.x, y: this.player.y, w: this.player.w, h: this.player.h },
            { x: this.portal.x, y: this.portal.y, w: this.portal.w, h: this.portal.h }
        )) {
            this.levelCompleted = true;
            this.gameRunning = false;
            this.updateGameStatusUI();
            
            if (this.scoreSystem) {
                this.scoreSystem.addLevelCompleteBonus(this.gameTime);
                const victoryText = document.getElementById('victoryText');
                if (victoryText) victoryText.innerHTML = `Уровень ${this.currentLevel} пройден!<br>🏆 Счёт: ${this.scoreSystem.getScore()}<br>🪙 Монет: ${this.coinScore}`;
            } else {
                const victoryText = document.getElementById('victoryText');
                if (victoryText) victoryText.innerHTML = `Уровень ${this.currentLevel} пройден!<br>Собрано монет: ${this.coinScore}`;
            }
            
            const nextLevelBtn = document.getElementById('nextLevelBtn');
            const victoryTitle = document.getElementById('victoryTitle');
            
            if (this.currentLevel === 3) {
                if (nextLevelBtn) nextLevelBtn.style.display = 'none';
                if (victoryTitle) victoryTitle.innerHTML = '🏆 ИГРА ПРОЙДЕНА! 🏆';
                if (victoryText) victoryText.innerHTML = `Ты прошёл всю игру!<br>🏆 Финальный счёт: ${this.scoreSystem ? this.scoreSystem.getScore() : this.coinScore}<br>🪙 Монет собрано: ${this.coinScore}`;
            } else {
                if (nextLevelBtn) nextLevelBtn.style.display = 'inline-block';
                if (victoryTitle) victoryTitle.innerHTML = '🌟 ПОБЕДА';
            }
            
            const victoryScreen = document.getElementById('victoryScreen');
            if (victoryScreen) victoryScreen.classList.remove('hidden');
        }
    }
    
    interpolate(alpha) {
        this.interpolationAlpha = alpha;
    }
    
    draw(ctx) {
        if (!ctx) ctx = this.ctx;
        
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        let bgImage = null;
        if (this.currentLevel === 1) bgImage = this.backgroundImages.level1;
        if (this.currentLevel === 2) bgImage = this.backgroundImages.level2;
        if (this.currentLevel === 3) bgImage = this.backgroundImages.level3;
        
        if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
            const bgWidth = bgImage.width;
            const bgHeight = bgImage.height;
            const scale = Math.max(this.canvas.width / bgWidth, this.canvas.height / bgHeight);
            const scaledWidth = bgWidth * scale;
            const scaledHeight = bgHeight * scale;
            const parallaxX = this.camera.x * 0.3;
            const bgX = -parallaxX % scaledWidth;
            
            ctx.drawImage(bgImage, bgX, 0, scaledWidth, scaledHeight);
            if (bgX + scaledWidth < this.canvas.width) {
                ctx.drawImage(bgImage, bgX + scaledWidth, 0, scaledWidth, scaledHeight);
            }
        } else {
            let grad;
            if (this.currentLevel === 1) {
                grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
                grad.addColorStop(0, "#1a3a3a");
                grad.addColorStop(1, "#2a4a3a");
            } else if (this.currentLevel === 2) {
                grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
                grad.addColorStop(0, "#3a2a3a");
                grad.addColorStop(1, "#4a3a2a");
            } else {
                grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
                grad.addColorStop(0, "#3a1a1a");
                grad.addColorStop(1, "#4a2a1a");
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        for (let plat of this.platforms) plat.draw(ctx, this.camera);
        for (let spike of this.spikes) spike.draw(ctx, this.camera);
        for (let coin of this.coins) coin.draw(ctx, this.camera);
        for (let enemy of this.enemies) enemy.draw(ctx, this.camera);
        if (this.portal) this.portal.draw(ctx, this.camera);
        
        if (this.player) {
            if (this.previousPlayer && this.interpolationAlpha > 0 && this.interpolationAlpha < 1) {
                const interpolatedX = this.previousPlayer.x + 
                    (this.player.x - this.previousPlayer.x) * this.interpolationAlpha;
                const originalX = this.player.x;
                this.player.x = interpolatedX;
                this.player.draw(ctx, this.camera);
                this.player.x = originalX;
            } else {
                this.player.draw(ctx, this.camera);
            }
        }
        
        if (this.scoreSystem) {
            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 24px monospace";
            ctx.shadowBlur = 4;
            ctx.shadowColor = "black";
            ctx.fillText(`🏆 ${this.scoreSystem.getScore()}`, this.canvas.width - 180, 50);
            ctx.shadowBlur = 0;
        }
        
        // Отображение статуса паузы на канвасе
        if (this.isPaused) {
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 48px monospace";
            ctx.textAlign = "center";
            ctx.fillText("⏸️ ПАУЗА", this.canvas.width / 2, this.canvas.height / 2);
            ctx.font = "20px monospace";
            ctx.fillStyle = "#ffeaac";
            ctx.fillText("Нажмите ▶️ Старт или ПРОБЕЛ", this.canvas.width / 2, this.canvas.height / 2 + 60);
            ctx.textAlign = "left";
        }
    }
    
    loadLevel(level) {
        this.currentLevel = level;
        this.initLevel();
        const deathScreen = document.getElementById('deathScreen');
        const victoryScreen = document.getElementById('victoryScreen');
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (deathScreen) deathScreen.classList.add('hidden');
        if (victoryScreen) victoryScreen.classList.add('hidden');
        if (pauseOverlay) pauseOverlay.classList.add('hidden');
    }
    
    nextLevel() {
        if (this.currentLevel === 3) {
            const victoryScreen = document.getElementById('victoryScreen');
            if (victoryScreen) victoryScreen.classList.remove('hidden');
            return;
        }
        
        if (this.currentLevel < 3) {
            this.currentLevel++;
            this.initLevel();
        } else {
            this.currentLevel = 1;
            this.initLevel();
        }
        const deathScreen = document.getElementById('deathScreen');
        const victoryScreen = document.getElementById('victoryScreen');
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (deathScreen) deathScreen.classList.add('hidden');
        if (victoryScreen) victoryScreen.classList.add('hidden');
        if (pauseOverlay) pauseOverlay.classList.add('hidden');
    }
    
    resetGame() {
        this.currentLevel = 1;
        if (this.scoreSystem) this.scoreSystem.reset();
        this.initLevel();
        const deathScreen = document.getElementById('deathScreen');
        const victoryScreen = document.getElementById('victoryScreen');
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (deathScreen) deathScreen.classList.add('hidden');
        if (victoryScreen) victoryScreen.classList.add('hidden');
        if (pauseOverlay) pauseOverlay.classList.add('hidden');
        this.updateGameStatusUI();
    }
}