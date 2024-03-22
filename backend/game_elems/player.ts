///////////////////////////////////////////////
//  This file constains the class and method
//  definitions for users
//

import { Egg } from './egg';

const NUM_MONSTERS_ROSTER: number = 6;
const NUM_MONSTERS_BENCH: number = 120;
const NUM_EGGS = 20;

enum Difficulty {
    Easy = "EASY",
    Medium = "MEDIUM",
    Hard = "HARD",
    Expert = "EXPERT"
}

class Player {
    private name: string;   // Username
    private id: number;     // Actual user ID
    public monsters_roster: number[] = [];     // Monster ids to be used in fights
    public monsters_bench: number[] = [];      // Monster ids stored away for later
    public eggs: number[] = [];                // Egg ids that the user has
    public currently_hatching_egg: number | null = null;   // Egg that is currently being hatched
    private level: number = 1;
    private xp: number = 0;
    private difficulty: Difficulty = Difficulty.Easy;
    public current_game: number | null = null;

    // Loads in player data that matches 'id' if it exists,
    // Otherwise it creates new data.
    constructor(
        name: string, 
        id: number,
        monsters_roster: number[],
        monsters_bench: number[],
        eggs: number[],
        currently_hatching_egg: number | null,
        level: number,
        xp: number
    ) {
        this.name = name;
        this.id = id;
        this.monsters_roster = monsters_roster;
        this.monsters_bench = monsters_bench;
        this.eggs = eggs;
        this.currently_hatching_egg = currently_hatching_egg;
        this.level = level;
        this.xp = xp;
    }




    /////////////////////////////////////////////
    //          FETCHING PRIVATE DATA          //
    /////////////////////////////////////////////

    // This data is all private to prevent code from
    // directly modifying a struct's values (security)

    // This function returns the user's id
    public get_id(): number { return this.id }

    // This function returns the username
    public get_name(): string { return this.name }

    // This function returns the level of the user
    public get_level(): number { return this.level }

    // This function returns a user's xp
    public get_xp(): number { return this.xp }

    // This function returns the player's current difficulty level
    public get_difficulty(): Difficulty { return this.difficulty }

    // Checks if the roster is full
    private roster_full(): boolean { return this.monsters_roster.length >= NUM_MONSTERS_ROSTER }

    // Checks if the bench is full
    private bench_full(): boolean { return this.monsters_bench.length >= NUM_MONSTERS_BENCH }




    /////////////////////////////////////////////
    //         USER LEVEL AND XP MANIP         //
    /////////////////////////////////////////////

    // Returns the exact ammount of XP needed to level up
    // To modify the level progression, modify this function
    private xp2lvl_up(): number { return this.level * 100 - this.xp }

    // Use this function when adding to a player's XP
    // This function handles leveling up recursively
    public increase_xp(xp: number) {
        const level_up_xp = this.xp2lvl_up()      // The xp needed to level up (level up at level * 100 xp)
        if ((xp + this.xp) < level_up_xp) {
            this.xp += xp;
            return;
        }

        this.xp = 0;
        this.level += 1;
        this.increase_xp(xp - level_up_xp);
    }




    /////////////////////////////////////////////
    //            MONSTER DATA MANIP           //
    /////////////////////////////////////////////

    // NOTE: if any of these functions have null as an input, they do nothing

    // This function adds a monster's id to the player's roster of monsters
    // Returns null if the monster's id was added successfully
    // Returns the monster's id if the list is full
    public add2roster(monster_id: number | null): number | null {
        // Roster was full or null was supplied
        if (this.roster_full() || monster_id === null) { return monster_id }

        this.monsters_roster.push(monster_id);

        // Monster added successfully
        return null;
    }

    // This function adds a monster's id to the player's bench of monsters
    // Returns null if the monster's id was added successfully
    // Returns the monster's id if the list is full
    public add2bench(monster_id: number | null): number | null {
        // Bench was full or null was supplied
        if (this.bench_full() || monster_id === null) { return monster_id }

        this.monsters_bench.push(monster_id);

        // Monster added successfully
        return null;
    }

    // Removes a monster with a particular id from the roster
    // Returns the monster's id on success and null on failure
    public remove_from_roster(id: number | null): number | null {
        return null;
    }

    // Removes a monster with a particular id from the bench
    // Returns the monster's id on success and null on failure
    public remove_from_bench(id: number | null): number | null {
        return null;
    }
    
    // Takes a monster's id and moves it from the bench to the roster
    // Returns true on success and false on failure.
    // On failure the monster's id is placed back in the bench if one was ever found
    public bench2roster(id: number): boolean {
        return this.swap_monsters(id, null);
    }

    // Takes a monster's id and moves it from the roster to the bench
    // Returns true on success and false on failure.
    // On failure the monster's id is placed back in the roster if one was ever found
    public roster2bench(id: number): boolean {
        return this.swap_monsters(null, id);
    }

    // Swaps the position of two monsters's ids, one in the bench and one in the roster
    // Returns false if the swap fails and true if it succeeds.
    swap_monsters(bench_id: number | null, roster_id: number | null): boolean {
        const bench_mon: number | null = this.remove_from_bench(bench_id);
        if (bench_mon === null && bench_id !== null) { 
            return false;
        }

        const roster_mon: number | null = this.remove_from_roster(roster_id);
        if (roster_mon === null && roster_id !== null) { 
            this.add2bench(bench_mon);
            return false;
        }

        const bench_insert_result = this.add2bench(roster_mon);
        if (bench_insert_result !== null && roster_id !== null) {
            this.add2bench(bench_mon);
            this.add2roster(bench_insert_result);
            return false;
        }

        const roster_insert_result = this.add2roster(bench_mon);
        if (roster_insert_result !== null && bench_id !== null) {
            const temp = this.remove_from_bench(roster_id);
            this.add2roster(temp);
            this.add2bench(roster_insert_result);
            return false;
        }

        return true;
    }




    /////////////////////////////////////////////
    //              EGG DATA MANIP             //
    /////////////////////////////////////////////

    public new_egg(): boolean {
        // Not enough space
        if (this.eggs.length >= NUM_EGGS) { return false }

        // Create a new egg and add it to the list
        return true;
    }

    public start_hatch_egg(id: number): boolean {
        // There is already an egg hatching
        if (this.currently_hatching_egg !== null) { return false }

        // TODO GET EGG FROM DB

        return false;
    }

    public hatch_egg(): boolean {
        // No egg to finish hatching
        if (this.currently_hatching_egg !== null) { return false }

        return false;
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



interface PlayerRow {
    name: string;   
    id: number; 
    monsters_roster: number[];
    monsters_bench: number[];
    eggs: number[];
    currently_hatching_egg: number | null;
    level: number;
    xp: number;
}

function row2player(row: PlayerRow): Player {
    return new Player(
        row.name,
        row.id,
        row.monsters_roster,
        row.monsters_bench,
        row.eggs,
        row.currently_hatching_egg,
        row.level,
        row.xp  
    );
}

function player2row(player: Player): PlayerRow {
    return {
        name: player.get_name(),
        id: player.get_id(),
        monsters_roster: player.monsters_roster,
        monsters_bench: player.monsters_bench,
        eggs: player.eggs,
        currently_hatching_egg: player.currently_hatching_egg,
        level: player.get_level(),
        xp: player.get_xp()  
    }
}

export { 
    Player,
    PlayerRow,
    Difficulty,
    row2player,
    player2row
}
