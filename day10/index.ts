import { readFile } from "fs";

function gcd(a: number, b: number) {
    while (b !== 0) {
        const h = a % b;
        a = b;
        b = h;
    }
    return a;
}

function reducedVec(v: [number, number]) {
    const g = gcd(Math.abs(v[0]), Math.abs(v[1]));
    const vr: [number, number] =  [v[0] / g, v[1] / g];
    return vr;
}

function allVecs(dims: [number, number], pos: [number, number]) {
    const vecs: Set<string> = new Set();
    for (let x = 0; x < dims[0]; x++) {
        for (let y = 0; y < dims[1]; y++) {
            const v: [number, number] = [x - pos[0], y - pos[1]];
            if (v[0] === 0 && v[1] === 0) {
                continue;
            }
            const vr = reducedVec(v);
            vecs.add(String(vr[0]) + "," + String(vr[1]));
        }
    }
    // console.log(pos);
    // console.log(vecs);
    return vecs;
}

function hit(grid: string[][], pos: [number, number], vec: [number, number]) {
    let phit: [number, number] = [pos[0] + vec[0], pos[1] + vec[1]];
    while (grid[phit[0]] !== undefined && grid[phit[0]][phit[1]] !== undefined) {
        if (grid[phit[0]][phit[1]] === "#") { // asteroid hit
            return [phit[0], phit[1]];
        }
        phit = [phit[0] + vec[0], phit[1] + vec[1]];
    }
    return null;
}

function vecDir(vec: [number, number]) {
    const angle = Math.atan2(vec[1], vec[0]);   // radians
    const degrees = 180 * angle / Math.PI;  // degrees
    return (degrees + 450) % 360;
}

readFile("day10.input", "utf8", (error, data) => {
    const lines = data.split("\n");

    // grid as read from file. lines = y coordinate, cols = x coordinate
    const gridT = lines.map((l) => l.split(""));

    // transpose for easier handling, so we can address grid[x][y]
    const grid = gridT[0].map((col, i) => gridT.map((row) => row[i]));
    const dims: [number, number] = [grid[0].length, grid.length];

    // for each map position p{x,y}:
    //   - calculate all line vectors from point p to all other points
    //   - reduce vectors to set of directions
    //   - for each direction in set:
    //     - add & iterate until the borders of the map (0) or an asteroid is hit (1)
    //   - store the sum of hits (1)
    // find the position with the most hits

    let maxHits = 0;
    let maxPos: [number, number] = [0, 0];

    for (let x = 0; x < dims[0]; x++) {
        for (let y = 0; y < dims[1]; y++) {
            const pos: [number, number] = [x, y];
            if (grid[x][y] === ".") { // skip; only asteroids are candidates
                continue;
            }
            let hits = 0;
            const vecs: Set<string> = allVecs(dims, pos);
            vecs.forEach((vs) => {
                const vec: [number, number] = [Number(vs.split(",")[0]), Number(vs.split(",")[1])];
                hits += hit(grid, pos, vec) ? 1 : 0;
            });
            if (hits > maxHits) {
                maxHits = hits;
                maxPos = [x, y];
            }
        }
    }

    console.log(maxHits, maxPos);

    /// part 2
    /// order the vectors by angle from y-axis
    const ordVecs = Array.from(allVecs(dims, maxPos));
    ordVecs.sort((a, b) => {
        const vecA: [number, number] = [Number(a.split(",")[0]), Number(a.split(",")[1])];
        const vecB: [number, number] = [Number(b.split(",")[0]), Number(b.split(",")[1])];
        if (vecDir(vecA) < vecDir(vecB)) {
            return -1;
        }
        if (vecDir(vecA) > vecDir(vecB)) {
            return 1;
        }
        return 0;
    });

    let zapped = 0; // count the asteroids zapped
    let idx = 0;
    while (true) {
        const vs = ordVecs[idx];
        const vec: [number, number] = [Number(vs.split(",")[0]), Number(vs.split(",")[1])];
        const hp = hit(grid, maxPos, vec);
        if (hp) {
            zapped++;
            grid[hp[0]][hp[1]] = ".";
            if (zapped === 200) {
                console.log(zapped, hp[0] * 100 + hp[1]);
                break;
            }
        }
        idx += 1;
        idx %= ordVecs.length;
    }
});
