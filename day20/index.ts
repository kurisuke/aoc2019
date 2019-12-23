import { readFile } from "fs";

import { Vec2D } from "../common/vec2d";

type Grid = string[][];
type Label = { id: string, pos: [Vec2D, Vec2D], teleportField: Vec2D };

function isLabelChar(s: string) {
    return s.charCodeAt(0) >= 0x41 && s.charCodeAt(0) <= 0x5a;
}

function findAllLabels(grid: Grid) {
    const labels: Label[] = [];
    const labelFields: Set<string> = new Set();

    const [xLen, yLen] = [grid[0]!.length, grid.length];
    for (let x = 0; x < xLen; x++) {
        for (let y = 0; y < yLen; y++) {
            const posVec = new Vec2D(x, y);
            if (!labelFields.has(posVec.asStr())) {
                if (isLabelChar(grid[y][x])) {
                    let id = grid[y][x];
                    labelFields.add(posVec.asStr());
                    if (grid[y + 1] && grid[y + 1][x] && isLabelChar(grid[y + 1][x])) {
                        // horizontal
                        const posVec2 = new Vec2D(x, y + 1);
                        labelFields.add(posVec2.asStr());
                        id += grid[y + 1][x];
                        id = id.split("").sort().join("");
                        if (grid[y + 2] && grid[y + 2][x] && grid[y + 2][x] === ".") {
                            const teleportField = new Vec2D(x, y + 2);
                            labels.push({ id, pos: [posVec, posVec2], teleportField });
                        } else if (grid[y - 1] && grid[y - 1][x] && grid[y - 1][x] === ".") {
                            const teleportField = new Vec2D(x, y - 1);
                            labels.push({ id, pos: [posVec, posVec2], teleportField });
                        } else {
                            throw Error("No teleport field found for: id=" + id + ", y=" + y + " , x=" + x);
                        }
                    } else if (grid[y][x + 1] && isLabelChar(grid[y][x + 1])) {
                        // vertical
                        const posVec2 = new Vec2D(x + 1, y);
                        labelFields.add(posVec2.asStr());
                        id += grid[y][x + 1];
                        id = id.split("").sort().join("");
                        if (grid[y][x + 2] && grid[y][x + 2] === ".") {
                            const teleportField = new Vec2D(x + 2, y);
                            labels.push({ id, pos: [posVec, posVec2], teleportField });
                        } else if (grid[y][x - 1] && grid[y][x - 1] === ".") {
                            const teleportField = new Vec2D(x - 1, y);
                            labels.push({ id, pos: [posVec, posVec2], teleportField });
                        } else {
                            throw Error("No teleport field found for: id=" + id + ", y=" + y + " , x=" + x);
                        }
                    }
                }
            }
        }
    }
    return labels;
}

function getOtherLabel(labels: Label[], findLabel: Label) {
    for (const label of labels) {
        if (findLabel.id === label.id && findLabel.pos !== label.pos) {
            return label;
        }
    }
    return undefined;
}

function canTeleport(labels: Label[], field: Vec2D) {
    for (const label of labels) {
        if (field.asStr() === label.teleportField.asStr()) {
            for (const labelOther of labels) {
                if (labelOther.id === label.id && labelOther.teleportField.asStr() !== label.teleportField.asStr()) {
                    return labelOther.teleportField;
                }
            }
        }
    }
    return undefined;
}

function findPath(grid: Grid, allLabels: Label[], startPoint: Vec2D, endPoint: Vec2D) {
    // initialize bfs
    const visited: Set<string> = new Set();
    let frontier: Set<string> = new Set();
    frontier.add(startPoint.asStr());
    let steps = 0;

    while (frontier.size > 0) {
        // console.log(steps, Array.from(frontier.values()).join("|"));
        const newFrontier: Set<string> = new Set();

        for (const fieldStr of Array.from(frontier.values())) {
            const field = new Vec2D(fieldStr);

            if (field.asStr() === endPoint.asStr()) {
                return steps;
            }

            // check if move to neighbors possible
            const neighbors = [
                new Vec2D(field.x - 1, field.y),
                new Vec2D(field.x + 1, field.y),
                new Vec2D(field.x, field.y - 1),
                new Vec2D(field.x, field.y + 1),
            ];
            for (const neighbor of neighbors) {
                const neighborStr = neighbor.asStr();
                if (!frontier.has(neighborStr) && !visited.has(neighborStr)) {
                    if (grid[neighbor.y] && grid[neighbor.y][neighbor.x] === ".") {
                        newFrontier.add(neighborStr);
                    }
                }
            }

            // check if move to teleport is possible
            const teleportField = canTeleport(allLabels, field);
            if (teleportField !== undefined) {
                const teleportStr = teleportField.asStr();
                if (!frontier.has(teleportStr) && !visited.has(teleportStr)) {
                    newFrontier.add(teleportStr);
                }
            }
            visited.add(fieldStr);
        }

        frontier = newFrontier;
        steps++;
    }
}

readFile("day20.input", "utf8", (_, data) => {
    // read input into grid[y][x]
    const grid: Grid = [];
    for (const line of data.split("\n")) {
        const tmp = [];
        for (const c of line.split("")) {
            tmp.push(c);
        }
        grid.push(tmp);
    }

    const allLabels = findAllLabels(grid);

    // check validity of input
    for (const label of allLabels) {
        if (label.id === "AA" || label.id === "ZZ") {
            if (getOtherLabel(allLabels, label) !== undefined) {
                throw Error("Unexpected input: label " + label.id + " occurs twice");
            }
        } else {
            if (getOtherLabel(allLabels, label) === undefined) {
                throw Error("Unexpected input: label " + label.id + " has no matching partner");
            }
        }
    }

    const startPoint = allLabels.find((label) => label.id === "AA")!.teleportField;
    const endPoint = allLabels.find((label) => label.id === "ZZ")!.teleportField;

    // console.log("start:", startPoint.x, startPoint.y, endPoint.x, endPoint.y);

    console.log(findPath(grid, allLabels, startPoint, endPoint));
});
