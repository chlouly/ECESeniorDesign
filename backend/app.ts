import express = require('express');
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import { logger } from "./logger";
import { setup_rds_tables } from "./rds_config";

dotenv.config();

setup_rds_tables();

const app = express();
const port = process.env.SERVER_PORT || 3000; // You can choose any port

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World from TypeScript!');
});

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});

export { process }
