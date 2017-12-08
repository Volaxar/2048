import Tile from './tile'
import Grid from './grid'

export default class GameManager {
    constructor(size, InputManager, Actuator, StorageManager) {
        this.size = size;
        this.inputManager = new InputManager;
        this.storageManager = new StorageManager;
        this.actuator = new Actuator;

        this.startTiles = 1;

        this.inputManager.on("move", this.move.bind(this));
        this.inputManager.on("restart", this.restart.bind(this));

        this.setup()
    }

    restart() {
        this.storageManager.clearGameState();
        this.setup();
    }

    isGameTerminated() {
        return this.over || this.won;
    }

    setup() {
        let previousState = this.storageManager.getGameState();

        if (previousState) {
            this.grid = new Grid(previousState.grid.size, previousState.grid.cells);
            this.score = previousState.score;
            this.over = previousState.over;
            this.won = previousState.won;
        } else {
            this.grid = new Grid(this.size);
            this.score = 0;
            this.over = false;
            this.won = false;

            this.addStartTiles();
        }

        this.actuate();
    }

    addStartTiles() {
        for (let i = 0; i < this.startTiles; i++) {
            this.addRandomTile();
        }
    }

    addRandomTile() {
        if (this.grid.cellsAvailable()) {
            let value = Math.random() < 0.9 ? 2 : 4;
            let tile = new Tile(this.grid.randomAvailableCell(), value);

            this.grid.insertTile(tile);
        }
    }

    actuate() {
        if (this.over) {
            this.storageManager.clearGameState();
        } else {
            this.storageManager.setGameState(this.serialize());
        }

        this.actuator.actuate(this.grid, {
            score: this.score,
            over: this.over,
            won: this.won,
            terminated: this.isGameTerminated()
        })
    }

    serialize() {
        return {
            grid: this.grid.serialize(),
            score: this.score,
            over: this.over,
            won: this.won
        }
    }

    prepareTiles() {
        this.grid.eachCell(function (x, y, tile) {
            if (tile) {
                tile.mergedFrom = null;
                tile.merged = false;
                tile.savePosition();
            }
        })
    }

    moveTile(tile, cell) {
        this.grid.cells[tile.y][tile.x] = null;
        this.grid.cells[cell.y][cell.x] = tile;
        tile.updatePosition(cell);
    }

    move(direction) {
        // 0: up, 1: right, 2: down, 3: left
        let self = this;

        if (this.isGameTerminated()) return;

        let cell, tile;

        let vector = this.getVector(direction);
        let traversals = this.buildTraversals(vector);
        let moved = false;

        this.prepareTiles();

        traversals.y.forEach(function (y) {
            traversals.x.forEach(function (x) {
                cell = {x: x, y: y};
                tile = self.grid.cellContent(cell);

                if (tile) {
                    let positions = self.findFarthestPosition(cell, vector);
                    let next = self.grid.cellContent(positions.next);

                    if (next && next.value === tile.value && !next.merged) {
                        let merged = new Tile(positions.next, tile.value * 2);
                        merged.mergedFrom = [tile, next];

                        self.grid.insertTile(merged);
                        self.grid.removeTile(tile);

                        tile.updatePosition(positions.next);

                        self.score += merged.value;

                        if (merged.value === 2048) self.won = true;
                    } else {
                        self.moveTile(tile, positions.farthest);
                    }

                    if (!self.positionsEqual(cell, tile)) {
                        moved = true;
                    }
                }
            });
        });

        if (moved) {
            this.addRandomTile();

            if (!this.movesAvailable()) {
                this.over = true;
            }

            this.actuate();
        }
    }

    getVector(direction) {
        let map = {
            0: {x: 0, y: -1}, // Up
            1: {x: 1, y: 0},  // Right
            2: {x: 0, y: 1},  // Down
            3: {x: -1, y: 0}   // Left
        };

        return map[direction];
    }

    buildTraversals(vector) {
        let traversals = {x: [], y: []};

        for (let pos = 0; pos < this.size; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }

        if (vector.x === 1) traversals.x = traversals.x.reverse();
        if (vector.y === 1) traversals.y = traversals.y.reverse();

        return traversals;
    }

    findFarthestPosition(cell, vector) {
        let previous;

        do {
            previous = cell;
            cell = {x: previous.x + vector.x, y: previous.y + vector.y};
        } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

        return {
            farthest: previous,
            next: cell
        }
    }

    movesAvailable() {
        return this.grid.cellsAvailable() || this.tileMatchesAvailable();
    }

    tileMatchesAvailable() {
        let self = this;

        let tile;

        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                tile = this.grid.cellContent({x: x, y: y});

                if (tile) {
                    for (let direction = 0; direction < 4; direction++) {
                        let vector = self.getVector(direction);
                        let cell = {x: x + vector.x, y: y + vector.y};

                        let other = self.grid.cellContent(cell);

                        if (other && other.value === tile.value) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    positionsEqual(first, second) {
        return first.x === second.x && first.y === second.y;
    }
}