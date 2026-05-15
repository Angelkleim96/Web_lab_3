/**
 * ИГРОВОЙ ЦИКЛ ДЛЯ ПЛАТФОРМЕРА
 * 
 * Принципы работы:
 * 1. Используется requestAnimationFrame для плавной анимации
 * 2. deltaTime - время между кадрами для независимой от FPS физики
 * 3. Фиксированный шаг физики (опционально) для стабильности
 * 4. Разделение на обновление (update) и отрисовку (draw)
 */

export class GameLoop {
    constructor(game, canvas) {
        this.game = game;           // Экземпляр игры
        this.canvas = canvas;       // Canvas элемент
        this.ctx = canvas.getContext('2d');
        
        // Временные переменные для цикла
        this.lastTimestamp = 0;      // Время последнего кадра
        this.deltaTime = 0;          // Время между кадрами (секунды)
        this.frameCount = 0;         // Счётчик кадров
        this.fps = 0;                // Текущий FPS
        this.fpsUpdateTimer = 0;     // Таймер обновления FPS
        
        // Флаги состояния
        this.isRunning = false;       // Запущен ли цикл
        this.isPaused = false;        // Приостановлена ли игра
        this.animationId = null;      // ID анимации для cancel
        
        // Настройки физики
        this.useFixedTimestep = true;  // Использовать фиксированный шаг
        this.fixedDeltaTime = 1 / 60;  // Фиксированный шаг 60 FPS (0.01667 сек)
        this.maxDeltaTime = 0.033;     // Максимальный deltaTime (33 мс)
        this.accumulator = 0;          // Накопитель времени для фиксированного шага
    }
    
    /**
     * Запуск игрового цикла
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTimestamp = performance.now();
        this.animationId = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        console.log('🎮 Игровой цикл запущен');
    }
    
    /**
     * Остановка игрового цикла
     */
    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        console.log('🛑 Игровой цикл остановлен');
    }
    
    /**
     * Пауза игры
     */
    pause() {
        this.isPaused = true;
        console.log('⏸️ Игра на паузе');
    }
    
    /**
     * Возобновление игры
     */
    resume() {
        this.isPaused = false;
        this.lastTimestamp = performance.now();
        console.log('▶️ Игра возобновлена');
    }
    
    /**
     * ГЛАВНЫЙ ИГРОВОЙ ЦИКЛ
     * Вызывается на каждом кадре через requestAnimationFrame
     */
    gameLoop(currentTimestamp) {
        if (!this.isRunning) return;
        
        // Запрашиваем следующий кадр
        this.animationId = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        
        // Вычисляем deltaTime (время между кадрами в секундах)
        let rawDelta = Math.min(0.033, (currentTimestamp - this.lastTimestamp) / 1000);
        
        if (rawDelta <= 0) {
            this.lastTimestamp = currentTimestamp;
            return;
        }
        
        this.lastTimestamp = currentTimestamp;
        this.deltaTime = rawDelta;
        
        // Обновление FPS счётчика (раз в секунду)
        this.frameCount++;
        this.fpsUpdateTimer += this.deltaTime;
        if (this.fpsUpdateTimer >= 1.0) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTimer = 0;
            this.updateFPSElement();
        }
        
        // Если игра на паузе - только отрисовка без обновления
        if (this.isPaused) {
            this.draw();
            return;
        }
        
        // === ОБНОВЛЕНИЕ ИГРЫ ===
        if (this.useFixedTimestep) {
            // Режим с фиксированным шагом физики (более стабильный)
            this.updateWithFixedTimestep();
        } else {
            // Простой режим (deltaTime напрямую)
            this.updateWithVariableTimestep();
        }
        
        // === ОТРИСОВКА ===
        this.draw();
    }
    
    /**
     * Обновление с переменным шагом (простой вариант)
     */
    updateWithVariableTimestep() {
        // Ограничиваем максимальный deltaTime
        const dt = Math.min(this.deltaTime, this.maxDeltaTime);
        
        // Обновляем игровую логику
        if (this.game && this.game.update) {
            this.game.update(dt);
        }
    }
    
    /**
     * Обновление с фиксированным шагом (рекомендуемый вариант)
     * Обеспечивает стабильную физику независимо от FPS
     */
    updateWithFixedTimestep() {
        // Добавляем прошедшее время в накопитель
        this.accumulator += Math.min(this.deltaTime, this.maxDeltaTime);
        
        // Выполняем фиксированные шаги физики
        let steps = 0;
        const maxSteps = 3; // Максимум 3 шага за кадр (предотвращение "спирали смерти")
        
        while (this.accumulator >= this.fixedDeltaTime && steps < maxSteps) {
            // Обновляем игру с фиксированным шагом
            if (this.game && this.game.updateFixed) {
                this.game.updateFixed(this.fixedDeltaTime);
            } else if (this.game && this.game.update) {
                this.game.update(this.fixedDeltaTime);
            }
            
            this.accumulator -= this.fixedDeltaTime;
            steps++;
        }
        
        // Интерполяция для плавной отрисовки (опционально)
        const alpha = this.accumulator / this.fixedDeltaTime;
        if (this.game && this.game.interpolate) {
            this.game.interpolate(alpha);
        }
    }
    
    /**
     * Отрисовка кадра
     */
    draw() {
        if (!this.canvas || !this.ctx) return;
        
        // Очищаем canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Вызываем отрисовку игры
        if (this.game && this.game.draw) {
            this.game.draw(this.ctx);
        }
        
        // Отрисовка дополнительной информации (FPS, отладка)
        this.drawDebugInfo();
    }
    
    /**
     * Отрисовка отладочной информации
     */
    drawDebugInfo() {
        if (!this.ctx) return;
        
        this.ctx.font = "10px monospace";
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        this.ctx.fillText(`FPS: ${this.fps}`, 10, 15);
        this.ctx.fillText(`Delta: ${(this.deltaTime * 1000).toFixed(2)} ms`, 10, 28);
        
        if (this.isPaused) {
            this.ctx.font = "bold 20px monospace";
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            this.ctx.fillText("ПАУЗА", this.canvas.width / 2 - 40, this.canvas.height / 2);
        }
    }
    
    /**
     * Обновление отображения FPS на UI
     */
    updateFPSElement() {
        const fpsElement = document.getElementById('fpsCounter');
        if (fpsElement) {
            fpsElement.textContent = `${this.fps} FPS`;
        }
    }
    
    /**
     * Получение текущего FPS
     */
    getCurrentFPS() {
        return this.fps;
    }
    
    /**
     * Получение deltaTime текущего кадра
     */
    getCurrentDeltaTime() {
        return this.deltaTime;
    }
}

/**
 * Упрощённый игровой цикл (для небольших игр)
 */
export class SimpleGameLoop {
    constructor(game, canvas) {
        this.game = game;
        this.canvas = canvas;
        this.isRunning = false;
        this.lastTime = 0;
        this.animationId = null;
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animationId = requestAnimationFrame((t) => this.loop(t));
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    loop(currentTime) {
        if (!this.isRunning) return;
        
        this.animationId = requestAnimationFrame((t) => this.loop(t));
        
        // Вычисляем deltaTime
        let delta = Math.min(0.033, (currentTime - this.lastTime) / 1000);
        if (delta <= 0) {
            this.lastTime = currentTime;
            return;
        }
        
        this.lastTime = currentTime;
        
        // Обновление
        if (this.game && this.game.update) {
            this.game.update(delta);
        }
        
        // Отрисовка
        if (this.game && this.game.draw) {
            this.game.draw();
        }
    }
}