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
    const [xMax, yMax] = [grid.length, grid[0]!.length];
    let acc = 0;
    for (let x = 1; x < xMax - 1; x++) {
        for (let y = 1; y < yMax - 1; y++) {
            if ((grid[x]![y]! === "#") &&
                (grid[x - 1]![y]! === "#") && (grid[x + 1]![y]! === "#") &&
                (grid[x]![y - 1]! === "#") && (grid[x]![y + 1]! === "#")) {
                // intersection point
                acc += x * y;
            }
        }
    }
    console.log(acc);
}

readFile("day17.input", "utf8", (_, data) => {
    const intcodeProg = data.toString().split(",").map((num) => {
        return BigInt(num);
    });

    part1(intcodeProg);
});
