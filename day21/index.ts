import { readFile } from "fs";

import { Intcode } from "../common/intcode";

readFile("day21.input", "utf8", (_, data) => {
    const intcodeProg = data.toString().split(",").map((num) => {
        return BigInt(num);
    });

    const c = new Intcode(intcodeProg);

    readFile("day21.jumpscript", "utf8", (__, js) => {

        c.writeInpAscii(js.toString());

        c.run();

        const a = c.readOutpAll();
        const o = a.reduce((s, ch) => s + String.fromCharCode(Number(ch)), "");

        if (o.indexOf("across") >= 0) {
            console.log(o);
        } else {
            console.log(a[a.length - 1]);
        }
    });
});
