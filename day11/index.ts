import { readFile } from "fs";

import { Vec2D } from "./coords";
import { Intcode, RunState } from "./intcode";

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

readFile("day11.input", "utf8", (error, data) => {
    const origPos = data.toString().split(",").map( (num) => {
        return BigInt(num);
    });

    const computer = new Intcode(origPos);

    const grid: {[coords: string]: bigint} = {};
    const visited: Set<string> = new Set();
    const pos = new Vec2D(0, 0);
    let lastDir = new Vec2D(0, 1);

    while (true) {
        visited.add(pos.asStr());

        if (grid[pos.asStr()] === undefined) {
            grid[pos.asStr()] = 0n; // black
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

    console.log(visited.size);
});
