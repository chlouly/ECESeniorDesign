///////////////////////////////////////////////
//  This file constains the class and method
//  definitions for users
//

import { ResCode, isResCode } from '../error';
import { Egg } from './egg';
import { Monster, MonsterRow, MonsterType } from './monster';
import { fetch_monster, new_monster, update_player } from '../rds_actions';
import { logger } from '../logger';

const NUM_MONSTERS_ROSTER: number = 6;
const NUM_MONSTERS_BENCH: number = 120;
const NUM_EGGS = 20;

enum Difficulty {
    Easy = "EASY",
    Medium = "MEDIUM",
    Hard = "HARD",
    Expert = "EXPERT"
}

enum Action {
    Attack,
    Heal,
    SwapMonster,
}

const validActions = new Set(Object.values(Action));

class Player {
    private name: string;   // Username
    private id: number;     // Actual user ID
    public monsters_roster: number[] = [];     // Monsters to be used in fights
    public monsters_bench: number[] = [];      // Monster ids stored away for later
    public eggs: number[] = [];                // Egg ids that the user has
    private level: number = 1;
    private xp: number = 0;
    private difficulty: Difficulty = Difficulty.Easy;
    public current_game: number | null = null;

    public currently_hatching_egg: number | null = null;   // Egg that is currently being hatched
    public current_monster: Monster | null = null;  

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

    // Checks if a particular monster id is in the player's roster
    private is_in_roster(id: number): boolean { return this.monsters_roster.some(m_id => m_id === id) }

    // Checks if a particular monster id is in the player's bench
    private is_in_bench(id: number): boolean { return this.monsters_bench.some(m_id => m_id === id) }

    public update_id(id: number) { this.id = id; }


    /////////////////////////////////////////////
    //         USER LEVEL AND XP MANIP         //
    /////////////////////////////////////////////

    // Returns the exact ammount of XP needed to level up
    // To modify the level progression, modify this function
    private xp2lvl_up(): number { return this.level * 100 - this.xp }

    // Use this function when adding to a player's XP
    // This function handles leveling up recursively
    public async increase_xp(xp: number) {
        const level_up_xp = this.xp2lvl_up()      // The xp needed to level up (level up at level * 100 xp)
        if ((xp + this.xp) < level_up_xp) {
            this.xp += xp;
            return;
        }

        // TODO, if level % 5 == 0 get new monster
        this.xp = 0;
        this.level += 1;

        if (this.level % 5 === 0) {
            await this.new_monster("");
        }

        this.increase_xp(xp - level_up_xp);
    }


    public async perform_action(opponent: Player, action: Action, m_id: number | null): Promise<ResCode> {
        this.increase_xp(5);
        this.current_monster?.increase_xp(10);

        switch (action) {
            case (Action.Attack): {
                return this.attack(opponent);
            }
            case (Action.Heal): {
                return this.heal();
            }
            case (Action.SwapMonster): {
                if (m_id === null) {
                    return ResCode.SwapWoutMID;
                }

                return await this.swap_primary(m_id);
            }
            default: {
                return ResCode.InvalidAction;
            }
        }
    }

    // TODO
    private attack(opponent: Player): ResCode {
        if (this.current_monster === null || opponent.current_monster === null) {
            logger.error("Error when attacking, one of the players has no current monster.");
            return ResCode.NotFound;
        }

        const my_lvl = this.current_monster.level;
        const op_lvl = opponent.current_monster.level;

        const dmg = (my_lvl - op_lvl + 100) / 2

        opponent.current_monster.take_dmg(dmg);

        return ResCode.Ok;
    }

    // Heals the primary monster
    private heal(): ResCode {
        if (this.current_monster === null) {
            return ResCode.NotFound;
        }
        
        this.current_monster.heal();

        return ResCode.Ok
    }

    // Swaps in the monster with the designated ID (from the roster only)
    private async swap_primary(m_id: number): Promise<ResCode> {
        if (!this.is_in_roster(m_id)) {
            return ResCode.NotFound;
        }

        const monster: Monster | ResCode = await fetch_monster(this.id, m_id);

        if (isResCode(monster)) {
            return monster;
        }

        // If the desired monster is dead, dont let them switch
        if (monster.alive === false) {
            return ResCode.MonsterDead;
        }

        // Add the old monster to the list and save its info (if it was there to begin with)
        if (this.current_monster !== null) {
            this.add2roster(this.current_monster.id);
            this.current_monster.save2db(this.id);
        }

        this.current_monster = monster;

        return ResCode.Ok
    }




    /////////////////////////////////////////////
    //            MONSTER DATA MANIP           //
    /////////////////////////////////////////////

    // NOTE: if any of these functions have null as an input, they do nothing

    public async new_monster(name: string) {
        const monster = new Monster(name, -1, 1, 0, 100, 1, MonsterType.Legendary);

        let m_id: number = await new_monster(this.id, monster);

        monster.id = m_id;

        if (this.current_monster === null) {
            this.current_monster = monster;
        }

        this.add2bench(this.add2roster(m_id));

        return;
    }

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


    public get_data(): PlayerRow {
        let data: PlayerRow = player2row(this);
        if (this.current_monster !== null) {
            data.current_monster = this.current_monster.get_data();
        }

        return data;
    }

    // Saves all user data to the database
    public async save2db(): Promise<ResCode> {
        let code: ResCode | undefined = await this.current_monster?.save2db(this.id);

        if (code === undefined) {
            return ResCode.NotFound;
        }

        if (code !== ResCode.Ok) {
            return code;
        }

        return await update_player(this);
    }
}



interface PlayerRow {
    name: string;   
    id: number; 
    monsters_roster: number[];
    monsters_bench: number[];
    eggs: number[];
    currently_hatching_egg: number | null;
    current_monster: MonsterRow | number | null;   //
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
        current_monster: (player.current_monster === null)? null : player.current_monster.id,   // Get id
        level: player.get_level(),
        xp: player.get_xp()  
    }
}

export { 
    Player,
    PlayerRow,
    Difficulty,
    Action,
    validActions,
    row2player,
    player2row
}
