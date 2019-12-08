import { readFile } from "fs";

const IMG_WIDTH = 25;
const IMG_HEIGHT = 6;

const layerSize = IMG_WIDTH * IMG_HEIGHT;

type Histogram = { [id: string]: number; };

function createHisto(ls: string) {
    const h: Histogram = {};

    // count occurences
    for (const c of ls) {
        h[c] = h[c] === undefined ? 0 : h[c] + 1;
    }

    return h;
}

readFile("day08.input", "utf8", (error, data) => {

    // part 1
    const layers: Histogram[] = [];
    for (let i = 0; i < data.length; i += layerSize) {
        layers.push(createHisto(data.substr(i, layerSize)));
    }

    const minIdx = layers.reduce((lowest, next, idx) => next["0"] < layers[lowest]["0"] ? idx : lowest, 0);
    console.log(layers[minIdx]["1"] * layers[minIdx]["2"]);

    // part 2
    const pixelLayers: string[][] = [];
    for (let i = 0; i < layerSize; i++) {
        pixelLayers.push([]);
    }

    // split input per pixel: store an array of layer values for each pixel
    data.split("").forEach((c, idx) => pixelLayers[idx % layerSize].push(c));

    const pixels = pixelLayers.map((pixel) => {
        let p = "2";
        // iterate over layer values from top layer, until a non-transparent pixel is found
        for (const l of pixel) {
            if (l !== "2") {
                p = l;
                break;
            }
        }
        return p;
    });

    // convert for pretty printing
    // black / white inverted for better readability on black terminal
    const printTransform: { [key: string]: string; } = {
        0: " ", // black
        1: "#", // white
        2: ".",
    };
    const printPixels = pixels.map((c) => printTransform[Number(c)]);

    // pretty print line per line
    for (let i = 0; i < printPixels.length; i += IMG_WIDTH) {
        console.log(printPixels.slice(i, i + IMG_WIDTH).join(""));
    }
});
