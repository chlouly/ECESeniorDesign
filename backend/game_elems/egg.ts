import { Monster, MonsterType } from './monster';

function getHatchDuration(type: MonsterType): number {
    let time: number = 0;

    // Getting the time to hatch in hours
    switch (type) {
        case (MonsterType.Common):
            time = 1;
            break;
        case (MonsterType.Rare):
            time = 2;
            break;
        case (MonsterType.Epic):
            time = 4;
            break;
        case (MonsterType.Legendary):
            time = 8;
            break;
    }

    return time * 60 * 60 * 1000;
}

class Egg {
    type: MonsterType;
    id: number;
    hatch_start_time: Date | null;

    // TODO
    // WE WILL HAVE THE THREE IMAGES FROM THE THREE EVOLUTIONS HERE
    // THey will be made before hand so that it doesnt take forever when hatching.


    constructor(
        id: number, 
        type: MonsterType | null,
        hatch_start: Date | null,
    ) {
        this.type = this.chooseEggType(type);
        this.hatch_start_time = hatch_start;
        this.id = id;
    }

    chooseEggType(type: MonsterType | null): MonsterType {
        if (type !== null) { return type }

        const num = Math.floor(Math.random() * 100);

        if (num === 100) { return MonsterType.Legendary }       // 1/100 change of getting legendary
        else if (num % 25 === 0) { return MonsterType.Epic }    // 1/25 chance of getting epic
        else if (num % 10 === 0) { return MonsterType.Epic }    // 1/10 chance of getting rare
        else { return MonsterType.Common }                      // All other eggs are common
    }

    isReady2Hatch(): Boolean {
        if (!this.hatch_start_time) { return false }

        const elapsed = (new Date()).getTime() - this.hatch_start_time.getTime();
        return elapsed >= getHatchDuration(this.type);
    }

    beginHatching() {
        this.hatch_start_time = new Date();
    }

    hatch(): Monster | null {
        if (!this.isReady2Hatch()) { return null }

        // TODO
        // THESE ARE HARDCODED FOR NOW
        let name: string = 'chad';
        let id: number = 12345;
        let player_id: number = 678910;

        // TODO
        // Transfer images to the new monster

        return new Monster(name, id, null, null, null, null, this.type);
    }


}


// Makeshift ORM for the database
interface EggRow {
    type: number;
    id: number;
    hatch_start_time: number | null;
}

function egg2row(egg: Egg): EggRow {
    let row : EggRow = {
        type: egg.type,
        id: egg.id,
        hatch_start_time: null,
    };

    if (egg.hatch_start_time !== null) { 
        row.hatch_start_time = egg.hatch_start_time.getTime() 
    }

    return row;
}

function row2egg(row: EggRow): Egg {
    return new Egg(
        row.id,
        row.type as MonsterType,
        (row.hatch_start_time === null)? null : new Date(row.hatch_start_time)
    )
}

export { 
    Egg,
    EggRow,
    row2egg,
    egg2row
}
