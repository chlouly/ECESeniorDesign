import { QueryResult } from 'pg';
import { get_rds_connection, USER_TABLE_NAME, MONSTER_TABLE_NAME, EGG_TABLE_NAME, COGNITO_TABLE_NAME } from './rds_config';
import { logger } from './logger';
import { MAX_HEALTH, Monster, MonsterRow, row2monster} from './game_elems/monster';
import { ResCode } from './error';
import { Player, PlayerRow, row2player, player2row } from './game_elems/player';
import { Egg, EggRow, egg2row, row2egg } from './game_elems/egg';


/* --- PLAYER DB INTERACTIONS --- */
// NEW PLAYER
async function new_player(player: Player, auth: string): Promise<ResCode> {
    const client = await get_rds_connection();
    const query1 = `
        INSERT INTO ${COGNITO_TABLE_NAME} (auth_token)
        VALUES ($1)
        RETURNING id;
    `;

    const query2 = `
        INSERT INTO ${USER_TABLE_NAME} (id, name, level, xp, cur_egg, cur_m_id, monsters_roster, monsters_bench, eggs)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id;  -- This will return the new monster's ID after insertion
    `;

    const row = player2row(player);

    const values1 = [
        auth
    ]

    try {
        // Insert auth token into Cognito db
        const res1 = await client.query(query1, values1);

        if (res1.rowCount === 0) {
            return ResCode.RDSErr;
        }

        // Geting user ID from that
        const id: number = res1.rows[0].id;

        const values2 = [
            id,
            row.name,
            row.level,
            row.xp,
            row.currently_hatching_egg,
            row.current_monster,
            row.monsters_roster,
            row.monsters_bench,
            row.eggs
        ];

        // Creating new player from that id
        const res2 = await client.query(query2, values2);

        if (res2.rowCount === 0) {
            return ResCode.RDSErr;
        }

        return id;
    } catch (error) {
        logger.error('Error Manipulating RDS DB -- new_player():', error);
        return ResCode.RDSErr;
    } finally {
        await client.end();
    }
}

// UPDATE PLAYER
async function update_player(player: Player): Promise<ResCode> {
    const client = await get_rds_connection();
    const query = `
        UPDATE ${USER_TABLE_NAME}
        SET name = $2, level = $3, xp = $4, cur_m_id = $5, cur_egg = $6, monsters_roster = $7, monsters_bench = $8, eggs = $9
        WHERE id = $1
    `;

    const row = player2row(player);

    const values = [
        row.id,
        row.name,
        row.level,
        row.xp,
        row.current_monster,
        row.currently_hatching_egg,
        row.monsters_roster,
        row.monsters_bench,
        row.eggs
    ]

    try {
        const res = await client.query(query, values);

        if (res.rowCount === 0) {
            return ResCode.NotFound;
        }

        return ResCode.Ok;
    } catch (error) {
        logger.error('Error Manipulating RDS DB -- update_player():', error);
        return ResCode.RDSErr;
    } finally {
        await client.end();
    }

    return ResCode.NotImplemented;
}

// FETCH PLAYER
async function fetch_player(auth: string): Promise<Player | ResCode> {
    const client = await get_rds_connection();

    const query1 = `
        SELECT * FROM ${COGNITO_TABLE_NAME}
        WHERE auth_token = $1;
    `;

    const query2 = `
        SELECT * FROM ${USER_TABLE_NAME}
        WHERE id = $1;
    `;

    const values1 = [
        auth
    ];

    try {
        let res1 = await client.query(query1, values1);

        if (res1.rowCount === 0) {
            return ResCode.NotFound;
        }

        const id: number = res1.rows[0].id;

        let res2: QueryResult<PlayerRow> = await client.query(query2, [id]);

        if (res2.rowCount === 0) {
            return ResCode.NotFound;
        }

        return row2player(res2.rows[0]);
    } catch (error) {
        logger.error('Error Manipulating RDS DB -- fetch_player():', error);
        return ResCode.RDSErr;
    } finally {
        await client.end();
    }
}

