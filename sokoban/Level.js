class Level {
    _map;
    get map() {
        return this._map;
    }
    set map(value) {
        this._map = value;
    }
    constructor(map) {
        this._map = map;
    }
}

export default Level