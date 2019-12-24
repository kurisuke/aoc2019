import { readFile } from "fs";

type Grid = string[][];

type Grids = { [id: number]: Grid };

const GRID_SIZE = 5;

function countNeighbors(grid: Grid, y: number, x: number) {
    const neighbors = [[y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]];
    let cnt = 0;
    for (const [yn, xn] of neighbors) {
        if (grid[yn] === undefined || grid[yn][xn] === undefined) {
            continue;
        } else {
            if (grid[yn][xn] === "#") {
                cnt++;
            }
        }
    }
    return cnt;
}

function evolve(grid: Grid) {
    const newGrid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        const newGridRow = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            const cnt = countNeighbors(grid, y, x);
            if (grid[y][x] === "#") {
                if (cnt === 1) {
                    newGridRow.push("#");
                } else {
                    newGridRow.push(".");
                }
            } else if (grid[y][x] === ".") {
                if (cnt === 1 || cnt === 2) {
                    newGridRow.push("#");
                } else {
                    newGridRow.push(".");
                }
            } else {
                throw Error("Unexpected value in grid: " + grid[y][x]);
            }
        }
        newGrid.push(newGridRow);
    }
    return newGrid;
}

function countNeighbors2(grid: Grid, gridAbove: Grid, gridBelow: Grid, y: number, x: number) {
    const neighborCoords = [[y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]];
    const neighbors = [];
    let cnt = 0;

    for (const [yn, xn] of neighborCoords) {
        // from grid above
        if (yn === -1) {
            neighbors.push(gridAbove[1][2]);
        } else if (yn === GRID_SIZE) {
            neighbors.push(gridAbove[3][2]);
        }

        if (xn === -1) {
            neighbors.push(gridAbove[2][1]);
        } else if (xn === GRID_SIZE) {
            neighbors.push(gridAbove[2][3]);
        }

        // from grid below
        if (y === 1 && x === 2 && yn === 2 && xn === 2) {
            neighbors.push(gridBelow[0][0]);
            neighbors.push(gridBelow[0][1]);
            neighbors.push(gridBelow[0][2]);
            neighbors.push(gridBelow[0][3]);
            neighbors.push(gridBelow[0][4]);
            continue;
        }
        if (y === 3 && x === 2 && yn === 2 && xn === 2) {
            neighbors.push(gridBelow[4][0]);
            neighbors.push(gridBelow[4][1]);
            neighbors.push(gridBelow[4][2]);
            neighbors.push(gridBelow[4][3]);
            neighbors.push(gridBelow[4][4]);
            continue;
        }
        if (y === 2 && x === 1 && yn === 2 && xn === 2) {
            neighbors.push(gridBelow[0][0]);
            neighbors.push(gridBelow[1][0]);
            neighbors.push(gridBelow[2][0]);
            neighbors.push(gridBelow[3][0]);
            neighbors.push(gridBelow[4][0]);
            continue;
        }
        if (y === 2 && x === 3 && yn === 2 && xn === 2) {
            neighbors.push(gridBelow[0][4]);
            neighbors.push(gridBelow[1][4]);
            neighbors.push(gridBelow[2][4]);
            neighbors.push(gridBelow[3][4]);
            neighbors.push(gridBelow[4][4]);
            continue;
        }

        if (grid[yn] !== undefined && grid[yn][xn] !== undefined) {
            neighbors.push(grid[yn][xn]);
        }
    }

    // console.log("field x:", x, "y:", y, "has", neighbors.length, "neighbors");

    for (const c of neighbors) {
        if (c === "#") {
            cnt++;
        }
    }
    return cnt;
}

function evolve2(grid: Grid, gridAbove: Grid, gridBelow: Grid) {
    const newGrid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        const newGridRow = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            if (y === 2 && x === 2) {
                newGridRow.push("?");
                continue;
            }

            const cnt = countNeighbors2(grid, gridAbove, gridBelow, y, x);
            if (grid[y][x] === "#") {
                if (cnt === 1) {
                    newGridRow.push("#");
                } else {
                    newGridRow.push(".");
                }
            } else if (grid[y][x] === ".") {
                if (cnt === 1 || cnt === 2) {
                    newGridRow.push("#");
                } else {
                    newGridRow.push(".");
                }
            } else {
                throw Error("Unexpected value in grid: " + grid[y][x] + "at y:" + y + " x:" + x);
            }
        }
        newGrid.push(newGridRow);
    }
    return newGrid;
}

function evolveAll(grids: Grids) {
    const iter = Math.ceil(Object.keys(grids).length / 2);
    const newGrids: Grids = {};

    for (let i = -iter; i <= iter; i++) {
        const grid = grids[i] === undefined ? emptyGrid() : grids[i];
        const gridAbove = grids[i - 1] === undefined ? emptyGrid() : grids[i - 1]!;
        const gridBelow = grids[i + 1] === undefined ? emptyGrid() : grids[i + 1]!;

        const newGrid = evolve2(grid, gridAbove, gridBelow);
        newGrids[i] = newGrid;
    }

    return newGrids;
}

function emptyGrid() {
    const grid: Grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        const tmp = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            tmp.push(".");
        }
        grid.push(tmp);
    }
    return grid;
}

function gridHash(grid: Grid) {
    let hash = 0;
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const exp = 1 << (y * GRID_SIZE + x);
            hash += exp * (grid[y][x] === "#" ? 1 : 0);
        }
    }
    return hash;
}

function printGrid(grid: Grid) {
    grid.forEach((line) => console.log(line.join("")));
    console.log();
}

function printAllGrids(grids: Grids) {
    const iter = Math.floor(Object.keys(grids).length / 2);
    for (let i = -iter; i <= iter; i++) {
        console.log(i);
        printGrid(grids[i]);
    }
}

function countBugs(grids: Grids) {
    let cnt = 0;
    for (const grid of Object.values(grids)) {
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (grid[y][x] === "#") {
                    cnt++;
                }
            }
        }
    }
    return cnt;
}

readFile("day24.input", "utf8", (_, data) => {
    const grid: Grid = [];

    // read input into grid
    for (const line of data.toString().split("\n")) {
        const tmp = [];
        for (const c of line.split("")) {
            tmp.push(c);
        }
        grid.push(tmp);
    }

    // part 1
    // const gridHashes: Set<number> = new Set();
    // while (true) {
    //     const hash = gridHash(grid);
    //     if (gridHashes.has(hash)) {
    //         printGrid(grid);
    //         console.log(hash);
    //         break;
    //     }
    //     gridHashes.add(hash);
    //     grid = evolve(grid);
    // }

    // part 2
    let grids: Grids = {};
    grids[0] = grid;
    for (let i = 0; i < 200; i++) {
        grids = evolveAll(grids);
    }
    console.log(countBugs(grids));
});
