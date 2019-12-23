import { readFile } from "fs";

import { Intcode } from "../common/intcode";

function isAffected(intcodeProg: bigint[], x: number, y: number) {
    const computer = new Intcode(intcodeProg);
    computer.writeInp(BigInt(x));
    computer.writeInp(BigInt(y));

    computer.run();

    return computer.readOutp()! === 1n;
}

function canFit(intcodeProg: bigint[], x: number, y: number) {
    return isAffected(intcodeProg, x, y) === true &&
        isAffected(intcodeProg, x + 99, y) === true &&
        isAffected(intcodeProg, x, y + 99) === true &&
        isAffected(intcodeProg, x + 99, y + 99) === true;
}

function dist(p: number[]) {
    return p[0]! * p[0]! + p[1]! * p[1]!;
}

function part2(intcodeProg: bigint[]) {
    const fitList = [];

    let w = 256;
    let [xMin, xMax] = [0, 2048];
    let [yMin, yMax] = [0, 2048];
    let minPoint = [-1, -1];

    while (w >= 1) {
        for (let x = xMin; x <= xMax; x += w) {
            for (let y = yMin; y <= yMax; y += w) {
                if (canFit(intcodeProg, x, y)) {
                    fitList.push([x, y]);
                }
            }
        }
        minPoint = fitList.reduce((a, p) => dist(a) < dist(p) ? a : p, [Infinity, Infinity]);
        [xMin, xMax] = [minPoint[0] - 4 * w, minPoint[0]];
        [yMin, yMax] = [minPoint[1] - 4 * w, minPoint[1]];
        w /= 4;
    }
    console.log(minPoint[0] * 10000 + minPoint[1]);
}

function part1(intcodeProg: bigint[]) {
    let numAffected = 0;
    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
            if (isAffected(intcodeProg, x, y)) {
                numAffected++;
            }
        }
    }

    console.log(numAffected);
}

readFile("day19.input", "utf8", (_, data) => {
    const intcodeProg = data.toString().split(",").map((num) => {
        return BigInt(num);
    });

    part1(intcodeProg);
    part2(intcodeProg);
});
