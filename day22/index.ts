import { readFile } from "fs";

type DealCmd =
    | {
        type: "DEAL_NEW",
    }
    | {
        type: "DEAL_INC",
        inc: number,
    }
    | {
        type: "CUT_N",
        n: number,
    };

function dealNew(inS: number[]) {
    const inStack = [...inS];
    return inStack.reverse();
}

function dealInc(inStack: number[], inc: number) {
    const outStack = [];
    for (const _ of inStack) {
        outStack.push(Infinity);
    }

    let outPos = 0;
    for (const card of inStack) {
        outStack[outPos] = card;
        outPos = (outPos + inc) % inStack.length;
    }
    return outStack;
}

function cutN(inS: number[], n: number) {
    const inStack = [...inS];
    if (n > 0) {
        const top = inStack.slice(0, n);
        const bottom = inStack.slice(n);
        return bottom.concat(top);
    } else {
        const top = inStack.slice(0, inStack.length + n);
        const bottom = inStack.slice(inStack.length + n);
        return bottom.concat(top);
    }
}

function runCmds(stack: number[], cmds: DealCmd[]) {
    for (const cmd of cmds) {
        if (cmd.type === "DEAL_NEW") {
            stack = dealNew(stack);
        } else if (cmd.type === "DEAL_INC") {
            stack = dealInc(stack, cmd.inc);
        } else if (cmd.type === "CUT_N") {
            stack = cutN(stack, cmd.n);
        }
        // console.log(cmd);
        // console.log(stack);
    }

    return stack;
}

function parseInput(lines: string[]) {
    const cmds: DealCmd[] = [];
    for (const line of lines) {
        // deal into new stack
        if (line.startsWith("deal into new stack")) {
            cmds.push({ type: "DEAL_NEW" });
        }

        // deal with increment
        if (line.startsWith("deal with increment")) {
            const parsedInc = line.match(/[\-0-9]+/);
            if (parsedInc !== null) {
                cmds.push({ type: "DEAL_INC", inc: Number(parsedInc[0]!) });
            } else {
                throw Error("Error parsing line: " + line.trimRight());
            }
        }

        if (line.startsWith("cut")) {
            const parsedN = line.match(/[\-0-9]+/);
            if (parsedN !== null) {
                cmds.push({ type: "CUT_N", n: Number(parsedN[0]!) });
            } else {
                throw Error("Error parsing line: " + line.trimRight());
            }
        }
    }

    return cmds;
}

readFile("day22.input", "utf8", (_, data) => {
    const cmds = parseInput(data.toString().split("\n"));

    const stackIn = [];
    for (let i = 0; i < 10007; i++) {
        stackIn.push(i);
    }

    const stackOut = runCmds(stackIn, cmds);
    console.log(stackOut.indexOf(2019));
});
