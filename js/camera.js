export class Camera {
    constructor(width, height, worldWidth, worldHeight) {
        this.width = width;
        this.height = height;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.x = 0;
        this.y = 0;
    }
    
    follow(target, targetWidth, targetHeight) {
        // Центрируем камеру на игроке
        let targetX = target.x + targetWidth / 2 - this.width / 2;
        let targetY = target.y + targetHeight / 2 - this.height / 2;
        
        // Ограничиваем границами мира
        // Левая граница
        if (targetX < 0) targetX = 0;
        // Правая граница
        if (targetX > this.worldWidth - this.width) {
            targetX = this.worldWidth - this.width;
        }
        // Верхняя граница
        if (targetY < 0) targetY = 0;
        // Нижняя граница
        if (targetY > this.worldHeight - this.height) {
            targetY = this.worldHeight - this.height;
        }
        
        this.x = targetX;
        this.y = targetY;
    }
    
    apply(x, y) {
        return { x: x - this.x, y: y - this.y };
    }
    
    reset() {
        this.x = 0;
        this.y = 0;
    }
}