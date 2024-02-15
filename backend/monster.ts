///////////////////////////////////////////////
//  This file constains the class and method
//  definitions for monsters
//

const MAX_LEVEL = 100;

class Monster {
    name: string;
    id: string;
    level: number = 1;
    xp: number = 0;
    health: number = 100;
    evolution_number: number = 1;
    // Add in some sort of defense and attack

    constructor(name: string, monster_id: string, player_id: string) {
        // Check database for this player's id
        // if the id exists and they hace this monster, load in the 
        // struct data from the database.
        // if none exists, create a new instance as follows:

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
        // TODO - 
        // Make an API call to dall-e to create a new image of the monster
        // Maybe add a new move

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

export { Monster }