// DELETE PLAYER
async function delete_player(p_id: number): Promise<ResCode> {
    const client = await get_rds_connection();
    const query = `
        DELETE * FROM ${USER_TABLE_NAME}
        WHERE id = $1;
    `;
    const values = [
        p_id
    ]

    try {
        let res = await client.query(query, values);

        if (res.rowCount === 0) {
            return ResCode.NotFound;
        }

        return ResCode.Ok;
    } catch (error) {
        logger.error('Error Manipulating RDS DB -- delete_player():', error);
        return ResCode.RDSErr;
    } finally {
        await client.end();
    }

    return ResCode.NotImplemented;
}


/* --- MONSTER DB INTERACTIONS --- */
// NEW MONSTER
async function new_monster(p_id: number, monster: Monster): Promise<number | ResCode> {
    const client = await get_rds_connection();
    const query = `
        INSERT INTO ${MONSTER_TABLE_NAME} (name, user_id, level, xp, ev_num, type, health)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;  -- This will return the new monster's ID after insertion
    `;
    const values = [
        monster.name,
        p_id,
        monster.level,
        monster.xp,
        monster.evolution_number,
        monster.type,
        monster.health
    ];

    try {
        // Make the query
        const res = await client.query(query, values);

        // Return the monster ID
        return res.rows[0].id;

    } catch (error) {
        logger.error('Error Manipulating RDS DB -- new_monster():', error);
        return ResCode.RDSErr;
    } finally {
        await client.end();
    }
}

// ADD MONSTER
async function update_monster(p_id: number, monster: Monster): Promise<ResCode> {
    const client = await get_rds_connection();
    const query = `
        UPDATE ${MONSTER_TABLE_NAME}
        SET name = $1, level = $2, xp = $3, ev_num = $4, health = $5
        WHERE id = $6 AND user_id = $7;
    `;

    const values = [
        monster.name,
        monster.level,
        monster.xp,
        monster.evolution_number,
        monster.health,
        monster.id,
        p_id
    ]

    try {
        const res = await client.query(query, values);

        if (res.rowCount === 0) {
            return ResCode.NotFound;
        }

        return ResCode.Ok;
    } catch (error) {
        logger.error('Error Manipulating RDS DB -- update_monster():', error);
        return ResCode.RDSErr;
    } finally {
        await client.end();
    }
}

// FETCH MONSTER
async function fetch_monster(p_id: number, m_id: number): Promise<Monster | ResCode> {
    const client = await get_rds_connection();
    const query = `
        SELECT * FROM ${MONSTER_TABLE_NAME}
        WHERE id = $1 AND user_id = $2;
    `;

    const values = [
        m_id,
        p_id
    ];

    try {
        const res: QueryResult<MonsterRow> = await client.query(query, values);

        if (res.rowCount === 0) {
            return ResCode.NotFound;
        }

        const row: MonsterRow = res.rows[0];

        return row2monster(row);
    } catch (error) {
        logger.error('Error Manipulating RDS DB -- fetch_monster():', error);
        return ResCode.RDSErr;
    } finally {
        await client.end();
    }
}

// DELETE MONSTER
async function delete_monster(p_id: number, m_id: number): Promise<ResCode> {
    const client = await get_rds_connection();
    const query = `
        DELETE FROM ${MONSTER_TABLE_NAME}
        WHERE id = $1 AND user_id = $2;
    `;

    const values = [
        m_id,
        p_id
    ];

    try {
        const res = await client.query(query, values);

        if (res.rowCount === 0) {
            return ResCode.NotFound;
        }

        return ResCode.Ok;
    } catch (error) {
        logger.error('Error Manipulating RDS DB -- delete_monster():', error);
        return ResCode.RDSErr;
    } finally {
        await client.end();
    }
}

