export { Vec3D };

class Vec3D {
    private _x: number;
    private _y: number;
    private _z: number;

    constructor(x: number, y: number, z: number) {
        this._x = x;
        this._y = y;
        this._z = z;
    }

    public get x() {
        return this._x;
    }

    public set x(x: number) {
        this._x = x;
    }

    public get y() {
        return this._y;
    }

    public set y(y: number) {
        this._y = y;
    }

    public get z() {
        return this._z;
    }

    public set z(z: number) {
        this._z = z;
    }

    public set(x: number, y: number, z: number) {
        this._x = x;
        this._y = y;
        this._z = z;
    }

    public asStr() {
        return String(this._x) + "," + String(this._y) + "," + String(this._z);
    }

    public asObj() {
        return {x: this._x, y: this._y, z: this._z};
    }

    public asTup() {
        const r: [number, number, number] = [this._x, this._y, this._z];
        return r;
    }

    public add(other: Vec3D) {
        this._x += other.x;
        this._y += other.y;
        this._z += other.z;
    }
}
