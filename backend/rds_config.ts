import * as dotenv from 'dotenv';
import { Client } from 'pg';
import { logger } from './logger';

dotenv.config();

const user = String(process.env.RDS_USER);
const host = String(process.env.RDS_HOST);
const password = String(process.env.RDS_PASSWORD);
const database = String(process.env.RDS_DB_NAME);
const port = Number(process.env.RDS_PORT);

const dbConfig = {
  user: user,
  host: host,
  database: database,
  password: password,
  port: port || 5432, // Default PostgreSQL port
  ssl: {
    // Set the SSL option
    rejectUnauthorized: false, // Reject self-signed certificates (recommended for production)
  },
};

const COGNITO_TABLE_NAME = 'AWS_Auth'
const USER_TABLE_NAME = 'Users';
const MONSTER_TABLE_NAME = 'Monsters';
const EGG_TABLE_NAME = 'Eggs';

async function get_rds_connection() {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    logger.debug('Successfully connected to RDS')
  } catch (error) {
    logger.error('Error connecting to the database:', error);
  }

  return client
}

async function setup_rds_tables() {
  const client = await get_rds_connection();

  try {
    const query = `
    CREATE TABLE IF NOT EXISTS ${COGNITO_TABLE_NAME} (
      id SERIAL PRIMARY KEY,
      auth_token VARCHAR(255) NOT NULL
    );

    -- Create the Users table
    CREATE TABLE IF NOT EXISTS ${USER_TABLE_NAME} (
      id INT NOT NULL,
      name VARCHAR(50) NOT NULL,
      level INT NOT NULL,
      xp INT NOT NULL,
      cur_egg INT,
      cur_m_id INT,
      FOREIGN KEY (id) REFERENCES ${COGNITO_TABLE_NAME}(id)
    );

    -- Create the Monsters table with a foreign key reference to the Users table
    CREATE TABLE IF NOT EXISTS ${MONSTER_TABLE_NAME} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      user_id INT,
      level INT,
      xp INT,
      ev_num INT,
      type INT,
      health INT,
      FOREIGN KEY (user_id) REFERENCES ${COGNITO_TABLE_NAME}(id)
    );

    -- Creating the Eggs table with foreign key reference to Users
    CREATE TABLE IF NOT EXISTS ${EGG_TABLE_NAME} (
      id SERIAL PRIMARY KEY,
      user_id INT,
      type INT,
      hatch_start_time INT,
      FOREIGN KEY (user_id) REFERENCES ${COGNITO_TABLE_NAME}(id)
    );

    -- Add a column to Users for storing an array of monster IDs. This step is done
    -- after creating both tables because PostgreSQL does not support enforcing foreign
    -- key constraints on arrays directly. Management of this array for referential integrity
    -- will need to be handled at the application level or through triggers/procedures.
    ALTER TABLE Users
    ADD COLUMN monsters_roster INT[];
    ALTER TABLE Users
    ADD COLUMN monsters_bench INT[];
    ALTER TABLE Users
    ADD COLUMN eggs INT[];
    `;
    await client.query(query);
    logger.debug(`Successfully created tables`);
  } catch (error) {
    logger.error('Error creating table:', error);
  } finally {
    await client.end();
  }
}

async function clear_db() {
  const client = await get_rds_connection();

  const query = `
    DROP TABLE IF EXISTS ${EGG_TABLE_NAME};
    DROP TABLE IF EXISTS ${USER_TABLE_NAME};
    DROP TABLE IF EXISTS ${MONSTER_TABLE_NAME};
    DROP TABLE IF EXISTS ${COGNITO_TABLE_NAME};
  `;
  
  try {
    await client.query(query);
    logger.debug(`Successfully cleared tables`);
    await setup_rds_tables();
  } catch (error) {
    logger.error('Error creating table:', error);
  } finally {
    await client.end();
  }
}

export { 
  clear_db,
  setup_rds_tables,
  get_rds_connection,
  USER_TABLE_NAME,
  MONSTER_TABLE_NAME,
  EGG_TABLE_NAME,
  COGNITO_TABLE_NAME
}
