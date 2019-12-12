import { Vec3D } from "../common/vec3d";

const INITIAL = [
    new Vec3D(-7, 17, -11),
    new Vec3D(9, 12, 5),
    new Vec3D(-9, 0, -4),
    new Vec3D(4, 6, 0),
];

interface IBodyParams {
    pos: Vec3D;
    vel: Vec3D;
}

type ISystem = IBodyParams[];

function copy(syst: ISystem) {
    const sysN: ISystem = [];
    for (const body of syst) {
        const [xp, yp, zp] = body.pos.asTup();
        const [xv, yv, zv] = body.vel.asTup();
        sysN.push({pos: new Vec3D(xp, yp, zp), vel: new Vec3D(xv, yv, zv)});
    }
    return sysN;
}

function stateX(syst: ISystem) {
    return syst.map((body) => String(body.pos.x) + String(body.vel.x)).join(",");
}

function stateY(syst: ISystem) {
    return syst.map((body) => String(body.pos.y) + String(body.vel.y)).join(",");
}

function stateZ(syst: ISystem) {
    return syst.map((body) => String(body.pos.z) + String(body.vel.z)).join(",");
}

function applyG(oldBody1: IBodyParams, oldBody2: IBodyParams, newBody1: IBodyParams, newBody2: IBodyParams) {
    if (oldBody1.pos.x < oldBody2.pos.x) {
        newBody1.vel.x += 1;
        newBody2.vel.x -= 1;
    } else if (oldBody1.pos.x > oldBody2.pos.x) {
        newBody1.vel.x -= 1;
        newBody2.vel.x += 1;
    }

    if (oldBody1.pos.y < oldBody2.pos.y) {
        newBody1.vel.y += 1;
        newBody2.vel.y -= 1;
    } else if (oldBody1.pos.y > oldBody2.pos.y) {
        newBody1.vel.y -= 1;
        newBody2.vel.y += 1;
    }

    if (oldBody1.pos.z < oldBody2.pos.z) {
        newBody1.vel.z += 1;
        newBody2.vel.z -= 1;
    } else if (oldBody1.pos.z > oldBody2.pos.z) {
        newBody1.vel.z -= 1;
        newBody2.vel.z += 1;
    }
}

function update(syst: ISystem) {
    const newSyst = copy(syst);

    // apply gravity: update veolocities
    for (let i = 0; i < syst.length; i++) {
        for (let j = i + 1; j < syst.length; j++) {
            applyG(syst[i], syst[j], newSyst[i], newSyst[j]);
        }
    }

    // update positions
    for (const body of newSyst) {
        body.pos.add(body.vel);
    }

    return newSyst;
}

function totalEnergy(syst: ISystem) {
    let e = 0;
    for (const body of syst) {
        const pot = Math.abs(body.pos.x) + Math.abs(body.pos.y) + Math.abs(body.pos.z);
        const kin = Math.abs(body.vel.x) + Math.abs(body.vel.y) + Math.abs(body.vel.z);
        e += pot * kin;
    }
    return e;
}

function gcd(a: number, b: number) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

let sys =
    [{pos: new Vec3D(-7, 17, -11), vel: new Vec3D(0, 0, 0)},
     {pos: new Vec3D(9, 12, 5), vel: new Vec3D(0, 0, 0)},
     {pos: new Vec3D(-9, 0, -4), vel: new Vec3D(0, 0, 0)},
     {pos: new Vec3D(4, 6, 0), vel: new Vec3D(0, 0, 0)}];

const sysInit = copy(sys);
const [stateXInit, stateYInit, stateZInit] = [
    stateX(sysInit), stateY(sysInit), stateZ(sysInit),
];
let [periodX, periodY, periodZ] = [-1, -1, -1];

let steps = 0;
while (periodX === -1 || periodY === -1 || periodZ === -1) {
    sys = update(sys);
    steps++;

    if (steps === 1000) {
        console.log(totalEnergy(sys));
    }

    // each dimension (x,y,z) is independent of the others, as there is no
    // cross-calculation of the values.
    // get the state vector (positions & velocities) for each dimension
    const [stateXNow, stateYNow, stateZNow] = [
        stateX(sys), stateY(sys), stateZ(sys),
    ];

    // check if we have reached the initial state again in one of the 3 dims
    periodX = periodX === -1 && stateXNow === stateXInit ? steps : periodX;
    periodY = periodY === -1 && stateYNow === stateYInit ? steps : periodY;
    periodZ = periodZ === -1 && stateZNow === stateZInit ? steps : periodZ;
}

// total period over all 3 dims will be the LCM of the 3 periods
const totalPeriod = [periodX, periodY, periodZ].reduce((a, i) => a * i / gcd(a, i), periodX);
console.log(totalPeriod);
