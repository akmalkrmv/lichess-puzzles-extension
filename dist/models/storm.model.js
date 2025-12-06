export class Storm {
    constructor() {
        // puzzles
        this.solved = [];
        this.unsolved = [];
        this.reviewed = [];
        // stats
        this.score = 0;
        this.moves = 0;
        this.accuracy = 0;
        this.combo = 0;
        this.time = 0;
        this.timePerMove = 0;
        this.highestSolved = 0;
        this.timestamp = Date.now();
    }
}
