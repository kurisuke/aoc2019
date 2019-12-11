import { readFile } from "fs";

import { Intcode, RunState } from "../common/intcode";
import { Vec2D } from "../common/vec2d";

function doTurn(cmd: bigint, lastDir: Vec2D) {
    if (cmd === 0n) { // turn left
        switch (lastDir.asStr()) {
            case "-1,0": // left
                return new Vec2D(0, -1);
            case "0,-1":
                return new Vec2D(1, 0);
            case "1,0":
                return new Vec2D(0, 1);
            case "0,1":
                return new Vec2D(-1, 0);
            default:
                throw Error("Invalid direction!");
        }
    } else { // turn right
        switch (lastDir.asStr()) {
            case "-1,0":
                return new Vec2D(0, 1);
            case "0,1":
                return new Vec2D(1, 0);
            case "1,0":
                return new Vec2D(0, -1);
            case "0,-1":
                return new Vec2D(-1, 0);
            default:
                throw Error("Invalid direction!");
        }
    }
}

function runPainter(prog: bigint[], initVal: bigint) {
    const computer = new Intcode(prog);

    const grid: {[coords: string]: bigint} = {};
    const visited: Set<string> = new Set();
    const pos = new Vec2D(0, 0);
    let lastDir = new Vec2D(0, 1);

    while (true) {
        visited.add(pos.asStr());

        if (grid[pos.asStr()] === undefined) {
            grid[pos.asStr()] = initVal; // white
        }

        computer.writeInp(grid[pos.asStr()]);

        computer.run();
        if (computer.state === RunState.Halted) {
            break;
        } else {
            const paintColor = computer.readOutp()!;
            grid[pos.asStr()] = paintColor;

            const turn = computer.readOutp()!;
            lastDir = doTurn(turn, lastDir);

            // move the robot
            pos.add(lastDir);
        }
    }

    return {grid, visited};
}

function printGrid(grid: {[coords: string]: bigint}) {
    // get corners of the painted grid
    const [cMinX, cMinY, cMaxX, cMaxY] = Object.keys(grid).reduce((a, k) => {
        const [cx, cy] = k.split(",").map((i) => Number(i));
        a[0] = cx < a[0] ? cx : a[0];
        a[1] = cy < a[1] ? cy : a[1];
        a[2] = cx > a[2] ? cx : a[2];
        a[3] = cy > a[3] ? cy : a[3];
        return a;
    }, [Infinity, Infinity, -Infinity, -Infinity]);

    // print grid (invert y axis to start at the top)
    for (let y = cMaxY; y >= cMinY; y--) {
        let s = "";
        for (let x = cMinX; x <= cMaxX; x++) {
            const c = (new Vec2D(x, y)).asStr();
            s += grid[c] === undefined || grid[c] === 0n ? " " : "#";
        }
        console.log(s);
    }
}

readFile("day11.input", "utf8", (error, data) => {
    const intcodeProg = data.toString().split(",").map( (num) => {
        return BigInt(num);
    });

    // part 1
    const result1 = runPainter(intcodeProg, 0n);
    console.log(result1.visited.size);

    // part 2
    const result2 = runPainter(intcodeProg, 1n);
    printGrid(result2.grid);
});
