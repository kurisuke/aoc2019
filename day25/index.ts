import { readFile } from "fs";

import { Intcode, RunState } from "../common/intcode";

function getInv(c: Intcode) {
    c.writeInpAscii("inv\n");
    c.run();
    const lines = c.readOutpAscii().split("\n");
    const allItems = lines.reduce((ai, line) => {
        if (line.startsWith("- ") && line !== "- north" && line !== "- south") {
            ai.push(line.slice(2));
        }
        return ai;
    }, [] as string[]);
    return allItems;
}

function tryItems(c: Intcode) {
    // get initial inventory (all items)
    const allItems = getInv(c);
    let lastInv;

    for (let i = (1 << allItems.length) - 1; i > 0; i--) {
        const numsUnpadded = (i >>> 0).toString(2);
        const s = "00000000" + numsUnpadded;
        const numsPadded = s.substr(s.length - allItems.length);
        const curInv = numsPadded.split("").map((num) => Number(num));

        const cmdList = [];

        for (let j = 0; j < curInv.length; j++) {
            if (lastInv !== undefined) {
                if (curInv[j] === 1 && lastInv[j] === 0) {
                    cmdList.push("take " + allItems[j]);
                } else if (curInv[j] === 0 && lastInv[j] === 1) {
                    cmdList.push("drop " + allItems[j]);
                }
            }
        }

        // run the take / drop commands until the inventory is okay
        for (const cmd of cmdList) {
            c.writeInpAscii(cmd + "\n");
            c.run();
            c.readOutpAscii(); // ignore output
        }

        // then go south and try
        c.writeInpAscii("south\n");
        c.run();
        const desc = c.readOutpAscii();

        if (desc.indexOf("ejected") === -1) {
            console.log(desc);
            return;
        }

        lastInv = curInv;
    }
}

readFile("day25.input", "utf8", (_, data) => {
    const intcodeProg = data.toString().split(",").map((num) => {
        return BigInt(num);
    });

    const c = new Intcode(intcodeProg);

    readFile("cmds.part1", "utf8", (__, data2) => {
        const collectItemCmds = data2.toString().split("\n").reverse();

        do {
            c.run();
            const desc = c.readOutpAscii();
            console.log(desc);
            const inputCmd = collectItemCmds.pop();
            console.log("? " + inputCmd);
            c.writeInpAscii(inputCmd + "\n");
        } while (c.state !== RunState.Halted && collectItemCmds.length > 0);

        tryItems(c);
    });
});
