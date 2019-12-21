import { readFile } from "fs";

import { Intcode } from "../common/intcode";

function part1(intcodeProg: bigint[]) {
    const computer = new Intcode(intcodeProg);

    computer.run();
    let progOut = "";
    while (true) {
        const tmp = computer.readOutp();
        if (tmp === undefined) {
            break;
        }
        progOut += String.fromCharCode(Number(tmp));
    }

    const grid: string[][] = [];
    let tmpRow: string[] = [];
    for (const c of progOut) {
        if (c === "\n") {
            grid.push(tmpRow);
            tmpRow = [];
        } else {
            tmpRow.push(c);
        }
    }

    // pop last row (empty after newline)
    if (grid[grid.length - 1]!.length === 0) {
        grid.pop();
    }
    const [xMax, yMax] = [grid[0]!.length, grid.length];
    let acc = 0;
    for (let x = 1; x < xMax - 1; x++) {
        for (let y = 1; y < yMax - 1; y++) {
            if ((grid[y]![x]! === "#") &&
                (grid[y - 1]![x]! === "#") && (grid[y + 1]![x]! === "#") &&
                (grid[y]![x - 1]! === "#") && (grid[y]![x + 1]! === "#")) {
                // intersection point
                acc += x * y;
            }
        }
    }
    console.log(acc);

    return grid;
}

function printGrid(grid: string[][]) {
    const [xMax, yMax] = [grid[0]!.length, grid.length];

    for (let y = 0; y < yMax; y++) {
        let tmp = "";
        for (let x = 0; x < xMax; x++) {
            tmp += grid[y][x];
        }
        console.log(tmp);
    }
}

function findRobot(grid: string[][]): [number, number, string] {
    const [xMax, yMax] = [grid[0]!.length, grid.length];

    let orient = "";
    let [xInit, yInit] = [-1, -1];
    for (let x = 0; x < xMax; x++) {
        for (let y = 0; y < yMax; y++) {
            if (grid[y][x] === "v" || grid[y][x] === "^" ||
                grid[y][x] === "<" || grid[y][x] === ">") {
                orient = grid[y][x];
                [xInit, yInit] = [x, y];
                break;
            }
        }
        if (orient.length > 0) {
            break;
        }
    }

    if (orient.length === 0) {
        printGrid(grid);
        throw Error("Robot not found!");
    }
    return [xInit, yInit, orient];
}

function doMove(grid: string[][]) {
    const [xr, yr, orient] = findRobot(grid);

    // check if move in current direction is possible
    let [xnew, ynew] = [xr, yr];
    let steps = 0;
    while (true) {
        const [xlast, ylast] = [xnew, ynew];
        switch (orient) {
            case ">": { // east
                xnew += 1;
                break;
            }
            case "<": { // west
                xnew -= 1;
                break;
            }
            case "^": { // north
                ynew -= 1;
                break;
            }
            case "v": { // south
                ynew += 1;
                break;
            }
            default: {
                throw Error("Robot not found");
            }
        }
        if (grid[ynew] !== undefined && grid[ynew][xnew] !== undefined &&
            (grid[ynew][xnew] === "#" || grid[ynew][xnew] === "X")) { // its also okay to travel over already visited fields
            // move possible, add step
            steps++;
            grid[ylast][xlast] = "X"; // visited
            grid[ynew][xnew] = orient;
        } else {
            // moving no longer possible
            break;
        }
    }
    return steps;
}

function doTurn(grid: string[][]) {
    const [xr, yr, orient] = findRobot(grid);

    const dirs = ["<", "^", ">", "v"];

    for (const dirOff of [1, 3]) {
        const newOrient = dirs[(dirs.indexOf(orient) + dirOff) % dirs.length]!;
        let [xnew, ynew] = [xr, yr];
        switch (newOrient) {
            case ">": { // east
                xnew += 1;
                break;
            }
            case "<": { // west
                xnew -= 1;
                break;
            }
            case "^": { // north
                ynew -= 1;
                break;
            }
            case "v": { // south
                ynew += 1;
                break;
            }
            default: {
                throw Error("Robot not found");
            }
        }
        if (grid[ynew] !== undefined && grid[ynew][xnew] !== undefined && grid[ynew][xnew] === "#") {
            // turn possible
            grid[yr][xr] = newOrient;
            return dirOff === 1 ? "R" : "L";
        }
    }

    return "";
}

function nextMove(grid: string[][]) {
    const steps = doMove(grid);
    if (steps > 0) {
        return String(steps);
    } else {
        return doTurn(grid);
    }
}

function hasUnvisited(grid: string[][]) {
    const [xMax, yMax] = [grid[0]!.length, grid.length];
    for (let x = 0; x < xMax; x++) {
        for (let y = 0; y < yMax; y++) {
            if (grid[y][x] === "#") {
                return true;
            }
        }
    }
    return false;
}

function getMovements(grid: string[][]) {
    printGrid(grid);

    const cmdList: string[] = [];
    while (hasUnvisited(grid)) {
        const m = nextMove(grid);
        if (m.length === 0) {
            console.log(cmdList.join(","));
            throw Error("No direction left to turn");
        } else {
            cmdList.push(m);
        }
    }

    return cmdList.join(",");
}

function feedProgram(computer: Intcode, prog: string) {
    for (const c of prog) {
        computer.writeInp(BigInt(c.charCodeAt(0)));
    }
    computer.writeInp(10n); // newline
}

function part2(intcodeProg: bigint[], grid: string[][]) {
    const movements = getMovements(grid);

    // manual partitioning for the input, as I could not be bothered
    // to code a general solution
    const main = "A,B,B,C,B,C,B,C,A,A";
    const progA = "L,6,R,8,L,4,R,8,L,12";
    const progB = "L,12,R,10,L,4";
    const progC = "L,12,L,6,L,4,L,4";

    const expansion = main.replace(/A/g, progA).replace(/B/g, progB).replace(/C/g, progC);

    if (expansion === movements) {
        const intcodeMod = [...intcodeProg];
        intcodeMod[0] = 2n; // modify program
        const computer = new Intcode(intcodeMod);
        feedProgram(computer, main);
        feedProgram(computer, progA);
        feedProgram(computer, progB);
        feedProgram(computer, progC);

        computer.writeInp(110n); // n
        computer.writeInp(10n); // newline

        computer.run();

        const outp: bigint[] = [];
        while (true) {
            const tmp = computer.readOutp();
            if (tmp !== undefined) {
                outp.push(tmp);
            } else {
                break;
            }
        }
        // print the final value
        console.log(outp.pop());
    } else {
        throw Error("Expansion not valid for input movements!");
    }
}

readFile("day17.input", "utf8", (_, data) => {
    const intcodeProg = data.toString().split(",").map((num) => {
        return BigInt(num);
    });

    const initialGrid = part1(intcodeProg);
    part2(intcodeProg, initialGrid);
});
