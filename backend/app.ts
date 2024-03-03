import express = require('express');
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import { logger } from "./logger";
import { setup_rds_tables } from "./rds_config";
import { Player, Difficulty } from "./game_elems/player";

dotenv.config();

setup_rds_tables();

let online: { [key: number] : Player } = {};

let test_p: Player = new Player("Chris", 1, [], [], [], null, 10, 0);
online[test_p.get_id()] = test_p;

const app = express();
const port = process.env.SERVER_PORT || 3000; // You can choose any port

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World from TypeScript!');
});


app.get('/username', (req: Request, res: Response) => {
  // Check if id exists and is a string
  const idStr = req.query.id;
  if (typeof idStr !== 'string') {
    return res.status(400).send("Bad request: id was undefined or not a string");
  }

  // Convert id to a number
  const id = parseInt(idStr);
  if (isNaN(id)) {
    return res.status(400).send("Bad request: id is not a number");
  }

  const player: Player | undefined = online[id];

  if (player === undefined) {
    return res.status(404).send(`Player with id ${id} not found, they either do not exist or are offline`);
  }

  res.status(200).send(player.get_name());
});


app.get('/difficulty', (req: Request, res: Response) => {
  // Check if id exists and is a string
  const idStr = req.query.id;
  if (typeof idStr !== 'string') {
    return res.status(400).send("Bad request: id was undefined or not a string");
  }

  // Convert id to a number
  const id = parseInt(idStr);
  if (isNaN(id)) {
    return res.status(400).send("Bad request: id is not a number");
  }

  const player: Player | undefined = online[id];

  if (player === undefined) {
    return res.status(404).send(`Player with id ${id} not found, they either do not exist or are offline`);
  }

  res.status(200).send(player.get_difficulty());
});


app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});

export { process }
