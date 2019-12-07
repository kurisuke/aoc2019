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

// there must be one sequence of same digits with _exactly_ length 2
function checkAdj2(digits: number[]) {
    let len = 1;
    for (let j = 0; j < digits.length - 1; j++) {
        if (digits[j] === digits[j + 1]) {
            len++;
        } else { // end of sequence, check length
            if (len === 2) {
                return true;
            }
            len = 1;
        }
    }

    // check again at end of the loop
    if (len === 2) {
        return true;
    } else {
        return false;
    }
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
    if (checkAdj2(digits) && checkAsc(digits)) {
        count++;
    }
}

console.log(count);
