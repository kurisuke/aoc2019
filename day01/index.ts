import { readFile } from 'fs';

// PART 01
function fuel(mass:number) {
    return Math.max(Math.floor(mass / 3) - 2, 0);
}

const fileLines = readFile('day01.input', 'utf8', function(error, data) {
    // read stage masses from file (one per line)
    const stageMasses = data.toString().split("\n").map( function(line) {
	return +line;
    });

    // calculate fuel requirements for each stage
    const stageFuels = stageMasses.map(fuel);

    // calculate total fuel requirements (summarize all stages)
    const totalFuel = stageFuels.reduce((acc, fuel) => acc + fuel, 0);

    console.log(totalFuel);

    // PART 02: fuel is mass itself
    const stageFuels2 = stageMasses.map( function(initMass) {
	let stageFuel = 0;
	let mass = initMass;
	while (true)
	{
	    const fuelInc = fuel(mass);
	    if (fuelInc > 0)
	    {
		stageFuel += fuelInc;
		mass = fuelInc;
	    }
	    else
	    {
		break;
	    }
	}
	return stageFuel;
    });
    
    const totalFuel2 = stageFuels2.reduce((acc, fuel) => acc + fuel, 0);

    console.log(totalFuel2);
});
