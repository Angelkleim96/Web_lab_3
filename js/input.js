export class InputHandler {
    constructor() {
        this.left = false;
        this.right = false;
        this.jump = false;
        this.attack = false;
        this.attackPressed = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    handleKeyDown(e) {
        const key = e.key;
        
        if (key === 'a' || key === 'A' || key === 'ф' || key === 'Ф' || key === 'ArrowLeft') {
            this.left = true;
            e.preventDefault();
        }
        if (key === 'd' || key === 'D' || key === 'в' || key === 'В' || key === 'ArrowRight') {
            this.right = true;
            e.preventDefault();
        }
        if (key === 'w' || key === 'W' || key === 'ц' || key === 'Ц' || key === 'ArrowUp' || key === ' ') {
            this.jump = true;
            e.preventDefault();
        }
        if (key === 'e' || key === 'E' || key === 'у' || key === 'У') {
            this.attack = true;
            this.attackPressed = true;
            e.preventDefault();
        }
    }
    
    handleKeyUp(e) {
        const key = e.key;
        
        if (key === 'a' || key === 'A' || key === 'ф' || key === 'Ф' || key === 'ArrowLeft') {
            this.left = false;
            e.preventDefault();
        }
        if (key === 'd' || key === 'D' || key === 'в' || key === 'В' || key === 'ArrowRight') {
            this.right = false;
            e.preventDefault();
        }
        if (key === 'w' || key === 'W' || key === 'ц' || key === 'Ц' || key === 'ArrowUp' || key === ' ') {
            this.jump = false;
            e.preventDefault();
        }
        if (key === 'e' || key === 'E' || key === 'у' || key === 'У') {
            this.attack = false;
            e.preventDefault();
        }
    }
    
    consumeAttack() {
        if (this.attackPressed) {
            this.attackPressed = false;
            return true;
        }
        return false;
    }
    
    isLeftPressed() { return this.left; }
    isRightPressed() { return this.right; }
    isJumpPressed() { return this.jump; }
}