import { Game } from './game.js';
import { InputHandler } from './input.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const input = new InputHandler();
    const game = new Game(canvas, input);
    
    // Настройка фоновых изображений
    game.setBackground(1, './assets/forest-bg.jpg');
    game.setBackground(2, './assets/mountain-bg.jpg');
    game.setBackground(3, './assets/volcano-bg.jpg');
    
    let lastTime = 0;
    
    function gameLoop(nowMs) {
        const delta = Math.min(0.033, (nowMs - lastTime) / 1000);
        if (delta > 0 && lastTime !== 0) {
            game.update(delta);
            game.draw();
        }
        lastTime = nowMs;
        requestAnimationFrame(gameLoop);
    }
    
    // ========== КНОПКА ПАУЗЫ (значок в левом верхнем углу) ==========
    const pauseBtnOverlay = document.getElementById('pauseBtnOverlay');
    if (pauseBtnOverlay) {
        pauseBtnOverlay.addEventListener('click', () => {
            if (game.isPaused) {
                game.resumeGame();
            } else if (game.gameRunning && !game.levelCompleted) {
                game.pauseGame();
            }
        });
    }
    
    // Кнопки в оверлее паузы
    const resumeBtn = document.getElementById('resumeBtn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => game.resumeGame());
    }
    
    const pauseRestartBtn = document.getElementById('pauseRestartBtn');
    if (pauseRestartBtn) {
        pauseRestartBtn.addEventListener('click', () => {
            game.restartGame();
        });
    }
    
    // ========== ОСТАЛЬНЫЕ КНОПКИ ==========
    
    const restartBtn = document.getElementById('restartBtn');
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    const resetGameBtn = document.getElementById('resetGameBtn');
    const level1Btn = document.getElementById('level1Btn');
    const level2Btn = document.getElementById('level2Btn');
    const level3Btn = document.getElementById('level3Btn');
    
    if (restartBtn) restartBtn.addEventListener('click', () => game.resetGame());
    if (nextLevelBtn) {
        nextLevelBtn.addEventListener('click', () => {
            if (game.currentLevel === 3 && game.levelCompleted) {
                const victoryScreen = document.getElementById('victoryScreen');
                if (victoryScreen) victoryScreen.classList.remove('hidden');
            } else {
                game.nextLevel();
            }
        });
    }
    if (resetGameBtn) resetGameBtn.addEventListener('click', () => game.resetGame());
    
    if (level1Btn) level1Btn.addEventListener('click', () => game.loadLevel(1));
    if (level2Btn) level2Btn.addEventListener('click', () => game.loadLevel(2));
    if (level3Btn) level3Btn.addEventListener('click', () => game.loadLevel(3));
    
    // Горячая клавиша ESC для паузы
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            if (game.isPaused) {
                game.resumeGame();
            } else if (game.gameRunning && !game.levelCompleted) {
                game.pauseGame();
            }
        }
        // Пробел для снятия паузы
        if (e.key === ' ' || e.key === 'Space') {
            if (game.isPaused) {
                e.preventDefault();
                game.resumeGame();
            }
        }
    });
    
    // ЗАПУСК ИГРОВОГО ЦИКЛА
    requestAnimationFrame(gameLoop);
});