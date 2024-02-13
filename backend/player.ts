///////////////////////////////////////////////
//  This file constains the class and method
//  definitions for users
//

import { Monster } from './monster';

const NUM_MONSTERS_ROSTER: number = 6;
const NUM_MONSTERS_BENCH: number = 120;

class Player {
    private name: string;   // Username
    private id: string;     // Actual user ID
    private monsters_roster: Monster[] = [];    // Monsters to be used in fights
    private monsters_bench: Monster[] = [];    // Monsters stored away for later
    private level: number = 1;
    private xp: number = 0;

    // Loads in player data that matches 'id' if it exists,
    // Otherwise it creates new data.
    constructor(name: string, id: string) {
        // TODO
        // Check database for this id
        // if one exists, load in the struct data from the database
        // if none exists, create a new instance as follows:

        this.name = name;
        this.id = id;
    }




    /////////////////////////////////////////////
    //          FETCHING PRIVATE DATA          //
    /////////////////////////////////////////////

    // This data is all private to prevent code from
    // directly modifying a struct's values (security)

    // This function returns the user's id
    public get_id(): string { return this.id }

    // This function returns the username
    public get_name(): string { return this.name }

    // This function returns the level of the user
    public get_level(): number { return this.level }

    // This function returns a user's xp
    public get_xp(): number { return this.xp }

    // Checks if the roster is full
    private roster_full(): boolean { return this.monsters_roster.length < NUM_MONSTERS_ROSTER }

    // Checks if the bench is full
    private bench_full(): boolean { return this.monsters_bench.length < NUM_MONSTERS_BENCH }




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

    // This function adds a monster to the player's roster of monsters
    // Returns null if the monster was added successfully
    // Returns the monster if the list is full
    public add2roster(monster: Monster | null): Monster | null {
        // Roster was full or null was supplied
        if (this.roster_full() || monster === null) { return monster }

        this.monsters_roster.push(monster);

        // Monster added successfully
        return null;
    }

    // This function adds a monster to the player's bench of monsters
    // Returns null if the monster was added successfully
    // Returns the monster if the list is full
    public add2bench(monster: Monster | null): Monster | null {
        // Bench was full or null was supplied
        if (this.bench_full() || monster === null) { return monster }

        this.monsters_bench.push(monster);

        // Monster added successfully
        return null;
    }

    // Removes a monster with a particular id from the roster
    // Returns the monster on success and null on failure
    public remove_from_roster(id: string | null): Monster | null {
        return null;
    }

    // Removes a monster with a particular id from the bench
    // Returns the monster on success and null on failure
    public remove_from_bench(id: string | null): Monster | null {
        return null;
    }
    
    // Takes a monster and moves it from the bench to the roster
    // Returns true on success and false on failure.
    // On failure the monster is placed back in the bench if one was ever found
    public bench2roster(id: string): boolean {
        return this.swap_monsters(id, null);
    }

    // Takes a monster and moves it from the roster to the bench
    // Returns true on success and false on failure.
    // On failure the monster is placed back in the roster if one was ever found
    public roster2bench(id: string): boolean {
        return this.swap_monsters(null, id);
    }

    // Swaps the position of two monsters, one in the bench and one in the roster
    // Returns false if the swap fails and true if it succeeds.
    swap_monsters(bench_id: string | null, roster_id: string | null): boolean {
        const bench_mon: Monster | null = this.remove_from_bench(bench_id);
        if (bench_mon === null && bench_id !== null) { 
            return false;
        }

        const roster_mon: Monster | null = this.remove_from_roster(roster_id);
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

    // Saves all user data to the database
    // Returns true upon success, returns false on failure
    public save2db(): boolean {
        // TODO
        // Save user data to the database
        // retrun true on success and false on failure

        return true;
    }
}

export { Player }
