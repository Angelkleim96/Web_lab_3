/**
 * СИСТЕМА КОЛЛИЗИЙ ДЛЯ ПЛАТФОРМЕРА
 * 
 * Принципы работы:
 * 1. Axis-Aligned Bounding Box (AABB) - прямоугольники, выровненные по осям
 * 2. Пошаговое разрешение коллизий (сначала X, потом Y)
 * 3. Разделение на горизонтальные и вертикальные столкновения
 * 4. Обработка скольжения вдоль стен
 */

// ============ ОСНОВНЫЕ ФУНКЦИИ ============

/**
 * Проверка пересечения двух прямоугольников (AABB)
 * @param {Object} a - первый прямоугольник {x, y, w, h}
 * @param {Object} b - второй прямоугольник {x, y, w, h}
 * @returns {boolean} - пересекаются ли прямоугольники
 */
export function checkAABBCollision(a, b) {
    return !(a.x + a.w <= b.x ||
             b.x + b.w <= a.x ||
             a.y + a.h <= b.y ||
             b.y + b.h <= a.y);
}

/**
 * Получение глубины проникновения по оси X
 * @param {Object} a - первый прямоугольник
 * @param {Object} b - второй прямоугольник
 * @returns {number} - глубина проникновения (положительная - слева, отрицательная - справа)
 */
export function getOverlapX(a, b) {
    const leftOverlap = (a.x + a.w) - b.x;
    const rightOverlap = (b.x + b.w) - a.x;
    return leftOverlap < rightOverlap ? leftOverlap : -rightOverlap;
}

/**
 * Получение глубины проникновения по оси Y
 * @param {Object} a - первый прямоугольник
 * @param {Object} b - второй прямоугольник
 * @returns {number} - глубина проникновения (положительная - сверху, отрицательная - снизу)
 */
export function getOverlapY(a, b) {
    const topOverlap = (a.y + a.h) - b.y;
    const bottomOverlap = (b.y + b.h) - a.y;
    return topOverlap < bottomOverlap ? topOverlap : -bottomOverlap;
}

/**
 * Определение стороны столкновения
 * @param {Object} a - первый прямоугольник
 * @param {Object} b - второй прямоугольник
 * @returns {string} - сторона: 'top', 'bottom', 'left', 'right'
 */
export function getCollisionSide(a, b) {
    const overlapX = getOverlapX(a, b);
    const overlapY = getOverlapY(a, b);
    
    if (Math.abs(overlapX) < Math.abs(overlapY)) {
        return overlapX > 0 ? 'left' : 'right';
    } else {
        return overlapY > 0 ? 'top' : 'bottom';
    }
}

// ============ КОЛЛИЗИЯ С ПЛАТФОРМАМИ ============

/**
 * Проверка и обработка коллизии персонажа с платформами
 * @param {Object} entity - персонаж {x, y, w, h, vx, vy}
 * @param {Array} platforms - массив платформ {x, y, w, h}
 * @param {Object} result - объект для сохранения результатов {grounded, leftCollision, rightCollision, ceilingHit}
 * @returns {Object} - результат коллизии
 */
