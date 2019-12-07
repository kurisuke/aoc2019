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
    console.log(countOrbits(orbObjs));
});
