export class ScoreSystem {
    constructor() {
        this.currentScore = 0;
        this.settings = {
            coinValue: 10,
            enemyValue: 100,
            levelCompleteBonus: 500,
            timeBonusMultiplier: 2
        };
    }
    
    addCoinScore() {
        this.currentScore += this.settings.coinValue;
        return this.settings.coinValue;
    }
    
    addEnemyScore() {
        this.currentScore += this.settings.enemyValue;
        return this.settings.enemyValue;
    }
    
    addScore(amount) {
        this.currentScore += amount;
    }
    
    addLevelCompleteBonus(timeSpent) {
        let bonus = this.settings.levelCompleteBonus;
        if (timeSpent && timeSpent < 60) {
            const timeBonus = Math.floor((60 - timeSpent) * this.settings.timeBonusMultiplier);
            bonus += timeBonus;
        }
        this.currentScore += bonus;
        return bonus;
    }
    
    addDamagePenalty() {
        const penalty = 50;
        this.currentScore = Math.max(0, this.currentScore - penalty);
    }
    
    updateDistance(x, prevX) {}
    
    getScore() {
        return this.currentScore;
    }
    
    reset() {
        this.currentScore = 0;
    }
}