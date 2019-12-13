import { readFile } from "fs";

import { clearScreen, cursorTo } from "../common/ansiterm";
import { Intcode, RunState } from "../common/intcode";

function readGrid(computer: Intcode) {
    const grid: {[coords: string]: bigint} = {};

    computer.run();
    let [coordX, coordY, blockId] = [computer.readOutp(), computer.readOutp(), computer.readOutp()];
    while (blockId !== undefined) {
        const key = String(coordX) + "," + String(coordY);
        grid[key] = blockId;
        [coordX, coordY, blockId] = [computer.readOutp(), computer.readOutp(), computer.readOutp()];
    }

    return grid;
}

function updateStep(computer: Intcode, grid: {[coords: string]: bigint}, inp: bigint, pyMax: number) {
    computer.writeInp(inp);
    computer.run();

    let [coordX, coordY, blockId] = [computer.readOutp(), computer.readOutp(), computer.readOutp()];
    while (coordX !== undefined && coordY !== undefined && blockId !== undefined) {
        const key = String(coordX) + "," + String(coordY);
        grid[key] = blockId;
        if (coordX >= 0) {
            process.stdout.write(cursorTo(Number(coordX), Number(coordY)) + printChar(blockId));
        }

        [coordX, coordY, blockId] = [computer.readOutp(), computer.readOutp(), computer.readOutp()];
    }

    process.stdout.write(cursorTo(0, pyMax + 2) + "Score: " + grid["-1,0"]);
}

function printChar(n: bigint) {
    switch (n) {
        case 0n: {
            return " ";
        }
        case 1n: {
            return "█";
        }
        case 2n: {
            return "▒";
        }
        case 3n: {
            return "▄";
        }
        case 4n: {
            return "◎";
        }
        default: {
            return " ";
        }
    }
}

function printGrid(grid: {[coords: string]: bigint}, pxMax: number, pyMax: number) {
    for (let y = 0; y <= pyMax; y++) {
        let s = "";
        for (let x = 0; x <= pxMax; x++) {
            s += printChar(grid[x + "," + y]);
        }
        process.stdout.write(s + "\n");
    }
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function part2(intcodeProg: bigint[]) {
    intcodeProg[0] = 2n;
    const computer = new Intcode(intcodeProg);

    // get measures
    const grid = readGrid(computer);

    let [pxMax, pyMax] = [-Infinity, -Infinity];
    for (const ps of Object.keys(grid)) {
        const [px, py] = [Number(ps.split(",")[0]),
                          Number(ps.split(",")[1])];
        pxMax = px > pxMax ? px : pxMax;
        pyMax = py > pyMax ? py : pyMax;
    }

    process.stdout.write(clearScreen());
    printGrid(grid, pxMax, pyMax);

    while (computer.state !== RunState.Halted) {
        await sleep(5);

        // game is like breakout / arkanoid
        // input moves the paddle left/right
        // optimal strategy is to always follow the direction of the ball (x-axis)
        const paddleX = Object.keys(grid).find((key) => grid[key] === 3n)!.split(",")[0]!;
        const ballX = Object.keys(grid).find((key) => grid[key] === 4n)!.split(",")[0]!;

        const inp = BigInt(Math.sign(Number(ballX) - Number(paddleX)));

        updateStep(computer, grid, inp, pyMax);
    }

    process.stdout.write("\n");
}

readFile("day13.input", "utf8", (error, data) => {
    const intcodeProg = data.toString().split(",").map( (num) => {
        return BigInt(num);
    });

    // part 1
    {
        const computer = new Intcode(intcodeProg);
        const grid = readGrid(computer);
        const result1 = Object.values(grid).reduce((a, id) => id === 2n ? a + 1 : a, 0);
        console.log(result1);
    }

    // part 2
    part2(intcodeProg);
});
