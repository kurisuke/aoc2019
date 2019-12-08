import { readFile } from "fs";

const IMG_WIDTH = 25;
const IMG_HEIGHT = 6;

const layerSize = IMG_WIDTH * IMG_HEIGHT;

type Histogram = { [id: string]: number; };

function createHisto(ls: string) {
    const h: Histogram = {};

    // initialize fields
    for (const c of "0123456789".split("")) {
        h[c] = 0;
    }

    // count occurences
    for (const c of ls) {
        h[c]++;
    }

    return h;
}

readFile("day08.input", "utf8", (error, data) => {
    const layers: Histogram[] = [];

    for (let i = 0; i < data.length; i += layerSize) {
        layers.push(createHisto(data.substr(i, layerSize)));
    }

    const minIdx = layers.reduce((lowest, next, idx) => next["0"] < layers[lowest]["0"] ? idx : lowest, 0);
    console.log(layers[minIdx]["1"] * layers[minIdx]["2"]);
});
