window.fakeStorage = {
    _data: {},

    setItem(id, val) {
        return this._data[id] = String(val);
    },

    getItem(id) {
        return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
    },

    removeItem(id) {
        return delete this._data[id];
    },

    clear() {
        return this._data = {};
    }
};

export default class LocalStorageManager {
    constructor() {
        this.gameStateKey = "gameState";

        let supported = LocalStorageManager.localStorageSupported();
        this.storage = supported ? window.localStorage : window.fakeStorage;
    }

    static localStorageSupported() {
        let testKey = "test";
        let storage = window.localStorage;

        try {
            storage.setItem(testKey, "1");
            storage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    getGameState() {
        let stateJSON = this.storage.getItem(this.gameStateKey);
        return stateJSON ? JSON.parse(stateJSON) : null;
    }

    setGameState(gameState) {
        this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
    }

    clearGameState() {
        this.storage.removeItem(this.gameStateKey);
    }
}