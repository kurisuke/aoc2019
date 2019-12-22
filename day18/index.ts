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
    allKeys: string,
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

function reachableKeys(grid: Grid, initPos: Coords, keysHeld: string[], keysMax: number) {
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
                        if (foundKeys.length === keysMax) {
                            return foundKeys;
                        }
                    }
                } else if (gridVal.charCodeAt(0) >= 0x41 && gridVal.charCodeAt(0) <= 0x5a) { // is a door
                    if (keysHeld.indexOf(gridVal.toLowerCase()) >= 0) { // move if we have the matching key
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
    if (keysHeld.length === state.allKeys.length) {
        return 0; // all keys found, valid path
    }

    const nextKeys = reachableKeys(state.grid, pos, keysHeld, state.allKeys.length - keysHeld.length);

    if (nextKeys.length === 0) {
        return Infinity; // dead end
    }

    const nextScores = nextKeys.map((nextKey) => {
        const keysHeldNew = [...keysHeld, nextKey.id];
        const cacheKey = cacheStr(nextKey.pos, keysHeldNew);
        if (state.cache[cacheKey] !== undefined) {
            return nextKey.distance + state.cache[cacheKey];
        } else {
            const cacheVal = score(state, nextKey.pos, keysHeldNew);
            state.cache[cacheKey] = cacheVal;
            return nextKey.distance + cacheVal;
        }
    });
    const minVal = nextScores.reduce((a, i) => i < a ? i : a, Infinity);
    return minVal;
}

function findStart(grid: Grid): Coords | undefined {
    const [xLen, yLen] = [grid[0]!.length, grid.length];
    for (let x = 0; x < xLen; x++) {
        for (let y = 0; y < yLen; y++) {
            if (grid[y][x] === "@") {
                return { x, y };
            }
        }
    }
}

function findAllKeys(grid: Grid) {
    const [xLen, yLen] = [grid[0]!.length, grid.length];
    let keys = "";
    for (let x = 0; x < xLen; x++) {
        for (let y = 0; y < yLen; y++) {
            if (/^[a-z]$/.test(grid[y][x])) {
                keys += grid[y][x];
            }
        }
    }
    return keys;
}

function splitMap(grid: Grid) {
    const startPos = findStart(grid)!;

    grid[startPos.x][startPos.y] = "#";
    grid[startPos.y - 1][startPos.x] = "#";
    grid[startPos.y + 1][startPos.x] = "#";
    grid[startPos.y][startPos.x - 1] = "#";
    grid[startPos.y][startPos.x + 1] = "#";

    grid[startPos.y - 1][startPos.x - 1] = "@";
    grid[startPos.y + 1][startPos.x - 1] = "@";
    grid[startPos.y - 1][startPos.x + 1] = "@";
    grid[startPos.y + 1][startPos.x + 1] = "@";

    const sectorTopLeft = [{ x: 0, y: 0 }, { x: startPos.x, y: 0 }, { x: 0, y: startPos.y }, { x: startPos.x, y: startPos.y }];
    const splitMaps = sectorTopLeft.map((tlCoord) => {
        const newGrid: Grid = [];
        for (let y = tlCoord.y; y <= tlCoord.y + startPos.y; y++) {
            const tmp = [];
            for (let x = tlCoord.x; x <= tlCoord.x + startPos.x; x++) {
                tmp.push(grid[y][x]);
            }
            newGrid.push(tmp);
        }
        return newGrid;
    });

    return splitMaps;
}

readFile("day18.input", "utf8", (_, data) => {
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
        allKeys: findAllKeys(grid),
        cache: {},
        grid,
    };

    // part 1
    // console.log(score(state, findStart(grid)!, []));

    // part 2
    const splitMaps = splitMap(grid);

    const subSteps = [];

    for (const subGrid of splitMaps) {
        const thisFieldKeys = findAllKeys(subGrid);
        const otherFieldKeys = state.allKeys.split("").reduce((s, c) => thisFieldKeys.indexOf(c) === -1 ? s + c : s, "");

        const subState: GlobalState = {
            allKeys: state.allKeys,
            cache: {},
            grid: subGrid,
        };

        subSteps.push(score(subState, findStart(subGrid)!, otherFieldKeys.split("")));
    }

    console.log(subSteps);
    console.log(subSteps.reduce((a, i) => a + i, 0));
});
