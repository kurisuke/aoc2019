import { readFile } from "fs";

// apply opcode
//
// 1 - add
// 2 - mul
// 3 - input
// 4 - output
// 99 - halt

enum ParamMode {
    Position,
    Immediate,
}

function inp() {
    console.log("Input: 1");
    return 1;
}

function outp(x: number) {
    console.log("Output:", x);
}

function op(pos: number[], pc: number) {
    const opcode = pos[pc] % 100;
    const paramMode: ParamMode[] = [];
    paramMode[0] = Math.floor(pos[pc] / 100) % 10 === 1 ? ParamMode.Immediate : ParamMode.Position;
    paramMode[1] = Math.floor(pos[pc] / 1000) % 10 === 1 ? ParamMode.Immediate : ParamMode.Position;
    paramMode[2] = Math.floor(pos[pc] / 10000) % 10 === 1 ? ParamMode.Immediate : ParamMode.Position;

    switch (opcode) {
        case 1: {
            const p1 = paramMode[0] === ParamMode.Immediate ? pos[pc + 1] : pos[pos[pc + 1]];
            const p2 = paramMode[1] === ParamMode.Immediate ? pos[pc + 2] : pos[pos[pc + 2]];
            // console.log(`pc: ${pc}:${pos[pc]}:${pos[pc + 1]}:${pos[pc + 2]} -- ADD ${p1}, ${p2} -> [${pos[pc + 3]}]`);
            pos[pos[pc + 3]] = p1 + p2;
            pc += 4;
            break;
        }
        case 2: {
            const p1 = paramMode[0] === ParamMode.Immediate ? pos[pc + 1] : pos[pos[pc + 1]];
            const p2 = paramMode[1] === ParamMode.Immediate ? pos[pc + 2] : pos[pos[pc + 2]];
            // console.log(`pc: ${pc}:${pos[pc]}:${pos[pc + 1]}:${pos[pc + 2]} -- MUL ${p1}, ${p2} -> [${pos[pc + 3]}]`);
            pos[pos[pc + 3]] = p1 * p2;
            pc += 4;
            break;
        }
        case 3: {
            // console.log(`pc: ${pc} -- IN -> [${pos[pc + 1]}]`);
            pos[pos[pc + 1]] = inp();
            pc += 2;
            break;
        }
        case 4: {
            const p1 = paramMode[0] === ParamMode.Immediate ? pos[pc + 1] : pos[pos[pc + 1]];
            // console.log(`pc: ${pc} -- OUT ${p1}`);
            outp(p1);
            pc += 2;
            break;
        }
        case 99: {
            pc = -1;
            break;
        }
        default: {
            console.log("Invalid opcode: " + opcode);
            throw Error("Invalid opcode");
        }
    }
    return pc;
}

function printPos(pos: number[]) {
    for (let offset = 0; offset < pos.length; offset += 4) {
        console.log(pos[offset] + "," +
                    pos[offset + 1] + "," +
                    pos[offset + 2] + "," +
                    pos[offset + 3]);
    }
}

readFile("day05.input", "utf8", (error, data) => {
    const origPos = data.toString().split(",").map( (num) => {
        return +num;
    });

    // reset memory (pos) to initial state
    const pos = [...origPos];

    let pc = 0;
    while (pc < pos.length) {
        try {
            pc = op(pos, pc);
            if (pc === -1) { // halt
                console.log("HALT");
                break;
            }
        } catch (e) {
            console.log("Error:", e);
            break;
        }
    }
});
