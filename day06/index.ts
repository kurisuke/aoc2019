import { readFile } from "fs";

interface IOrbObj {
    parent: string | null;
}

type OrbObjs = { [id: string]: IOrbObj; };

function countOrbits(orbObjs: OrbObjs) {
    let totalCount = 0;
    for (const orbObj of Object.values(orbObjs)) {
        let tmp = orbObj;
        let tmpCount = 0;
        while (tmp.parent != null) {
            tmp = orbObjs[tmp.parent];
            tmpCount++;
        }
        totalCount += tmpCount;
    }
    return totalCount;
}

function numTransfers(orbObjs: OrbObjs, o1: string, o2: string) {
    // create a list of all ancestors for both objects
    let tmp1 = orbObjs[o1];
    const anc1: string[] = [];
    while (tmp1.parent != null) {
        anc1.push(tmp1.parent);
        tmp1 = orbObjs[tmp1.parent];
    }

    let tmp2 = orbObjs[o2];
    const anc2: string[] = [];
    while (tmp2.parent != null) {
        anc2.push(tmp2.parent);
        tmp2 = orbObjs[tmp2.parent];
    }

    // find lowest common ancestor
    // i = number of traversals in first subtree
    let i = 0;
    let lca = null;
    for (; i < anc1.length; i++) {
        if (anc2.includes(anc1[i])) {
            lca = anc1[i];
            break;
        }
    }

    // get number of traversals in other sub-tree (j)
    let j = 0;
    for (; j < anc2.length; j++) {
        if (anc2[j] === lca) {
            break;
        }
    }

    // total number of orbit transfers (= traversals) is the sum
    return i + j;
}

readFile("day06.input", "utf8", (error, data) => {
    const orbObjs: OrbObjs = {};
    const orbits = data.toString().split("\n");
    for (const orbit of orbits) {
        const [parentStr, childStr, ...rem] = orbit.split(")");
        orbObjs[childStr] = { parent: parentStr };
        if (!(parentStr in orbObjs)) {
            orbObjs[parentStr] = { parent: null };
        }
    }
    // console.log(countOrbits(orbObjs));
    console.log(numTransfers(orbObjs, "YOU", "SAN"));
});
