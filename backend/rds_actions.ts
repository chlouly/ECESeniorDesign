import { QueryResult } from 'pg';
import { get_rds_connection, USER_TABLE_NAME, MONSTER_TABLE_NAME } from './rds_config';
import { logger } from './logger';
import { Monster } from './game_elems/monster';
import { ResCode } from './error';
import { Player } from './game_elems/player';
import { Egg } from './game_elems/egg';


/* --- PLAYER DB INTERACTIONS --- */

// ADD PLAYER
function store_player(player: Player): ResCode {
    return ResCode.NotImplemented;
}

// FETCH PLAYER
function fetch_player(p_id: number): Player | ResCode {
    return ResCode.NotImplemented;
}

// DELETE PLAYER
function delete_player(player: Player): ResCode {
    return ResCode.NotImplemented;
}


/* --- MONSTER DB INTERACTIONS --- */

// ADD MONSTER
function store_monster(monster: Monster): ResCode {
    return ResCode.NotImplemented;
}

// FETCH MONSTER
function fetch_monster(p_id: number, m_id: number): Monster | ResCode {
    return ResCode.NotImplemented;
}

// DELETE MONSTER
function delete_monster(monster: Monster): ResCode {
    return ResCode.NotImplemented;
}


/* --- EGG DB INTERACTIONS --- */

// ADD EGG
function store_egg(egg: Monster): ResCode {
    return ResCode.NotImplemented;
}

// FETCH EGG
function fetch_egg(p_id: number, e_id: number): Egg | ResCode {
    return ResCode.NotImplemented;
}

// DELETE EGG
function delete_egg(egg: Monster): ResCode {
    return ResCode.NotImplemented;
}

export {
    // Monsters
    fetch_monster,
    store_monster,
    delete_monster,

    // Players
    fetch_player,
    store_player,
    delete_player,

    // Eggs
    fetch_egg,
    store_egg,
    delete_egg,
}
