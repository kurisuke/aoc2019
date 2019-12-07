import { readFile } from "fs";

// apply opcode
//
// 1 - add
// 2 - mul
// 3 - input
// 4 - output
// 5 - jnz
// 6 - jz
// 7 - lt
// 8 - eq
// 99 - halt

enum ParamMode {
    Position,
    Immediate,
}

enum RunState {
    Halted,
    Running,
    Blocked,
    Error,
}

class Intcode {
    public state: RunState;

    private pos: number[];
    private pc: number;
    private inp: number[];
    private outp: number[];

    constructor(pos: number[]) {
        this.pos = [...pos];
        this.pc = 0;
        this.inp = [];
        this.outp = [];
        this.state = RunState.Halted;
    }

    public reset(pos: number[]) {
        this.pos = [...pos];
        this.pc = 0;
        this.inp = [];
        this.outp = [];
        this.state = RunState.Halted;
    }

    public writeInp(n: number) {
        this.inp.push(n);
    }

    public readOutp() {
        if (this.outp.length > 0) {
            return this.outp.shift()!;
        } else {
            return null;
        }
    }

    public run() {
        this.state = RunState.Running;
        while (this.state === RunState.Running && this.pc < this.pos.length) {
            try {
                this.op();
            } catch (e) {
                console.log("Error:", e);
                this.state = RunState.Error;
                return;
            }
        }
    }

    private op() {
        const opcode = this.pos[this.pc] % 100;
        const paramMode: ParamMode[] = [];
        paramMode[0] = Math.floor(this.pos[this.pc] / 100) % 10 === 1 ? ParamMode.Immediate : ParamMode.Position;
        paramMode[1] = Math.floor(this.pos[this.pc] / 1000) % 10 === 1 ? ParamMode.Immediate : ParamMode.Position;
        paramMode[2] = Math.floor(this.pos[this.pc] / 10000) % 10 === 1 ? ParamMode.Immediate : ParamMode.Position;

        switch (opcode) {
            case 1: {
                const p1 = paramMode[0] === ParamMode.Immediate ? this.pos[this.pc + 1] : this.pos[this.pos[this.pc + 1]];
                const p2 = paramMode[1] === ParamMode.Immediate ? this.pos[this.pc + 2] : this.pos[this.pos[this.pc + 2]];
                this.pos[this.pos[this.pc + 3]] = p1 + p2;
                this.pc += 4;
                break;
            }
            case 2: {
                const p1 = paramMode[0] === ParamMode.Immediate ? this.pos[this.pc + 1] : this.pos[this.pos[this.pc + 1]];
                const p2 = paramMode[1] === ParamMode.Immediate ? this.pos[this.pc + 2] : this.pos[this.pos[this.pc + 2]];
                this.pos[this.pos[this.pc + 3]] = p1 * p2;
                this.pc += 4;
                break;
            }
            case 3: {
                if (this.inp.length === 0) { // no input, blocked
                    this.state = RunState.Blocked;
                } else {
                    this.pos[this.pos[this.pc + 1]] = this.inp.shift()!;
                    this.pc += 2;
                }
                break;
            }
            case 4: {
                const p1 = paramMode[0] === ParamMode.Immediate ? this.pos[this.pc + 1] : this.pos[this.pos[this.pc + 1]];
                this.outp.push(p1);
                this.pc += 2;
                break;
            }
            case 5: { // jnz
                const p1 = paramMode[0] === ParamMode.Immediate ? this.pos[this.pc + 1] : this.pos[this.pos[this.pc + 1]];
                const p2 = paramMode[1] === ParamMode.Immediate ? this.pos[this.pc + 2] : this.pos[this.pos[this.pc + 2]];
                if (p1 !== 0) {
                    this.pc = p2;
                } else {
                    this.pc += 3;
                }
                break;
            }
            case 6: { // jz
                const p1 = paramMode[0] === ParamMode.Immediate ? this.pos[this.pc + 1] : this.pos[this.pos[this.pc + 1]];
                const p2 = paramMode[1] === ParamMode.Immediate ? this.pos[this.pc + 2] : this.pos[this.pos[this.pc + 2]];
                if (p1 === 0) {
                    this.pc = p2;
                } else {
                    this.pc += 3;
                }
                break;
            }
            case 7: { // lt
                const p1 = paramMode[0] === ParamMode.Immediate ? this.pos[this.pc + 1] : this.pos[this.pos[this.pc + 1]];
                const p2 = paramMode[1] === ParamMode.Immediate ? this.pos[this.pc + 2] : this.pos[this.pos[this.pc + 2]];
                if (p1 < p2) {
                    this.pos[this.pos[this.pc + 3]] = 1;
                } else {
                    this.pos[this.pos[this.pc + 3]] = 0;
                }
                this.pc += 4;
                break;
            }
            case 8: { // eq
                const p1 = paramMode[0] === ParamMode.Immediate ? this.pos[this.pc + 1] : this.pos[this.pos[this.pc + 1]];
                const p2 = paramMode[1] === ParamMode.Immediate ? this.pos[this.pc + 2] : this.pos[this.pos[this.pc + 2]];
                if (p1 === p2) {
                    this.pos[this.pos[this.pc + 3]] = 1;
                } else {
                    this.pos[this.pos[this.pc + 3]] = 0;
                }
                this.pc += 4;
                break;
            }
            case 99: {
                this.state = RunState.Halted;
                break;
            }
            default: {
                console.log("Invalid opcode: " + opcode);
                throw Error("Invalid opcode");
            }
        }
    }
}

