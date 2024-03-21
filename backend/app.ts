import express = require('express');
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import { logger } from "./logger";
import { setup_rds_tables } from "./rds_config";
import { Player, Difficulty } from "./game_elems/player";
import { MatchQueue, Match } from './game_elems/match';
import path = require('path');
import { ResCode } from './error';

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


///////////////////////////////////////////////////////////
// This endpoint takes a user ID and returns their username
app.get('/username', (req: Request, res: Response) => {
  // Check if id exists and is a string
  const idStr = req.query.id;
  if (typeof idStr !== 'string') {
    return res.status(ResCode.PIDNaN).end();
  }

  // Convert id to a number
  const id = parseInt(idStr);
  if (isNaN(id)) {
    return res.status(ResCode.PIDNaN).end();
  }

  const player: Player | undefined = online[id];

  if (player === undefined) {
    return res.status(ResCode.NotFound).end();
  }

  res.status(ResCode.Ok).json({"username" : player.get_name()});
});


///////////////////////////////////////////////////////////////////
// This endpoint takes a user ID and returns their difficulty level
app.get('/difficulty', (req: Request, res: Response) => {
  // Check if id exists and is a string
  const idStr = req.query.id;
  if (typeof idStr !== 'string') {
    return res.status(ResCode.PIDNaN).end();
  }

  // Convert id to a number
  const id = parseInt(idStr);
  if (isNaN(id)) {
    return res.status(ResCode.PIDNaN).end();
  }

  const player: Player | undefined = online[id];

  if (player === undefined) {
    return res.status(ResCode.NotFound).end();
  }

  res.status(ResCode.Ok).json({"difficulty" : player.get_difficulty()});
});


//////////////////////////////////////////////////////////
// Lets a player join a random match
//
// body: {
//   "id": PLAYER ID NUMBER
// }
app.post('/joinrandom', (req: Request, res: Response) => {
  if (req.body === undefined) {
    return res.status(ResCode.NoBody).end();
  }

  let code: ResCode = validate_match_ins(req.body.id, null);
  if (code !== ResCode.Ok) {
    return res.status(code).end();
  }

  const id: number = req.body.id;
  const player: Player | undefined = online[id];

  if (player === undefined) {
    return res.status(ResCode.NotFound).end;
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
    return res.status(ResCode.NoBody).end();
  }
  
  let code: ResCode = validate_match_ins(req.body.id, req.body.gameNumber);
  if (code !== ResCode.Ok) {
    return res.status(code).end();
  }

  // Parsing player request data
  const id: number = req.body.id;
  const player: Player | undefined = online[id];

  // Player is not online
  if (player === undefined) {
    return res.status(ResCode.NotFound).end();
  }

  // Player is already in a match
  if (player.current_game !== null) {
    return res.status(ResCode.PlyrBusy).end();
  }

  // gameNumber was empty so we create a game with a random number
  if (req.body.gameNumber === '') {
    const match = new Match(null);
    match.join(player)
    matches[match.match_number] = match;
    return res.status(ResCode.Ok).json({'gameNumber' : match.match_number})
  }

  // Parsing gameNumber request data
  const gameNumber: number = req.body.gameNumber;
  const match: Match | undefined = matches[gameNumber];

  // Match does not exist, create a new one
  if (match === undefined) {
    return res.status(ResCode.NotFound).end();
  } 

  // Match does exist and is full
  if (match.is_full()) {
    return res.status(ResCode.MtchFll).end();
  }

  // All other edge cases passed
  match.join(player)

  return res.status(ResCode.Ok).send({'gameNumber' : gameNumber});
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
    return res.status(ResCode.NoBody).end();
  }

  let code: ResCode = validate_match_ins(req.body.id, null);
  if (code !== ResCode.Ok) {
    return res.status(code).end();
  }

  // Parsing request data and obtaining player data (if any)
  const id: number = req.body.id;
  const player: Player | undefined = online[id];

  // Player is not online
  if (player === undefined) {
    return res.status(ResCode.NotFound).end();
  }

  // Player is not in a match
  if (player.current_game === null) {
    return res.status(ResCode.Ok).end();
  }

  // Getting match from player
  const gameNumber: number | null = player.current_game;
  const match: Match | undefined = matches[gameNumber];

  // Match does not exist, even though the players current gameNumber is for this match
  if (match === undefined) {
    player.current_game = null;
    return res.status(ResCode.NotFound).end();
  } 

  // Leaving match
  if (!match.leave_game(id)) {
    player.current_game = null;
    return res.status(ResCode.GnrlErr).end();
  }

  // Success
  return res.status(ResCode.Ok).end();
});


// Gives the state of all lists dicts and queues that hold game state
// Logs it to the console
app.get('/getstate', (req: Request, res: Response) => {
  console.log("\n\n\nGET STATE ENDPOINT\n\nONLINE:")
  console.log(online);
  console.log("\nRANDOM QUEUE:")
  console.log(random_players);
  console.log("\nMATCHES:")
  console.log(matches);

  return res.status(ResCode.Ok).json({'message' : "CHECK CONSOLE"});
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
  ): ResCode {

  // Validating the player id if it is needed
  if (player_id !== null) {
    if (player_id === undefined) {
      return ResCode.PIDUndef;
    } else if (typeof player_id !== 'number') {
      return ResCode.PIDNaN;
    } 
  }

  // Validating the gameNumber if it is needed
  if (gameNumber !== null) {
    if (gameNumber === undefined) {
      return ResCode.MtchUndef;
    } else if (gameNumber === '') {
      return ResCode.Ok;  // No game number was given but the field exists (should bypass the other conditions)
    } else if (typeof gameNumber !== 'number') {
      return ResCode.MtchNaN;
    } else if (gameNumber < 10000 || gameNumber > 50000) {
      return ResCode.MtchOutBnds;
    }
  }

  // Other validation will go here...

  // all clear
  return ResCode.Ok;
}

export { 
  process,
  matches,
  online
}
