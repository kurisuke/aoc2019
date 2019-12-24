import { readFile } from "fs";

type DealCmd =
    | {
        type: "inv",
    }
    | {
        type: "inc",
        k: bigint,
    }
    | {
        type: "cut",
        k: bigint,
    };

type Stack = { off: bigint, inc: bigint, mod: bigint };

function modPow(base: bigint, exp: bigint, m: bigint) {
    let r = 1n;
    while (exp > 0) {
        if (base === 0n) {
            return 0n;
        }
        if (mod(exp, 2n) === 1n) {
            r = mod(r * base, m);
        }
        exp /= 2n;
        base = mod(base * base, m);
    }
    return r;
}

function modInv(n: bigint, m: bigint) {
    return modPow(n, m - 2n, m);
}

function mod(n: bigint, m: bigint) {
    return ((n % m) + m) % m;
}

function transform(inStack: Stack, cmds: DealCmd[]) {
    for (const cmd of cmds) {
        if (cmd.type === "inv") {
            inStack.inc = mod(-inStack.inc, inStack.mod);
            inStack.off = mod(inStack.off + inStack.inc, inStack.mod);
        } else if (cmd.type === "cut") {
            inStack.off = mod(inStack.off + inStack.inc * cmd.k, inStack.mod);
        } else if (cmd.type === "inc") {
            inStack.inc = mod(inStack.inc * modInv(cmd.k, inStack.mod), inStack.mod);
        }
    }
}

function parseInput(lines: string[]) {
    const cmds: DealCmd[] = [];
    for (const line of lines) {
        // deal into new stack
        if (line.startsWith("deal into new stack")) {
            cmds.push({ type: "inv" });
        }

        // deal with increment
        if (line.startsWith("deal with increment")) {
            const parsedInc = line.match(/[\-0-9]+/);
            if (parsedInc !== null) {
                cmds.push({ type: "inc", k: BigInt(parsedInc[0]!) });
            } else {
                throw Error("Error parsing line: " + line.trimRight());
            }
        }

        if (line.startsWith("cut")) {
            const parsedN = line.match(/[\-0-9]+/);
            if (parsedN !== null) {
                cmds.push({ type: "cut", k: BigInt(parsedN[0]!) });
            } else {
                throw Error("Error parsing line: " + line.trimRight());
            }
        }
    }

    return cmds;
}

readFile("day22.input", "utf8", (_, data) => {
    const cmds = parseInput(data.toString().split("\n"));

    // part 1

    const stack: Stack = { off: 0n, inc: 1n, mod: 10007n };
    transform(stack, cmds);

    for (let i = 0n; i < stack.mod; i++) {
        const v = mod(stack.off + stack.inc * i, stack.mod);
        if (v === 2019n) {
            console.log(i);
            break;
        }
    }
});
