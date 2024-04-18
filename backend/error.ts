
// This is an enum of response codes that will
// be sent as responses to backend API calls.
export enum ResCode {
    /* --- POSITIVE --- */
    // General
    Ok = 200,                   // Request was handled without issue, the desired result was achieved
    Waiting = 205,              // Waiting on something to happen
    YourTurn = 210,             // Your turn to move


    /* --- NEGATIVE --- */
    // General
    NoBody = 510,               // No request body given
    NotFound = 404,             // Requested resource was not found
    GnrlErr = 500,              // "General Error", non descript way to say something went wrong

    // 520s are to do with players
    PIDUndef = 520,             // No PID was given
    PIDNaN = 521,               // Player ID was NaN
    PlyrBusy = 522,             // Player is currently in a game

    // 530s are to do with Monsters
    MIDUndef = 530,             // No MID was given
    MIDNaN = 531,               // Monster ID was NaN

    // 540s are to do with Actions
    ActionUndef = 540,          // No Action Number was given
    ActionNaN = 541,            // Action number was NaN
    ActionNotPermitted = 542,   // Can not complete the desired action
    InvalidAction = 543,        // Not a real action
    SwapWoutMID = 544,          // Attempted to swap without providing an MID

    // 550s are to do with matches
    MtchUndef = 550,            // Game Number Field was undefined
    MtchFll = 551,              // Match was full
    MtchNaN = 552,              // Game Number was not a number
    MtchOutBnds = 553,          // Game number was out of bounds: [10000, 50000]
    NotYourTurn = 554,          // Not your turn to move
    WaitTimeout = 555,          // Took too long to become your turn, try again
    NotInMatch = 556,           // The desired player is not in this match

    // RDS Errors
    RDSErr = 600,


    // More to come...

    /* --- SPECIAL --- */
    NotImplemented = 999,       // Special error code for functions that have n0ot yet been implemented
}

export function isResCode(value: any): value is ResCode {
    return Object.values(ResCode).includes(value);
}
