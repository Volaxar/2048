export default class HtmlActuator {
    constructor() {
        this.tileContainer = $('#playfield');
        this.scoreContainer = $('#score');
        this.messageContainer = $('#message');

        this.score = 0;
    }

    actuate(grid, metadata) {
        let self = this;

        window.requestAnimationFrame(function () {
            self.tileContainer.empty();

            grid.cells.forEach(function (rows) {
                rows.forEach(function (cell) {
                    if (cell) {
                        self.addTile(cell);
                    }
                });
            });

            self.scoreContainer.text(metadata.score);

            if (metadata.terminated) {
                if (metadata.over) {
                    self.message(false);
                } else if (metadata.won) {
                    self.message(true);
                }
            } else {
                self.messageContainer.text('');
            }
        });
    }

    addTile(tile) {

        let self = this;

        let blank = $('<div>');
        let position = tile.previousPosition || {x: tile.x, y: tile.y};

        blank.addClass(`thing t${tile.value} t-pos-${position.x}-${position.y}`);

        if (tile.previousPosition) {
            window.requestAnimationFrame(function () {
                blank.removeClass(`t-pos-${position.x}-${position.y}`);
                blank.addClass(`t-pos-${tile.x}-${tile.y}`);
            });
        } else if (tile.mergedFrom) {
            blank.addClass(`tile-merged`);

            tile.mergedFrom.forEach(function (merged) {
                self.addTile(merged);
            });
        } else {
            blank.addClass(`tile-new`);
        }

        this.tileContainer.append(blank)
    };

    message(won) {
        let message = won ? "Вы выиграли!" : "Игра окончена!";
        this.messageContainer.text(message);
    };

}