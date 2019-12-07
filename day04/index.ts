const rangeMin = 168630;
const rangeMax = 718098;

function checkAdj(digits: number[]) {
    for (let j = 0; j < digits.length - 1; j++) {
        if (digits[j] === digits[j + 1]) {
            return true;
        }
    }
    return false;
}

function checkAsc(digits: number[]) {
    for (let j = 0; j < digits.length - 1; j++) {
        if (digits[j + 1] < digits[j]) {
            return false;
        }
    }
    return true;
}

let count = 0;

for (let i = rangeMin; i <= rangeMax; i++) {
    const digits = String(i).split("").map((c) => Number(c));
    if (checkAdj(digits) && checkAsc(digits)) {
        count++;
    }
}

console.log(count);
