export class Race {
    constructor(raceId) {
        this.raceId = raceId;
        this.timestamp = Date.now();
        // stats
        this.score = 0;
        this.rank = 0;
        this.totalPlayers = 0;
        // puzzles
        this.solved = [];
        this.unsolved = [];
        this.reviewed = [];
    }
    setStats({ score, rank, totalPlayers }) {
        this.score = score || 0;
        this.rank = rank || 0;
        this.totalPlayers = totalPlayers || 0;
        return this;
    }
    setPuzzles({ solved, unsolved, reviewed }) {
        this.solved = solved || [];
        this.unsolved = unsolved || [];
        this.reviewed = reviewed || [];
        return this;
    }
}
