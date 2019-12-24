import { readFile } from "fs";

type Grid = string[][];

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

readFile("day24.input", "utf8", (_, data) => {
    let grid: Grid = [];

    // read input into grid
    for (const line of data.toString().split("\n")) {
        const tmp = [];
        for (const c of line.split("")) {
            tmp.push(c);
        }
        grid.push(tmp);
    }

    // part 1
    const gridHashes: Set<number> = new Set();
    while (true) {
        const hash = gridHash(grid);
        if (gridHashes.has(hash)) {
            printGrid(grid);
            console.log(hash);
            break;
        }
        gridHashes.add(hash);
        grid = evolve(grid);
    }
});