export function handlePlatformCollision(entity, platforms, result = {}) {
    // Инициализация результата
    result.grounded = false;
    result.leftCollision = false;
    result.rightCollision = false;
    result.ceilingHit = false;
    result.collisionObjects = [];
    
    // Временно сохраняем позицию для отката
    const originalX = entity.x;
    const originalY = entity.y;
    
    // === ШАГ 1: Обработка горизонтальной коллизии ===
    for (const plat of platforms) {
        if (checkAABBCollision(
            { x: entity.x, y: entity.y, w: entity.w, h: entity.h },
            { x: plat.x, y: plat.y, w: plat.w, h: plat.h }
        )) {
            const side = getCollisionSide(
                { x: entity.x, y: entity.y, w: entity.w, h: entity.h },
                { x: plat.x, y: plat.y, w: plat.w, h: plat.h }
            );
            
            if (side === 'left') {
                entity.x = plat.x - entity.w;
                result.leftCollision = true;
                result.collisionObjects.push({ type: 'platform', side: 'left', platform: plat });
            } else if (side === 'right') {
                entity.x = plat.x + plat.w;
                result.rightCollision = true;
                result.collisionObjects.push({ type: 'platform', side: 'right', platform: plat });
            }
        }
    }
    
    // === ШАГ 2: Обработка вертикальной коллизии ===
    for (const plat of platforms) {
        if (checkAABBCollision(
            { x: entity.x, y: entity.y, w: entity.w, h: entity.h },
            { x: plat.x, y: plat.y, w: plat.w, h: plat.h }
        )) {
            const side = getCollisionSide(
                { x: entity.x, y: entity.y, w: entity.w, h: entity.h },
                { x: plat.x, y: plat.y, w: plat.w, h: plat.h }
            );
            
            if (side === 'top') {
                // Приземление на платформу
                entity.y = plat.y - entity.h;
                entity.vy = 0;
                result.grounded = true;
                result.collisionObjects.push({ type: 'platform', side: 'top', platform: plat });
            } else if (side === 'bottom') {
                // Удар головой о платформу снизу
                entity.y = plat.y + plat.h;
                if (entity.vy < 0) entity.vy = 0;
                result.ceilingHit = true;
                result.collisionObjects.push({ type: 'platform', side: 'bottom', platform: plat });
            }
        }
    }
    
    return result;
}

/**
 * Улучшенная версия коллизии с платформами (с учётом туннелирования)
 * @param {Object} entity - персонаж
 * @param {Array} platforms - платформы
 * @param {number} deltaTime - время с прошлого кадра
 * @returns {Object} - результат коллизии
 */
export function handlePlatformCollisionAdvanced(entity, platforms, deltaTime) {
    const result = { grounded: false, leftCollision: false, rightCollision: false, ceilingHit: false };
    
    // Предотвращение туннелирования при большой скорости
    const maxStep = Math.max(Math.abs(entity.vx * deltaTime), Math.abs(entity.vy * deltaTime));
    const steps = Math.max(1, Math.ceil(maxStep / 5)); // Разбиваем движение на шаги
    
    if (steps === 1) {
        return handlePlatformCollision(entity, platforms, result);
    }
    
    // Пошаговое движение
    const stepX = (entity.vx * deltaTime) / steps;
    const stepY = (entity.vy * deltaTime) / steps;
    
    for (let i = 0; i < steps; i++) {
        entity.x += stepX;
        entity.y += stepY;
        handlePlatformCollision(entity, platforms, result);
    }
    
    return result;
}

// ============ КОЛЛИЗИЯ СО СПИСКАМИ ОБЪЕКТОВ ============

/**
 * Проверка коллизии со списком объектов (монеты, враги, шипы)
 * @param {Object} entity - персонаж
 * @param {Array} items - список объектов
 * @param {Function} onCollision - callback при коллизии
 * @returns {Array} - массив объектов, с которыми произошла коллизия
 */
export function checkCollisionWithList(entity, items, onCollision = null) {
    const collisions = [];
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.active === false) continue;
        
        if (checkAABBCollision(
            { x: entity.x, y: entity.y, w: entity.w, h: entity.h },
            { x: item.x, y: item.y, w: item.w, h: item.h }
        )) {
            collisions.push({ item, index: i });
            if (onCollision) onCollision(item, i);
        }
    }
    
    return collisions;
}

/**
 * Проверка коллизии с платформами и получение всех пересекающихся
 * @param {Object} entity - персонаж
 * @param {Array} platforms - платформы
 * @returns {Array} - массив платформ, с которыми есть коллизия
 */
