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
                wirePath.push({axisConst: Axis.Y, coordConst: pos[1], coordVar: [pos[0], pos[0] - len]});
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
                wirePath.push({axisConst: Axis.X, coordConst: pos[0], coordVar: [pos[1], pos[1] - len]});
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

function pathLen(wirePath: Wire[], endPoint: [number, number]) {
    let len = 0;
    for (const wire of wirePath) {
        if (wire.axisConst === Axis.X) { // X is constant
            if (endPoint[0] === wire.coordConst &&
                endPoint[1] > Math.min(wire.coordVar[0], wire.coordVar[1]) &&
                endPoint[1] < Math.max(wire.coordVar[0], wire.coordVar[1])) {
                // point is on wire, finish
                len += Math.abs(endPoint[1] - wire.coordVar[0]);
                break;
            } else { // point not on wire
                len += Math.abs(wire.coordVar[1] - wire.coordVar[0]);
            }
        } else { // Y is constant
            if (endPoint[1] === wire.coordConst &&
                endPoint[0] > Math.min(wire.coordVar[0], wire.coordVar[1]) &&
                endPoint[0] < Math.max(wire.coordVar[0], wire.coordVar[1])) {
                // point is on wire, finish
                len += Math.abs(endPoint[0] - wire.coordVar[0]);
                break;
            } else { // point not on wire
                len += Math.abs(wire.coordVar[1] - wire.coordVar[0]);
            }
        }
    }
    return len;
}

readFile("day03.input", "utf8", (error, data) => {
    const pathStrs = data.toString().split("\n").map((line) => line.split(","));
    const wirePaths: Wire[][] = pathStrs.map(rel2abs);

    // let interMin: [number, number] = [Infinity, Infinity];
    let lenMin = Infinity;

    for (const wire1 of wirePaths[0]) {
        for (const wire2 of wirePaths[1]) {
            // no intersection of the 2 paths have the same const axis, e.g. parallel
            if (wire1.axisConst === wire2.axisConst) {
                continue;
            }

            // get the intersection point
            if (wire1.coordConst > Math.min(wire2.coordVar[0], wire2.coordVar[1]) &&
                wire1.coordConst < Math.max(wire2.coordVar[0], wire2.coordVar[1]) &&
                wire2.coordConst > Math.min(wire1.coordVar[0], wire1.coordVar[1]) &&
                wire2.coordConst < Math.max(wire1.coordVar[0], wire1.coordVar[1])) {
                const inter: [number, number] = wire1.axisConst === Axis.X ?
                    [wire1.coordConst, wire2.coordConst] :
                    [wire2.coordConst, wire1.coordConst];
                const pathLenComb = pathLen(wirePaths[0], inter) + pathLen(wirePaths[1], inter);
                if (pathLenComb < lenMin) {
                    lenMin = pathLenComb;
                }
            }
        }
    }

    console.log(lenMin);
});
