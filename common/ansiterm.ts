export { clearScreen, cursorTo };

const ESC = "\u001B[";

function clearScreen() {
    return ESC + "2J" + ESC + "0f";
}

function cursorTo(x: number, y: number) {
    return ESC + String(y + 1) + ";" + String(x + 1) + "H";
}
