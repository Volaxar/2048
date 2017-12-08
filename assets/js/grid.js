import Tile from './tile'

export default class Grid {
    constructor(size, previousState) {
        this.size = size;
        this.cells = previousState ? this.fromState(previousState) : this.empty();
    }

    empty() {
        let cells = [];

        for (let y = 0; y < this.size; y++) {
            let row = cells[y] = [];

            for (let x = 0; x < this.size; x++) {
                row.push(null);
            }
        }

        return cells;
    }

    fromState(state) {
        let cells = [];

        for (let y = 0; y < this.size; y++) {
            let row = cells[y] = [];

            for (let x = 0; x < this.size; x++) {
                let tile = state[x][y];

                row.push(tile ? new Tile(tile.position, tile.value) : null);
            }
        }

        return cells;
    }

    randomAvailableCell() {
        let cells = this.availableCells();

        if (cells.length) {
            return cells[Math.floor(Math.random() * cells.length)];
        }
    }

    availableCells() {
        let cells = [];

        this.eachCell(function (x, y, tile) {
            if (!tile) {
                cells.push({x: x, y: y});
            }
        });

        return cells;
    }

    eachCell(callback) {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                callback(x, y, this.cells[y][x]);
            }
        }
    }

    cellsAvailable() {
        return !!this.availableCells().length;
    }

    cellAvailable(cell) {
        return !this.cellOccupied(cell);
    }

    cellOccupied(cell) {
        return !!this.cellContent(cell);
    }

    cellContent(cell) {
        if (this.withinBounds(cell)) {
            return this.cells[cell.y][cell.x];
        } else {
            return null;
        }
    }

    insertTile(tile) {
        this.cells[tile.y][tile.x] = tile;
    }

    removeTile(tile) {
        this.cells[tile.y][tile.x] = null;
    }

    withinBounds(position) {
        return position.x >= 0 && position.x < this.size &&
            position.y >= 0 && position.y < this.size;
    }

    serialize() {
        let cellState = [];

        for (let y = 0; y < this.size; y++) {
            let row = cellState[y] = [];

            for (let x = 0; x < this.size; x++) {
                row.push(this.cells[y][x] ? this.cells[y][x].serialize() : null);
            }
        }

        return {
            size: this.size,
            cells: cellState
        };
    }
}

