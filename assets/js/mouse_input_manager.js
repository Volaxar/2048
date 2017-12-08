export default class MouseInputManager {
    constructor() {
        this.events = {};
        self = this;

        this.listen();
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(callback);
    }

    emit(event, data) {
        let callbacks = this.events[event];

        if (callbacks) {
            callbacks.forEach(function (callback) {
                callback(data);
            });
        }
    }

    listen() {

        $('#restart').click(self.restart);

        let touchStartClientX, touchStartClientY;
        let gameContainer = $('#playfield');

        gameContainer.mousedown(function (event) {
            touchStartClientX = event.pageX;
            touchStartClientY = event.pageY;
        });

        gameContainer.mouseup(function (event) {
            let touchEndClientX, touchEndClientY;

            touchEndClientX = event.pageX;
            touchEndClientY = event.pageY;

            let dx = touchEndClientX - touchStartClientX;
            let absDx = Math.abs(dx);

            let dy = touchEndClientY - touchStartClientY;
            let absDy = Math.abs(dy);

            if (Math.max(absDx, absDy) > 10) {
                // (right : left) : (down : up)
                self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
            }
        });
    }

    restart() {
        self.emit("restart");
    };

}