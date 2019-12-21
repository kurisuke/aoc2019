import { readFile } from "fs";

function coeff(x: number, k: number) {
    return Math.floor((x + k + 2) / (k + 1) % 4 - 1) % 2;
}

function part1(nums: number[]) {
    const ITERS = 100;

    for (let i = 0; i < ITERS; i++) {
        for (let k = 0; k < nums.length; k++) {
            let tmp = 0;
            for (let x = k; x < nums.length; x++) {
                tmp += coeff(x, k) * nums[x];
            }
            nums[k] = Math.abs(tmp) % 10;
        }
    }

    console.log(nums.slice(0, 8).join(""));
}

readFile("day16.input", "utf8", (_, data) => {
    const nums: number[] = data.split("").map((n) => Number(n));
    part1(nums);
});
