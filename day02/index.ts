import { readFile } from "fs";

// apply opcode
//
// 1 - add *(+1), *(+2) -> *(+3)
// 2 - mul *(+1), *(+2) -> *(+3)
// 99 - halt

function op(pos: number[], offset: number) {
    const opcode = pos[offset];
    switch (opcode) {
        case 1: {
            pos[pos[offset + 3]] = pos[pos[offset + 1]] + pos[pos[offset + 2]];
            break;
        }
        case 2: {
            pos[pos[offset + 3]] = pos[pos[offset + 1]] * pos[pos[offset + 2]];
            break;
        }
        case 99: {
            return true;
        }
        default: {
            throw Error("Invalid opcode: ${opcode}");
        }
    }
    return false;
}

function printPos(pos: number[]) {
    for (let offset = 0; offset < pos.length; offset += 4) {
        console.log(pos[offset] + "," +
                    pos[offset + 1] + "," +
                    pos[offset + 2] + "," +
                    pos[offset + 3]);
    }
}

readFile("day02.input", "utf8", (error, data) => {
    const origPos = data.toString().split(",").map( (num) => {
        return +num;
    });

    const target = 19690720;

    for (let noun = 0; noun < 100; noun++) {
        for (let verb = 0; verb < 100; verb++) {
            // reset memory (pos) to initial state
            const pos = [...origPos];

            pos[1] = noun;
            pos[2] = verb;

            for (let offset = 0; offset < pos.length; offset += 4) {
                try {
                    // break if halt (opcode 99) is reached
                    if (op(pos, offset)) {
                        break;
                    }
                } catch (e) {
                    break;
                }
            }

            if (pos[0] === target) {
                console.log(100 * noun + verb);
                process.exit();
            }
        }
    }
});
