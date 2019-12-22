import { readFile } from "fs";

import { Intcode } from "../common/intcode";

function part1(intcodeProg: bigint[]) {
    const computer = new Intcode(intcodeProg);

    let numAffected = 0;
    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
            computer.reset(intcodeProg);

            computer.writeInp(BigInt(x));
            computer.writeInp(BigInt(y));

            computer.run();

            const ret = computer.readOutp();
            if (ret === 1n) {
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
});
