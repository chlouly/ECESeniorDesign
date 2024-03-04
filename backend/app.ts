import express = require('express');
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import { logger } from "./logger";
import { setup_rds_tables } from "./rds_config";
import { Player } from "./game_elems/player";
import { MatchQueue, Match } from './game_elems/match';

dotenv.config();

setup_rds_tables();

/////////////////////////////////////////
// Dictionaries and lists to manage state

// A dictionary of all players online
let online: { [key: number] : Player } = {};

// Queue of players who wish to be paired randomly
let random_players = new MatchQueue;

// Matches that are currently active
let matches: { [key: number] : Match } = {};

// Just for testing purposes, will delete later
let test_p: Player = new Player("Chris", 1, [], [], [], null, 10, 0);
online[test_p.get_id()] = test_p;

const app = express();
const port = process.env.SERVER_PORT || 3000; // You can choose any port

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World from TypeScript!');
});


///////////////////////////////////////////////////////////
// This endpoint takes a user ID and returns their username
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


///////////////////////////////////////////////////////////////////
// This endpoint takes a user ID and returns their difficulty level
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


//////////////////////////////////////////////////////////
// Lets a player join a random match
//
// body: {
//   "id": PLAYER ID NUMBER
// }
app.put('/joinrandom', (req: Request, res: Response) => {
  if (req.body === undefined) {
    return res.status(400).send("Bad request: no body found");
  } else if (req.body.id === undefined) {
    return res.status(400).send("Bad request: no id was given");
  } else if (typeof req.body.id !== 'number') {
    return res.status(400).send("Bad request: id was not a number");
  }

  const id: number = req.body.id;
  const player: Player | undefined = online[id];

  if (player === undefined) {
    return res.status(404).send(`Player with id ${id} was not found`);
  }

  
  
});


//////////////////////////////////////////////////////////
// Lets a player join a match or create a match
// with a particular gameNumber
//
// body: {
//   "id": PLAYER ID NUMBER,
//   "gameNumber": GAME NUMBER TO BE CREATED OR JOINED
// }
//
// If a match with matching gameNumber exists then it
// attempts to join, if not then it attempts to create it.
app.post('/joingame', (req: Request, res: Response) => {
  // Validating request body {id}
  if (req.body === undefined) {
    return res.status(400).send("Bad request: no body found");
  } else if (req.body.id === undefined) {
    return res.status(400).send("Bad request: no id was given");
  } else if (typeof req.body.id !== 'number') {
    return res.status(400).send("Bad request: id was not a number");
  } 

  // Validating request body {gameNumber}
  if (req.body.gameNumber === undefined) {
    return res.status(400).send("Bad request: no gameNumber given");
  } else if (typeof req.body.gameNumber !== 'number') {
    return res.status(400).send("Bad request: id was not a number");
  } else if (req.body.gameNumber < 10000 || req.body.gameNumber > 50000) {
    return res.status(400).send("Bad request: gameNumber should be 5 digits (between 10000 and 50000)");
  } else if (matches[req.body.gameNumber] !== undefined) {
    return res.status(400).send(`Bad request: gameNumber ${req.body.gameNumber} is already in use, please choose another`);
  }

  const id = req.body.id;
  const gameNumber = req.body.gameNumber;

  if (online[id] === undefined) {
    return res.status(404).send(`Player with id ${id} was not found`);
  }

  let player = online[id];

  // Match does not exist, create a ne one
  if (matches[gameNumber] === undefined) {
    const match = new Match(gameNumber);
    match.join(player)
    matches[gameNumber] = match;
    return res.status(200).send(`Success: Match with gameNumber ${gameNumber} created`)
  } 

  // Match does exist
  if (matches[gameNumber].is_full()) {
    return res.status(500).send(`Error: Could not joing match with gameNumber ${req.body.gameNumber}, it was full`);
  }

  // Match does exist and istn full
  matches[gameNumber].join(player)

  return res.status(200).send(`Success: Joined match with gameNumber ${gameNumber}`);
});


// Gives the state of all lists dicts and queues that hold game state
// Logs it to the console
app.get('/getstate', (req: Request, res: Response) => {
  console.log(online);
  console.log(random_players);
  console.log(matches);

  return res.status(200);
});

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});

export { 
  process,
  matches
}
