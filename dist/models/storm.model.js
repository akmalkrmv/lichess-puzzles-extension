export class Storm {
    constructor(stormId) {
        this.stormId = stormId;
        this.timestamp = Date.now();
        // stats
        this.score = 0;
        this.moves = 0;
        this.accuracy = 0;
        this.combo = 0;
        this.time = 0;
        this.timePerMove = 0;
        this.highestSolved = 0;
        // puzzles
        this.solved = [];
        this.unsolved = [];
        this.reviewed = [];
    }
    setStats({ score, moves, accuracy, combo, time, timePerMove, highestSolved }) {
        this.score = score || 0;
        this.moves = moves || 0;
        this.accuracy = accuracy || 0;
        this.combo = combo || 0;
        this.time = time || 0;
        this.timePerMove = timePerMove || 0;
        this.highestSolved = highestSolved || 0;
        return this;
    }
    setPuzzles({ solved, unsolved, reviewed }) {
        this.solved = solved || [];
        this.unsolved = unsolved || [];
        this.reviewed = reviewed || [];
        return this;
    }
}