function generatePerm(k: number, arr: number[], results: number[][]) {
    if (k === 1) {
        results.push([...arr]);
    } else {
        for (let i = 0; i < k; i++) {
            generatePerm(k - 1, arr, results);

            if (k % 2 === 0) {
                [arr[i], arr[k - 1]] = [arr[k - 1], arr[i]];
            } else {
                [arr[0], arr[k - 1]] = [arr[k - 1], arr[0]];
            }
        }
    }
}

function propagate(ampOut: Intcode, ampIn: Intcode) {
    while (true) {
        const sig = ampOut.readOutp();
        if (sig != null) {
            ampIn.writeInp(sig);
        } else {
            break;
        }
    }
}

readFile("day07.input", "utf8", (error, data) => {
    const origPos = data.toString().split(",").map( (num) => {
        return +num;
    });

    // Part 1: without feedback
    // const start = [0, 1, 2, 3, 4];
    // Part 2: with feedback
    const start = [5, 6, 7, 8, 9];
    const allPerms: number[][] = [];
    generatePerm(start.length, start, allPerms);

    let maxAmp = 0;

    for (const perm of allPerms) {
        let amp = 0;

        const amps: Intcode[] = [];
        for (let i = 0; i < 5; i++) {
            amps[i] = new Intcode(origPos);
            amps[i].writeInp(perm[i]);
        }
        amps[0].writeInp(0);

        while (true) {
            amps[0].run();
            propagate(amps[0], amps[1]);
            amps[1].run();
            propagate(amps[1], amps[2]);
            amps[2].run();
            propagate(amps[2], amps[3]);
            amps[3].run();
            propagate(amps[3], amps[4]);
            amps[4].run();

            // filter output is stable if the last unit is halted
            if (amps[4].state === RunState.Halted) {
                // get the final output from the last amp
                let sig = null;
                while (true) {
                    const tmp = amps[4].readOutp();
                    if (tmp != null) {
                        sig = tmp;
                    } else {
                        break;
                    }
                }
                if (sig != null) {
                    amp = sig;
                }
                break;
            } else {
                // if not halted, feed back to first amp
                propagate(amps[4], amps[0]);
            }
        }

        console.log(perm, amp);
        if (amp > maxAmp) {
            maxAmp = amp;
        }
    }

    console.log("Max:", maxAmp);
});
