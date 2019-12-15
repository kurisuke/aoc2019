import { readFile } from "fs";

import { Intcode, RunState } from "../common/intcode";
import { Vec2D } from "../common/vec2d";

type Maze = {[coords: string]: string; };
type Visited = {[coords: string]: boolean; };

function moveCmd(computer: Intcode, dir: bigint) {
    computer.writeInp(dir);
    computer.run();
    return computer.readOutp();
}

function moveBack(computer: Intcode, dir: bigint) {
    // when the moves are exhausted, move the robot back to the field before
    const oppoDirFn = (d: bigint) => {
        switch (d) {
            case 1n: // North
                return 2n;
            case 2n:  // South
                return 1n;
            case 3n:  // West
                return 4n;
            case 4n:  // East
                return 3n;
        }
    };
    const oppoDir = oppoDirFn(dir)!;
    moveCmd(computer, oppoDir);
}

function tryMoves(pos: Vec2D, computer: Intcode, maze: Maze,
                  visited: Visited, path: bigint[], paths: bigint[][]) {
    if (visited[pos.asStr()] === true) { // already visited
        return; // don't continue
    }

    visited[pos.asStr()] = true;

    for (let dir = 1n; dir <= 4n; dir++) {
        const newPosFn = (d: bigint) => {
            switch (d) {
                case 1n: // North
                    return new Vec2D(pos.x, pos.y - 1);
                case 2n:  // South
                    return new Vec2D(pos.x, pos.y + 1);
                case 3n:  // West
                    return new Vec2D(pos.x - 1, pos.y);
                case 4n:  // East
                    return new Vec2D(pos.x + 1, pos.y);
            }
        };
        const newPos = newPosFn(dir)!;

        if ((visited[newPos.asStr()] !== true) && (maze[newPos.asStr()] !== "#")) {
            const moveResult = moveCmd(computer, dir);

            switch (moveResult) {
                case 0n: { // hit a wall, move has failed
                    maze[newPos.asStr()] = "#";
                    break;
                }
                case 1n: { // move was successful
                    path.push(dir);
                    maze[newPos.asStr()] = ".";

                    tryMoves(newPos, computer, maze, visited, path, paths);

                    // when the moves are exhausted, move the robot back to the field before
                    path.pop();
                    moveBack(computer, dir);
                    break;
                }
                case 2n: { // reached the end field
                    path.push(dir);
                    maze[newPos.asStr()] = "o"; // oxygen system, for part 2

                    // add a new found path
                    paths.push([...path]);

                    // when the moves are exhausted, move the robot back to the field before
                    path.pop();
                    moveBack(computer, dir);
                    break;
                }
            }
        }
    }

    visited[pos.asStr()] = false;
}

function printMaze(maze: Maze) {
    const [minX, minY, maxX, maxY] = Object.keys(maze).reduce(
        (a, k) => {
            const p = new Vec2D(k);
            a[0] = p.x < a[0] ? p.x : a[0];
            a[1] = p.y < a[1] ? p.y : a[1];
            a[2] = p.x > a[2] ? p.x : a[2];
            a[3] = p.y > a[3] ? p.y : a[3];
            return a;
        }, [Infinity, Infinity, -Infinity, -Infinity]);

    for (let y = minY; y <= maxY; y++) {
        let s = "";
        for (let x = minX; x <= maxX; x++) {
            const p = new Vec2D(x, y);
            s += maze[p.asStr()] === undefined ? "#" : maze[p.asStr()];
        }
        console.log(s);
    }
}

function oxygenIter(inMaze: Maze) {
    const outMaze: Maze = {};
    Object.keys(inMaze).forEach((ps) => {
        switch (inMaze[ps]) {
            case "#":  { // wall
                outMaze[ps] = "#";
                break;
            }
            case "o":  { // oxygen
                outMaze[ps] = "o";
                break;
            }
            case ".": { // empty
                outMaze[ps] = ".";

                // if a neighboring (NSWE) field has oxygen, it spreads to this field
                const p = new Vec2D(ps);
                const adjFields = [new Vec2D(p.x - 1, p.y), new Vec2D(p.x + 1, p.y),
                                   new Vec2D(p.x, p.y - 1), new Vec2D(p.x, p.y + 1)];
                for (const adj of adjFields) {
                    if (inMaze[adj.asStr()] === "o") {
                        outMaze[ps] = "o";
                        break;
                    }
                }
                break;
            }
        }
    });
    return outMaze;
}

readFile("day15.input", "utf8", (error, data) => {
    const intcodeProg = data.toString().split(",").map( (num) => {
        return BigInt(num);
    });

    // part 1
    const computer = new Intcode(intcodeProg);
    const maze: Maze = {};
    const visited: Visited = {};
    const path: bigint[] = [];
    const paths: bigint[][] = [];

    const initPos = new Vec2D(0, 0);

    tryMoves(initPos, computer, maze, visited, path, paths);

    const minLength = paths.reduce((a, p) => a > p.length ? a : p.length, 0);
    console.log(minLength);

    // part 2
    let mins = 0;
    let iMaze = maze;
    while (Object.values(iMaze).indexOf(".") !== -1) {
        iMaze = oxygenIter(iMaze);
        mins++;
    }
    console.log(mins);
});
