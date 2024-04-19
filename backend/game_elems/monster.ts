///////////////////////////////////////////////
//  This file constains the class and method
//  definitions for monsters
//

import { ResCode } from "../error";
import { update_monster } from "../rds_actions";

const MAX_LEVEL = 100;
const MAX_HEALTH = 100;

// Returns a 
function img_string(id: number, evolution: number): string { return `m${id}_${evolution}.`; }

enum MonsterType {
    Common,
    Rare,
    Epic,
    Legendary,
    //DEV,        // Only for developer testing
}

class Monster {
    // Monster Data
    name: string;
    id: number;
    level: number = 1;
    xp: number = 0;
    health: number = MAX_HEALTH;
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
        // Level capped at MAX_LEVEL
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

        // Evolve the monster if it reaches level 33 or 66
        if (this.level === 33 || this.level === 66) { this.evolve() }

        this.increase_xp(xp - level_up_xp);
    }

    // Adds a quarter of the max heath back to the monster
    public heal() {
        // TODO: Make a better healing algorithm
        this.health += MAX_HEALTH / 4;
        this.health = (this.health > MAX_HEALTH)? MAX_HEALTH : this.health;
    }

    // Evolves the monster.
    private evolve() {
        if (this.evolution_number < 3) {
            this.evolution_number += 1;
        }
    }

    // Returns the monster's image at its current evolution
    public get_img(): string {
        return img_string(this.id, this.evolution_number);
    }

    // Gets the monster data to be returned in an API call
    public get_data(): MonsterRow {
        const data: MonsterRow = monster2row(this);
        data.img = this.get_img();

        return data;
    }

    // Saves all monster data to the database
    public async save2db(p_id: number): Promise<ResCode> {
        // Save user data to the database
        return await update_monster(p_id, this);
    }
}

// Makeshift ORM for the database
// Also used as API responses
interface MonsterRow {
    name: string;
    id: number;
    level: number;
    xp: number;
    health: number;
    evolution_number: number;
    type: number;
    img: string | null;    // image code
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
        type: monster.type,
        img: null   // We do not store the image code in the db
    }
}


export { 
    Monster,
    MonsterType,
    MonsterRow,
    row2monster,
    monster2row
}
