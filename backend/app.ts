import express = require('express');
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import { logger } from "./logger";
import { setup_rds_tables } from "./rds_config";
import { Player, Difficulty, Action, validActions } from "./game_elems/player";
import { MatchQueue, Match } from './game_elems/match';
import { Monster } from './game_elems/monster';
import path = require('path');

import mysql from 'mysql';
import e = require('express');
import multer, { MulterError } from 'multer';
import fs from 'fs';

import { ResCode, isResCode } from './error';
import { fetch_monster } from './rds_actions';


dotenv.config();

const connection = mysql.createConnection({
  host: 'localhost',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: 'mydatabase'
});

connection.connect((err: mysql.MysqlError) => {
  if (err) {
    logger.error('Error connecting to MySQL:', err);
  } else {
    logger.info('Connected to MySQL');
  }
});

setup_rds_tables();

// uploaf file using multer
declare global {
  namespace Express {
    interface Request {
      fileValidationError?: string;
    }
  }
}

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


//create storage using multer 
export const storage_pdf = multer.diskStorage({
  destination: (req, file, callback) => {
    const uploadDir = path.join(__dirname, 'Uploaded_Files');
    fs.mkdirSync(uploadDir, { recursive: true });
    callback(null, uploadDir);
  },
  filename: (req, file, callback) => {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});






const app = express();
const port = process.env.SERVER_PORT || 3000; // You can choose any port



app.use(express.static(path.join(__dirname, '../front-end/build')));
app.use(express.json());


const upload = multer({ 
  storage: storage_pdf,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.pdf') {
      req.fileValidationError = 'Only PDF files are allowed!';
      cb(null, false); // Reject the file. Don't pass an Error here.
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({ message: req.fileValidationError });
  }
  
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file.' });
  }

  return res.status(200).json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
  });
});

//////////////////////////////////////////////////////////
// Lets a player save ther progress and logout
//
// body: {
//   "id": PLAYER ID NUMBER
// }
//
// Saves a player's state to the database and removes them
// from the 'online' dictionary
app.delete('/logout', (req: Request, res: Response) => {
  // Validating request body
  if (req.body === undefined) {
    return res.status(ResCode.NoBody).end();
  }
  
  // Parse for errors
  let code: ResCode = validate_match_ins(req.body.id, null, null, null);
  if (code !== ResCode.Ok) {
    return res.status(code).end();
  }

  // Parse ID and Player data
  const id: number = req.body.id;
  const player: Player | undefined = online[id];

  // Player isn't online
  if (player === undefined) {
    return res.status(ResCode.NotFound).end();
  }

  // Save Player Data
  player.save2db();

  // Take player offline
  delete online[id];

  return res.status(ResCode.Ok).end();
});


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


///////////////////////////////////////////////////////////////////
// This endpoint retrieves relevant data on a given player.
//
// body: {
//    "id": PLAYER ID NUMBER,
// }
app.get('/playerdata', (req: Request, res: Response) => {
  if (req.body === undefined) {
    return res.status(ResCode.NoBody).end();
  }

  let code: ResCode = validate_match_ins(req.body.id, null, null, null);
  if (code !== ResCode.Ok) {
    return res.status(code).end();
  }

  // Pasring relevant data
  const p_id: number = req.body.id;

  // Getting Player object
  const player: Player | undefined = online[p_id];

  // Player is not online
  if (player === undefined) {
    return res.status(ResCode.NotFound).end();
  }

  return res.status(ResCode.Ok).json(player.get_data());
});


///////////////////////////////////////////////////////////////////
// This endpoint retrieves relevant data on any monster that a given
// player posesses.
//
// body: {
//    "id": PLAYER ID NUMBER,
//    "m_id": MONSTER ID NUMBER,
// }
app.get('/monsterdata', (req: Request, res: Response) => {
  if (req.body === undefined) {
    return res.status(ResCode.NoBody).end();
  }

  let code: ResCode = validate_match_ins(req.body.id, null, null, req.body.m_id);
  if (code !== ResCode.Ok) {
    return res.status(code).end();
  }

  // Pasring relevant data
  const p_id: number = req.body.id;
  const m_id: number = req.body.m_id;

  // Getting Player object
  const player: Player | undefined = online[p_id];

  // Player is not online
  if (player === undefined) {
    return res.status(ResCode.NotFound).end();
  }

  // Getting Monster
  const monster: Monster | ResCode = fetch_monster(p_id, m_id);

  // Monster was not found
  if (isResCode(monster)) {
    return res.status(monster).end();
  }

  // Sends monster data
  return res.status(ResCode.Ok).json(monster.get_data());
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

  let code: ResCode = validate_match_ins(req.body.id, null, null, null);
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
  
  let code: ResCode = validate_match_ins(req.body.id, req.body.gameNumber, null, null);
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

  return res.status(ResCode.Ok).json(match.get_data());
});


