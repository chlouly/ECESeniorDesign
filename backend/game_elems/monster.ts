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

class Monster {
    name: string;
    id: number;
    level: number = 1;
    xp: number = 0;
    health: number = 100;
    evolution_number: number = 1;
    type: MonsterType;
    // Add in some sort of defense and attack

    constructor(
        name: string,
        id: number, 
        level: number | null,
        xp: number | null, 
        health: number | null,
        evolution: number | null,
        type: MonsterType, 
    ) {
        this.id = id;
        this.name = name;
        if (level !== null) { this.level = level; }
        if (xp !== null) { this.xp = xp; }
        if (health !== null) { this.health = health; }
        if (evolution !== null) { this.evolution_number = evolution; }
        this.type = type;
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



// Makeshift ORM for the database
interface MonsterRow {
    name: string;
    id: number;
    level: number;
    xp: number;
    health: number;
    evolution_number: number;
    type: number;
}

function row2monster(row: MonsterRow): Monster {
    return new Monster (
        row.name,
        row.id,
        row.level,
        row.xp,
        row.health,
        row.evolution_number,
        row.type as MonsterType
    );
}

function monster2row(monster: Monster): MonsterRow {
    return {
        name: monster.name,
        id: monster.id,
        level: monster.level,
        xp: monster.xp,
        health: monster.health,
        evolution_number: monster.evolution_number,
        type: monster.type
    }
}


export { 
    Monster,
    MonsterType,
    MonsterRow,
    row2monster,
    monster2row
}
