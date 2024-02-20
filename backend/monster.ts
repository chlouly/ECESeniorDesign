///////////////////////////////////////////////
//  This file constains the class and method
//  definitions for monsters
//

const MAX_LEVEL = 100;

enum MonsterType {
    Common,
    Rare,
    Epic,
    Legendary,
    //DEV,        // Only for developer testing
}

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

class Monster {
    name: string;
    id: number;
    level: number = 1;
    xp: number = 0;
    health: number = 100;
    evolution_number: number = 1;
    type: MonsterType;
    // Add in some sort of defense and attack

    constructor(name: string, monster_id: number, player_id: number | null, type: MonsterType) {
        // Check database for this player's id
        // if the id exists and they hace this monster, load in the 
        // struct data from the database.
        // if none exists, create a new instance as follows:


        this.type = type;
        this.name = name;
        this.id = monster_id;
    }




    /////////////////////////////////////////////
    //        MONSTER LEVEL AND XP MANIP       //
    /////////////////////////////////////////////

    // Returns the exact ammount of XP needed to level up
    // To modify the level progression, modify this function
    xp2lvl_up(): number { return this.level * 100 - this.xp }

    // Use this function when adding to a player's XP
    // This function handles leveling up recursively
    public increase_xp(xp: number) {
        // Level cappend at MAX_LEVEL
        if (this.level >= MAX_LEVEL) {
            this.xp = 0;
            return;
        }

        // The xp needed to level up (level up at level * 100 xp)
        const level_up_xp = this.xp2lvl_up()

        // BASE CASE, the new xp is not enough to level up
        if ((xp + this.xp) < level_up_xp) {
            this.xp += xp;
            return;
        }

        this.xp = 0;
        this.level += 1;

        // TODO - ADD INCREASES TO ATTACK AND DEFENSE HERE

        // Evolve the monster if it reaches level 33 or 66
        if (this.level === 33 || this.level === 66) { this.evolve() }

        this.increase_xp(xp - level_up_xp);
    }

    // Evolves the monster.
    evolve() {
        this.evolution_number += 1;
    }


    // Saves all user data to the database
    // Returns true upon success, returns false on failure
    public save2db(): boolean {
        // TODO
        // Save user data to the database
        // retrun true on success and false on failure

        return true;
    }
}



class Egg {
    type: MonsterType;
    hatch_start_time: Date | null;

    // TODO
    // WE WILL HAVE THE THREE IMAGES FROM THE THREE EVOLUTIONS HERE
    // THey will be made before hand so that it doesnt take forever when hatching.


    constructor(type: MonsterType | null) {
        this.type = this.chooseEggType(type);
        this.hatch_start_time = null;

        // TODO
        // GET IMAGES FROM DALL-E
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

        return new Monster(name, id, player_id, this.type)
    }
}

export { 
    Monster,
    Egg
}
