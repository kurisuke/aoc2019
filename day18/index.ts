import { readFile } from "fs";

type Grid = string[][];
type Coords = { x: number, y: number };

type FoundKeys = {
    id: string,
    pos: Coords,
    distance: number,
};

type ScoreCache = { [id: string]: number };

type GlobalState = {
    grid: Grid,
    cache: ScoreCache,
    keysMax: number,
};

function cacheStr(pos: Coords, keysHeld: string[]) {
    return String(pos.x) + "," + String(pos.y) + "," + keysHeld.sort().join("");
}

function cs(c: Coords) {
    return String(c.x) + "," + String(c.y);
}

function sc(s: string): Coords {
    return {
        x: Number(s.split(",")[0]!),
        y: Number(s.split(",")[1]!),
    };
}

function reachableKeys(grid: Grid, initPos: Coords, keysHeld: string[]) {
    const visited: Set<string> = new Set();
    let frontier: Set<string> = new Set();
    frontier.add(cs(initPos));
    let distance = 0;

    const foundKeys: FoundKeys[] = [];

    while (true) {
        distance++;
        const frontierNew: Set<string> = new Set();

        for (const posStr of Array.from(frontier.values())) {
            const pos = sc(posStr);

            // check neighbors (NSEW) in order
            const neighbors: Coords[] =
                [{ x: pos.x - 1, y: pos.y },
                { x: pos.x + 1, y: pos.y },
                { x: pos.x, y: pos.y - 1 },
                { x: pos.x, y: pos.y + 1 }];

            for (const neighbor of neighbors) {
                // check if not visited yet
                if (frontier.has(cs(neighbor)) || visited.has(cs(neighbor))) {
                    continue;
                }

                // edge of the grid
                if (grid[neighbor.y] === undefined || grid[neighbor.y][neighbor.x] === undefined) {
                    continue;
                }

                const gridVal = grid[neighbor.y][neighbor.x];
                if (gridVal === "." || gridVal === "@") {
                    // yes we can move
                    frontierNew.add(cs(neighbor));
                } else if (gridVal.charCodeAt(0) >= 0x61 && gridVal.charCodeAt(0) <= 0x7a) { // is a key
                    frontierNew.add(cs(neighbor));
                    if (keysHeld.indexOf(gridVal) === -1) { // don't add keys we already have
                        foundKeys.push({ id: gridVal, pos: neighbor, distance });
                    }
                } else if (gridVal.charCodeAt(0) >= 0x41 && gridVal.charCodeAt(0) <= 0x5a) { // is a door
                    // console.log("found door:", gridVal, "keysHeld:" + keysHeld.sort().join(""));
                    if (keysHeld.indexOf(gridVal.toLowerCase()) >= 0) { // move if we have the matching key
                        // console.log("opened door");
                        frontierNew.add(cs(neighbor));
                    }
                }
            }
        }

        if (frontierNew.size === 0) { // nothing new to check, exhausted
            break;
        } else {
            frontier.forEach((el) => visited.add(el));
            frontier = frontierNew;
        }
    }

    return foundKeys;
}

function score(state: GlobalState, pos: Coords, keysHeld: string[]): number {
    if (keysHeld.length === state.keysMax) {
        // console.log(cacheStr(pos, keysHeld), 0);
        return 0; // all keys found, valid path
    }

    const nextKeys = reachableKeys(state.grid, pos, keysHeld);
    if (nextKeys.length === 0) {
        // console.log(cacheStr(pos, keysHeld), Infinity);
        return Infinity; // dead end
    }

    const nextScores = nextKeys.map((nextKey) => {
        const keysHeldNew = [...keysHeld, nextKey.id];
        const cacheKey = cacheStr(nextKey.pos, keysHeldNew);
        if (state.cache[cacheKey] !== undefined) {
            // console.log(cacheStr(pos, keysHeld), nextKey.distance + state.cache[cacheKey]);
            return nextKey.distance + state.cache[cacheKey];
        } else {
            const cacheVal = score(state, nextKey.pos, keysHeldNew);
            state.cache[cacheKey] = cacheVal;
            // console.log(cacheStr(pos, keysHeld), nextKey.distance + cacheVal);
            return nextKey.distance + cacheVal;
        }
    });
    const minVal = nextScores.reduce((a, i) => i < a ? i : a, Infinity);
    return minVal;
}

function findStart(grid: Grid): Coords | undefined {
    const [xLen, yLen] = [grid[0]!.length, grid.length];
    // console.log(xLen, yLen);

    for (let x = 0; x < xLen; x++) {
        for (let y = 0; y < yLen; y++) {
            if (grid[y][x] === "@") {
                return { x, y };
            }
        }
    }
}

function findNumKeys(grid: Grid) {
    const [xLen, yLen] = [grid[0]!.length, grid.length];
    // console.log(xLen, yLen);

    let numKeys = 0;

    for (let x = 0; x < xLen; x++) {
        for (let y = 0; y < yLen; y++) {
            if (/^[a-z]$/.test(grid[y][x])) {
                numKeys++;
            }
        }
    }

    return numKeys;
}

readFile("day18.test2", "utf8", (_, data) => {
    // read input into grid[y][x]
    const grid: Grid = [];
    for (const line of data.split("\n")) {
        const tmp = [];
        for (const c of line.split("")) {
            tmp.push(c);
        }
        grid.push(tmp);
    }

    const state: GlobalState = {
        cache: {},
        grid,
        keysMax: findNumKeys(grid),
    };

    // console.log(reachableKeys(grid, findStart(grid)!, []));
    console.log(score(state, findStart(grid)!, []));
    // console.log(state.cache);
});
