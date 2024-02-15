import * as winston from 'winston';
import * as dotenv from 'dotenv';

dotenv.config();

const level : number = Number(process.env.LOG_LEVEL) || 3;
const file = process.env.LOG_FILE || 'backend.log';

const log_levels = [
    'silent',
    'error',
    'info',
    'debug'
]

const logger = winston.createLogger({
    level: log_levels[level], // This is the default level of logging
    format: winston.format.json(), // Log in JSON format
    transports: [
      new winston.transports.File({ filename: file }),
    ],
  });

export {
    logger
}
