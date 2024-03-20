import express = require('express');
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import { logger } from "./logger";
import { setup_rds_tables } from "./rds_config";
import { Player, Difficulty } from "./game_elems/player";
import { MatchQueue, Match } from './game_elems/match';
import path = require('path');

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

/*
      TESTING DATA
*/
let chris: Player = new Player("Chris", 1, [], [], [], null, 1000, 0);
online[chris.get_id()] = chris;

let mateusz: Player = new Player("Mateusz", 2, [], [], [], null, 2, 0);
online[mateusz.get_id()] = mateusz;

let santi: Player = new Player("Santi", 3, [], [], [], null, 2, 0);
online[santi.get_id()] = santi;



const app = express();
const port = process.env.SERVER_PORT || 3000; // You can choose any port

app.use(express.static(path.join(__dirname, '../front-end/build')));
app.use(express.json());

// app.get('/', (req: Request, res: Response) => {
//   res.send('Hello World from TypeScript!');
// });


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
  }

  let fmt_error = validate_match_ins(req.body.id, null);
  if (fmt_error !== null) {
    return res.status(400).send(fmt_error);
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
  // Validating request body
  if (req.body === undefined) {
    return res.status(400).send("Bad request: no body found");
  }
  
  let fmt_error = validate_match_ins(req.body.id, req.body.gameNumber);
  if (fmt_error !== null) {
    return res.status(400).send(fmt_error);
  }

  // Parsing request data
  const id: number = req.body.id;
  const gameNumber: number = req.body.gameNumber;

  // Obtaining player and game data (if any)
  const player: Player | undefined = online[id];
  const match: Match | undefined = matches[gameNumber];

  // Player is not online
  if (player === undefined) {
    return res.status(404).send(`Player with id ${id} was not found`);
  }

  // Player is already in a match
  if (player.current_game !== null) {
    return res.status(500).send(`Error: Could not join match: ${gameNumber}, player with id: ${id} was already in match: ${player.current_game}`);
  }

  // Match does not exist, create a new one
  if (match === undefined) {
    const match = new Match(gameNumber);
    match.join(player)
    matches[gameNumber] = match;
    return res.status(200).send(`Success: Match with gameNumber ${gameNumber} created`)
  } 

  // Match does exist and is full
  if (match.is_full()) {
    return res.status(500).send(`Error: Could not joing match with gameNumber ${gameNumber}, it was full`);
  }

  // All other edge cases passed
  matches[gameNumber].join(player)

  return res.status(200).send(`Success: Joined match with gameNumber ${gameNumber}`);
});


//////////////////////////////////////////////////////////
// Lets a player leave a match
//
// body: {
//   "id": PLAYER ID NUMBER,
// }
//
// If the player is in a match, it leaves it, if not,
// then nothing hapens. If there is conflicting backend
// information, it gets corrected by leaving the game
// automaticaly
app.post('/leavegame', (req: Request, res: Response) => {
  // Making sure the body exists
  if (req.body === undefined) {
    return res.status(400).send("Bad request: no body found");
  }

  let fmt_error = validate_match_ins(req.body.id, null);
  if (fmt_error !== null) {
    return res.status(400).send(fmt_error);
  }

  // Parsing request data and obtaining player data (if any)
  const id: number = req.body.id;
  const player: Player | undefined = online[id];

  // Player is not online
  if (player === undefined) {
    return res.status(404).send(`Player with id ${id} was not found`);
  }

  // Player is not in a match
  if (player.current_game === null) {
    return res.status(500).send(`Error: Player with id ${id} is not currently in a game`);
  }

  // Getting match from player
  const gameNumber: number | null = player.current_game;
  const match: Match | undefined = matches[gameNumber];

  // Match does not exist, even though the players current gameNumber is for this match
  if (match === undefined) {
    player.current_game = null;
    return res.status(500).send(`Error: Match with gameNumber ${gameNumber}, associated with te player with id: ${id}, did not exist. Player status has been updated.`);
  } 

  // Leaving match
  if (!match.leave_game(id)) {
    player.current_game = null;
    return res.status(500).send(`Error: Match with gameNumber ${gameNumber}, associated with te player with id: ${id}, did not exist. Player status has been updated. (2)`)
  }

  // Success
  return res.status(200).send(`Success: Player with id: ${id} left the match with id: ${gameNumber}`);
});


// Gives the state of all lists dicts and queues that hold game state
// Logs it to the console
app.get('/getstate', (req: Request, res: Response) => {
  console.log(online);
  console.log(random_players);
  console.log(matches);

  return res.status(200);
});

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../front-end/build/index.html'));
});

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});


// Input validation helper functions (to ensure that formatting is correct):
//
// If any one of the inputs is null, it means we are not validating that quantity
// Otherwise it will be checked for correctness, returns an error string if the values fail
//
// Returns null if everything passes
function validate_match_ins(
  player_id: any, 
  gameNumber: any
  ): string | null {

  // Validating the player id if it is needed
  if (player_id !== null) {
    if (player_id === undefined) {
      return "Bad request: no id was given";
    } else if (typeof player_id !== 'number') {
      return "Bad request: id was not a number";
    } 
  }

  // Validating the gameNumber if it is needed
  if (gameNumber !== null) {
    if (gameNumber === undefined) {
      return "Bad request: no gameNumber given";
    } else if (typeof gameNumber !== 'number') {
      return "Bad request: gameNumber was not a number";
    } else if (gameNumber < 10000 || gameNumber > 50000) {
      return "Bad request: gameNumber should be 5 digits (between 10000 and 50000)";
    }
  }

  // Other validation will go here...

  // all clear
  return null;
}

export { 
  process,
  matches
}