async function heal_monster(p_id: number, m_id: number): Promise<ResCode> {
    const client = await get_rds_connection();
    const query = `
        UPDATE ${MONSTER_TABLE_NAME}
        SET health = $1
        WHERE id = $2 AND user_id = $3;
    `;

    const values = [
        MAX_HEALTH,
        m_id,
        p_id
    ]

    try {
        const res = await client.query(query, values);

        if (res.rowCount === 0) {
            return ResCode.NotFound;
        }

        return ResCode.Ok;
    } catch (error) {
        logger.error('Error Manipulating RDS DB -- heal_monster():', error);
        return ResCode.RDSErr;
    } finally {
        await client.end();
    }
}


/* --- EGG DB INTERACTIONS --- */
// NEW 
async function new_egg(p_id: number, egg: Egg): Promise<number | ResCode> {
    const client = await get_rds_connection();
    const query = `
        INSERT INTO ${EGG_TABLE_NAME} (user_id, type, hatch_start_time)
        VALUES ($1, $2, $3)
        RETURNING id;  -- This will return the new monster's ID after insertion
    `;

    const row = egg2row(egg);

    const values = [
        p_id,
        row.type,
        row.hatch_start_time
    ];

    try {
        // Make the query
        const res = await client.query(query, values);

        // Return the monster ID
        return res.rows[0].id;

    } catch (error) {
        logger.error('Error Manipulating RDS DB -- new_egg():', error);
        return ResCode.RDSErr;
    } finally {
        await client.end();
    }
}

// ADD EGG
async function update_egg(p_id: number, egg: Egg): Promise<ResCode> {
    const client = await get_rds_connection();
    const query = `
        UPDATE ${EGG_TABLE_NAME}
        SET type = $3, hatch_start_time = $4
        WHERE id = $5 AND user_id = $6;
    `;

    const row = egg2row(egg);

    const values = [
        row.id,
        p_id,
        row.type,
        row.hatch_start_time
    ]

    try {
        const res = await client.query(query, values);

        if (res.rowCount === 0) {
            return ResCode.NotFound;
        }

        return ResCode.Ok;
    } catch (error) {
        logger.error('Error Manipulating RDS DB -- update_egg():', error);
        return ResCode.RDSErr;
    } finally {
        await client.end();
    }
}

// FETCH EGG
async function fetch_egg(p_id: number, e_id: number): Promise<Egg | ResCode> {
    const client = await get_rds_connection();
    const query = `
        SELECT * FROM ${EGG_TABLE_NAME}
        WHERE id = $1 AND user_id = $2;
    `;

    const values = [
        e_id,
        p_id
    ];

    try {
        const res: QueryResult<EggRow> = await client.query(query, values);

        if (res.rowCount === 0) {
            return ResCode.NotFound;
        }

        const row: EggRow = res.rows[0];

        return row2egg(row);
    } catch (error) {
        logger.error('Error Manipulating RDS DB -- fetch_egg():', error);
        return ResCode.RDSErr;
    } finally {
        await client.end();
    }
}

// DELETE EGG
async function delete_egg(p_id: number, egg: Egg): Promise<ResCode> {
    const client = await get_rds_connection();
    const query = `
        DELETE * FROM ${EGG_TABLE_NAME}
        WHERE id = $1 AND user_id = $2;
    `;

    const values = [
        egg.id,
        p_id
    ];

    try {
        const res = await client.query(query, values);

        if (res.rowCount === 0) {
            return ResCode.NotFound;
        }

        return ResCode.Ok;
    } catch (error) {
        logger.error('Error Manipulating RDS DB -- delete_egg():', error);
        return ResCode.RDSErr;
    } finally {
        await client.end();
    }

    return ResCode.NotImplemented;
}

export {
    // Monsters
    new_monster,
    fetch_monster,
    update_monster,
    delete_monster,
    heal_monster,

    // Players
    new_player,
    fetch_player,
    update_player,
    delete_player,

    // Eggs
    new_egg,
    fetch_egg,
    update_egg,
    delete_egg,
}