//////////////////////////////////////////////////////////
// Lets a player take their turn in the game
//
// body: {
//   "id": PLAYER ID NUMBER,
//   "gameNumber": GAME NUMBER,
//   "action": ACTION TYPE,
//   "m_id": MONSTER ID (in case of a swap)
// }
//
// If the player is in a match, it leaves it, if not,
// then nothing hapens. If there is conflicting backend
// information, it gets corrected by leaving the game
// automaticaly
app.post('/action', (req: Request, res: Response) => {
  // Validating request body
  if (req.body === undefined) {
    return res.status(ResCode.NoBody).end();
  }
  
  // Parse for errors
  let code: ResCode = validate_match_ins(req.body.id, req.body.gameNumber, req.body.action, req.body.m_id);
  if (code !== ResCode.Ok) {
    return res.status(code).end();
  }

  // Parse values
  const p_id: number = req.body.id;
  const gameNumber: number = req.body.gameNumber;
  const action: Action = req.body.action as Action;
  const m_id: number | null = (action === Action.SwapMonster)? req.body.m_id : null;


  // Get objects
  const match: Match | undefined = matches[gameNumber];

  // Match or player DNE
  if (match === undefined || online[p_id] === undefined) {
    return res.status(ResCode.NotFound);
  }

  // Take turn and record if the turn was successful
  code = match.take_turn(p_id, action, m_id);

  // Return the code and the match data
  return res.status(code).json(match.get_data());
});


//////////////////////////////////////////////////////////
// Waits until the player's turn to move
//
// body: {
//   "id": PLAYER ID NUMBER,
//   "gameNumber": GAME NUMBER
// }
//
// If the player is in a match, it leaves it, if not,
// then nothing hapens. If there is conflicting backend
// information, it gets corrected by leaving the game
// automaticaly
app.get('/waittomove', async (req: Request, res: Response) => {
  // Validating request body
  if (req.body === undefined) {
    return res.status(ResCode.NoBody).end();
  }
  
  // Parse for errors
  let code: ResCode = validate_match_ins(req.body.id, req.body.gameNumber, null, null);
  if (code !== ResCode.Ok) {
    return res.status(code).end();
  }

  // Parsing body
  const id: number = req.body.id;
  const gameNumber: number = req.body.gameNumber;

  // Get objects
  const match: Match | undefined = matches[gameNumber];

  // Match or player DNE
  if (match === undefined || online[id] === undefined) {
    return res.status(ResCode.NotFound);
  }

  // Wait for 
  let wait_code: ResCode;
  wait_code = await match.wait_to_move(id);

  // TODO: Will soon return game state 
  return res.status(wait_code).end(match.get_data()) ;
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

  let code: ResCode = validate_match_ins(req.body.id, null, null, null);
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

// Returns a random paragraph from the database
app.get('/randomparagraph', (req, res) => {
  // Select only the needed columns
  const query = 'SELECT passage, question, choice_A, choice_B, choice_C, choice_D FROM mytable ORDER BY RAND() LIMIT 1';

  connection.query(query, (error, results) => {
      if (error) {
          res.status(500).send({ error: 'Error fetching random row' });
      } else if (results.length > 0) {
          const row = results[0];
          res.status(200).send({
              paragraph: row.passage,
              question: {
                text: row.question,
                options: [
                  row.choice_A,
                  row.choice_B,
                  row.choice_C,
                  row.choice_D
                ]
              }
          });
      } else {
          res.status(404).send({ error: 'No data found' });
      }
  });
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
  gameNumber: any,
  actionType: any,
  monster_id: any,
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

  let is_swap: boolean = false;
  if (actionType !== null) {
    if (actionType === undefined) {
      return ResCode.ActionUndef;
    } else if (typeof actionType !== 'number') {
      return ResCode.ActionNaN;
    } else if (!validActions.has(actionType)) {
      return ResCode.InvalidAction;
    } else if (actionType as Action === Action.SwapMonster) {
      is_swap = true
    }
  }

  // Validating the player id if it is needed
  if (monster_id !== null && is_swap) {
    if (monster_id === undefined) {
      return ResCode.PIDUndef;
    } else if (typeof monster_id !== 'number') {
      return ResCode.PIDNaN;
    } 
  }

  // Other validation will go here...

  // all clear
  return ResCode.Ok;
}

export { 
  matches,
  online
}
