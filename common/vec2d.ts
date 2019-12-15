export { Vec2D };

class Vec2D {
    private _x: number;
    private _y: number;

    constructor(x: number | string, y: number = 0) {
        if (typeof x === "number") {
            this._x = x;
            this._y = y;
        } else {
            this._x = Number(x.split(",")[0]);
            this._y = Number(x.split(",")[1]);
        }
    }

    public get x() {
        return this._x;
    }

    public get y() {
        return this._y;
    }

    public asStr() {
        return String(this._x) + "," + String(this._y);
    }

    public asObj() {
        return {x: this._x, y: this._y};
    }

    public asTup() {
        const r: [number, number] = [this._x, this._y];
        return r;
    }

    public add(other: Vec2D) {
        this._x += other.x;
        this._y += other.y;
    }
}