export function getCollidingPlatforms(entity, platforms) {
    const colliding = [];
    
    for (const plat of platforms) {
        if (checkAABBCollision(
            { x: entity.x, y: entity.y, w: entity.w, h: entity.h },
            { x: plat.x, y: plat.y, w: plat.w, h: plat.h }
        )) {
            colliding.push(plat);
        }
    }
    
    return colliding;
}

// ============ ПРОВЕРКА НАХОЖДЕНИЯ НА ПЛАТФОРМЕ ============

/**
 * Проверка, стоит ли персонаж на платформе
 * @param {Object} entity - персонаж
 * @param {Array} platforms - платформы
 * @returns {boolean} - стоит ли на платформе
 */
export function isGrounded(entity, platforms) {
    // Создаём небольшой хитбокс под ногами
    const feetBox = {
        x: entity.x + 4,
        y: entity.y + entity.h - 1,
        w: entity.w - 8,
        h: 3
    };
    
    for (const plat of platforms) {
        if (checkAABBCollision(feetBox, { x: plat.x, y: plat.y, w: plat.w, h: plat.h })) {
            return true;
        }
    }
    return false;
}

/**
 * Проверка, есть ли платформа над головой
 * @param {Object} entity - персонаж
 * @param {Array} platforms - платформы
 * @returns {boolean} - есть ли препятствие сверху
 */
export function isCeilingAbove(entity, platforms) {
    const headBox = {
        x: entity.x + 4,
        y: entity.y - 2,
        w: entity.w - 8,
        h: 3
    };
    
    for (const plat of platforms) {
        if (checkAABBCollision(headBox, { x: plat.x, y: plat.y, w: plat.w, h: plat.h })) {
            return true;
        }
    }
    return false;
}

// ============ КОЛЛИЗИЯ С КРАЯМИ МИРА ============

/**
 * Обработка границ мира
 * @param {Object} entity - персонаж
 * @param {number} worldWidth - ширина мира
 * @param {number} worldHeight - высота мира
 * @returns {Object} - результат {leftBound, rightBound, topBound, bottomBound}
 */
export function handleWorldBounds(entity, worldWidth, worldHeight) {
    const result = { leftBound: false, rightBound: false, topBound: false, bottomBound: false };
    
    // Левая граница
    if (entity.x < 0) {
        entity.x = 0;
        result.leftBound = true;
    }
    
    // Правая граница
    if (entity.x + entity.w > worldWidth) {
        entity.x = worldWidth - entity.w;
        result.rightBound = true;
    }
    
    // Верхняя граница
    if (entity.y < 0) {
        entity.y = 0;
        entity.vy = 0;
        result.topBound = true;
    }
    
    // Нижняя граница (падение в бездну)
    if (entity.y + entity.h > worldHeight) {
        result.bottomBound = true;
    }
    
    return result;
}

// ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

/**
 * Получение платформы под персонажем
 * @param {Object} entity - персонаж
 * @param {Array} platforms - платформы
 * @returns {Object|null} - платформа под персонажем или null
 */
export function getPlatformBelow(entity, platforms) {
    const feetBox = {
        x: entity.x + 4,
        y: entity.y + entity.h,
        w: entity.w - 8,
        h: 5
    };
    
    for (const plat of platforms) {
        if (checkAABBCollision(feetBox, { x: plat.x, y: plat.y, w: plat.w, h: plat.h })) {
            return plat;
        }
    }
    return null;
}

/**
 * Проверка возможности прыжка (есть ли платформа под ногами)
 * @param {Object} entity - персонаж
 * @param {Array} platforms - платформы
 * @param {number} tolerance - допуск (пикселей)
 * @returns {boolean}
 */
export function canJump(entity, platforms, tolerance = 5) {
    const feetBox = {
        x: entity.x + 4,
        y: entity.y + entity.h,
        w: entity.w - 8,
        h: tolerance
    };
    
    for (const plat of platforms) {
        if (checkAABBCollision(feetBox, { x: plat.x, y: plat.y, w: plat.w, h: plat.h })) {
            return true;
        }
    }
    return false;
}