import { readFile } from "fs";

import { Intcode } from "../common/intcode";

type QueueEntry = { dest: number, x: bigint, y: bigint };

function part1(intcodeProg: bigint[]) {
    const numComputers = 50;
    const comps = [];

    for (let i = 0; i < numComputers; i++) {
        comps.push(new Intcode(intcodeProg));
        comps[comps.length - 1]!.writeInp(BigInt(i));
        comps[comps.length - 1].run();
    }

    while (true) {
        let sendQueue: QueueEntry[] = [];

        // send phase: fill packet queue
        for (const c of comps) {
            while (true) {
                const dest = c.readOutp();
                if (dest === undefined) {
                    break;
                } else {
                    const x = c.readOutp()!;
                    const y = c.readOutp()!;
                    if (dest === 255n) {
                        return y;
                    }
                    sendQueue.push({ dest: Number(dest), x, y });
                }
            }
        }
        sendQueue = sendQueue.reverse();

        const writtenTo: Set<number> = new Set();

        // recv phase: fill packet queue
        while (true) {
            const packet = sendQueue.pop();
            if (packet === undefined) {
                break;
            } else {
                comps[packet.dest]!.writeInp(packet.x);
                comps[packet.dest]!.writeInp(packet.y);
                writtenTo.add(packet.dest);
            }
        }

        // write -1 (no input) to all computers not written to
        for (let i = 0; i < numComputers; i++) {
            if (writtenTo.has(i) === false) {
                comps[i]!.writeInp(-1n);
            }
        }

        // run all computers
        for (let i = 0; i < numComputers; i++) {
            comps[i]!.run();
        }
    }
}

readFile("day23.input", "utf8", (_, data) => {
    const intcodeProg = data.toString().split(",").map((num) => {
        return BigInt(num);
    });

    console.log(part1(intcodeProg));
});
