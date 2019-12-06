import { readFile } from "fs";

enum Axis {
    X,
    Y,
}

interface Wire {
    axisConst: Axis; // axis which is variable (X or Y)
    coordConst: number; // constant coordinate
    coordVar: [number, number]; // range of variable coordiante
}

function rel2abs(pathStr: string[]) {
    const pos: [number, number] = [0, 0];
    const wirePath: Wire[] = [];

    for (const wireStr of pathStr) {
        const dirStr = wireStr.substr(0, 1);
        const len = +wireStr.substr(1);
        switch (dirStr) {
            case "L": {
                wirePath.push({axisConst: Axis.Y, coordConst: pos[1], coordVar: [pos[0] - len, pos[0]]});
                pos[0] -= len;
                break;
            }
            case "R": {
                wirePath.push({axisConst: Axis.Y, coordConst: pos[1], coordVar: [pos[0], pos[0] + len]});
                pos[0] += len;
                break;
            }
            case "U": {
                wirePath.push({axisConst: Axis.X, coordConst: pos[0], coordVar: [pos[1], pos[1] + len]});
                pos[1] += len;
                break;
            }
            case "D": {
                wirePath.push({axisConst: Axis.X, coordConst: pos[0], coordVar: [pos[1] - len, pos[1]]});
                pos[1] -= len;
                break;
            }
            default: {
                throw Error("Invalid direction: " + dirStr);
            }
        }
    }
    return wirePath;
}

// Manhattan distance
function manhattan(x: [number, number]) {
    return Math.abs(x[0]) + Math.abs(x[1]);
}

readFile("day03.input", "utf8", (error, data) => {
    const pathStrs = data.toString().split("\n").map((line) => line.split(","));
    const wirePaths: Wire[][] = pathStrs.map(rel2abs);

    let interMin: [number, number] = [Infinity, Infinity];

    for (const wire1 of wirePaths[0]) {
        for (const wire2 of wirePaths[1]) {
            // no intersection of the 2 paths have the same const axis, e.g. parallel
            if (wire1.axisConst === wire2.axisConst) {
                continue;
            }

            // get the intersection point
            if (wire1.coordConst > wire2.coordVar[0] && wire1.coordConst < wire2.coordVar[1] &&
                wire2.coordConst > wire1.coordVar[0] && wire2.coordConst < wire1.coordVar[1]) {
                if (wire1.axisConst === Axis.X) { // equiv. to wire2.axisConst === Axis.Y
                    const inter: [number, number] = [wire1.coordConst, wire2.coordConst];
                    if (manhattan(inter) < manhattan(interMin)) {
                        interMin = inter;
                    }
                } else { // wire1.axisConst === Axis.Y && wire2.axisConst === Axis.X
                    const inter: [number, number] = [wire2.coordConst, wire1.coordConst];
                    if (manhattan(inter) < manhattan(interMin)) {
                        interMin = inter;
                    }
                }
            }
        }
    }

    console.log(manhattan(interMin));
});
