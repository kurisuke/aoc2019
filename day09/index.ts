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

class IntcodeMem {
    private mem: { [a: string]: bigint; };

    constructor(init: bigint[]) {
        this.mem = {};
        init.forEach((val, idx) => {
            this.mem[String(idx)] = val;
        });
    }

    public load(a: bigint) {
        // set uninitialized memory to 0
        if (this.mem[String(a)] === undefined) {
            this.mem[String(a)] = 0n;
        }
        return this.mem[String(a)];
    }

    public store(a: bigint, v: bigint) {
        this.mem[String(a)] = v;
    }
}

enum RunState {
    Halted,
    Running,
    Blocked,
    Error,
}

class Intcode {
    public state: RunState;

    private mem: IntcodeMem;
    private pc: bigint;
    private inp: bigint[];
    private outp: bigint[];
    private relBase: bigint;

    constructor(pos: bigint[]) {
        this.mem = new IntcodeMem(pos);
        this.pc = 0n;
        this.inp = [];
        this.outp = [];
        this.state = RunState.Halted;
        this.relBase = 0n;
    }

    public reset(pos: bigint[]) {
        this.mem = new IntcodeMem(pos);
        this.pc = 0n;
        this.inp = [];
        this.outp = [];
        this.state = RunState.Halted;
        this.relBase = 0n;
    }

    public writeInp(n: bigint) {
        this.inp.push(n);
    }

    public readOutp() {
        if (this.outp.length > 0) {
            return this.outp.shift()!;
        } else {
            return undefined;
        }
    }

    public run() {
        this.state = RunState.Running;
        while (this.state === RunState.Running) {
            try {
                this.op();
            } catch (e) {
                console.log("Error:", e);
                this.state = RunState.Error;
                return;
            }
        }
    }

    private getAddr(n: number, opcode: bigint, aIn: bigint) {
        const mode = opcode / BigInt(10 ** (n + 2)) % 10n;
        let aOut = 0n;
        switch (mode) {
            case 0n: { // Positional: address from reg
                aOut = this.mem.load(aIn);
                break;
            }
            case 1n: { // Immediate (literal) from reg
                aOut = aIn;
                break;
            }
            case 2n: { // Relative: base offset + address from reg
                aOut = this.relBase + this.mem.load(aIn);
                break;
            }
            default: {
                console.log("Invalid parameter mode: " + mode);
                throw Error("Invalid parameter mode");
            }
        }
        return aOut;
    }

    private op() {
        const opcode = this.mem.load(this.pc);

        switch (opcode % 100n) {
            case 1n: {
                const p1 = this.mem.load(this.getAddr(0, opcode, this.pc + 1n));
                const p2 = this.mem.load(this.getAddr(1, opcode, this.pc + 2n));
                this.mem.store(this.getAddr(2, opcode, this.pc + 3n), p1 + p2);
                this.pc += 4n;
                break;
            }
            case 2n: {
                const p1 = this.mem.load(this.getAddr(0, opcode, this.pc + 1n));
                const p2 = this.mem.load(this.getAddr(1, opcode, this.pc + 2n));
                this.mem.store(this.getAddr(2, opcode, this.pc + 3n), p1 * p2);
                this.pc += 4n;
                break;
                break;
            }
            case 3n: {
                if (this.inp.length === 0) { // no input, blocked
                    this.state = RunState.Blocked;
                } else {
                    this.mem.store(this.getAddr(0, opcode, this.pc + 1n), this.inp.shift()!);
                    this.pc += 2n;
                }
                break;
            }
            case 4n: {
                const p1 = this.mem.load(this.getAddr(0, opcode, this.pc + 1n));
                this.outp.push(p1);
                this.pc += 2n;
                break;
            }
            case 5n: { // jnz
                const p1 = this.mem.load(this.getAddr(0, opcode, this.pc + 1n));
                const p2 = this.mem.load(this.getAddr(1, opcode, this.pc + 2n));
                if (p1 !== 0n) {
                    this.pc = p2;
                } else {
                    this.pc += 3n;
                }
                break;
            }
            case 6n: { // jz
                const p1 = this.mem.load(this.getAddr(0, opcode, this.pc + 1n));
                const p2 = this.mem.load(this.getAddr(1, opcode, this.pc + 2n));
                if (p1 === 0n) {
                    this.pc = p2;
                } else {
                    this.pc += 3n;
                }
                break;
            }
            case 7n: { // lt
                const p1 = this.mem.load(this.getAddr(0, opcode, this.pc + 1n));
                const p2 = this.mem.load(this.getAddr(1, opcode, this.pc + 2n));
                const res = p1 < p2 ? 1n : 0n;
                this.mem.store(this.getAddr(2, opcode, this.pc + 3n), res);
                this.pc += 4n;
                break;
            }
            case 8n: { // eq
                const p1 = this.mem.load(this.getAddr(0, opcode, this.pc + 1n));
                const p2 = this.mem.load(this.getAddr(1, opcode, this.pc + 2n));
                const res = p1 === p2 ? 1n : 0n;
                this.mem.store(this.getAddr(2, opcode, this.pc + 3n), res);
                this.pc += 4n;
                break;
            }
            case 9n: { // modify relbase
                const p1 = this.mem.load(this.getAddr(0, opcode, this.pc + 1n));
                this.relBase += p1;
                this.pc += 2n;
                break;
            }
            case 99n: {
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

readFile("day09.input", "utf8", (error, data) => {
    const origPos = data.toString().split(",").map( (num) => {
        return BigInt(num);
    });

    const computer = new Intcode([]);
    [1n, 2n].forEach((n) => {
        computer.reset(origPos);
        computer.writeInp(n);
        computer.run();

        while (true) {
            const o = computer.readOutp();
            if (o !== undefined) {
                console.log(o);
            } else {
                break;
            }
        }
    });
});
