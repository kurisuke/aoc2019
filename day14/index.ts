import { readFile } from "fs";

interface Reactant {
    name: string;
    qty: number;
}

interface Reaction {
    inputs: Reactant[];
    productQty: number;
}

type Reactions = {[productName: string]: Reaction};
type Stockpile = {[productName: string]: number};

function parseReactions(input: string) {
    const reactions: Reactions = {};
    for (const line of input.split("\n")) {
        const inputStr = line.split("=>")[0]!.trim();
        const outputStr = line.split("=>")[1]!.trim();

        const inputs: Reactant[] = inputStr.split(",").map((chemStr) => {
            const qty = Number(chemStr.trim().split(" ")[0]!);
            const name = chemStr.trim().split(" ")[1]!;
            return {name, qty};
        });

        const productQty = Number(outputStr.trim().split(" ")[0]!);
        const productName = outputStr.trim().split(" ")[1]!;

        reactions[productName] = {inputs, productQty};
    }

    return reactions;
}

function produce(reactions: Reactions, stockpile: Stockpile, required: Reactant) {
    // first special case: ore
    if (required.name === "ORE") {
        return required.qty;
    }

    // first use the stuff we have on stock
    if (stockpile[required.name] === undefined) {
        stockpile[required.name] = 0;
    }
    const reuse = Math.min(required.qty, stockpile[required.name]);
    const netQty = required.qty - reuse;
    stockpile[required.name] -= reuse;

    // if not, we have to produce a certain net quantity (that we cannot take from the stockpile)
    const reaction = reactions[required.name]!;
    const eqFactor = Math.ceil(netQty / reaction.productQty);

    // now we need to produce our requirements
    let ore = 0;
    for (const input of reaction.inputs) {
        const inputReq = eqFactor * input.qty;
        ore += produce(reactions, stockpile, {name: input.name, qty: inputReq});
    }

    // put excess on the stockpile
    const excess = eqFactor * reaction.productQty - netQty;
    stockpile[required.name] += excess;

    return ore;
}

readFile("day14.input", "utf8", (error, data) => {
    const reactions = parseReactions(data.toString());

    // part 1
    const stockpile: Stockpile = {};
    console.log(produce(reactions, stockpile, {name: "FUEL", qty: 1}));

    // part 2
    let fuelMin = 0;
    let fuelMax = 2 ** 63;
    const targetOre = 1000000000000;

    while ((fuelMax - fuelMin) > 1) {
        const pivot = Math.floor((fuelMax + fuelMin) / 2);
        const stockpile2: Stockpile = {};
        const ore = produce(reactions, stockpile2, {name: "FUEL", qty: pivot});
        if (ore > targetOre) {
            fuelMax = pivot;
        } else if (ore < targetOre) {
            fuelMin = pivot;
        } else if (ore === targetOre) {
            fuelMax = pivot;
            fuelMin = pivot;
        }
    }

    console.log(fuelMin);
});
