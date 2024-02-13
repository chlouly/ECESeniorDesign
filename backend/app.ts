import express = require('express');
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import { logger } from "./logger";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // You can choose any port

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World from TypeScript!');
});

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});
