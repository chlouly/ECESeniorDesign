
// This is an enum of response codes that will
// be sent as responses to backend API calls.
export enum ResCode {
    /* --- POSITIVE --- */
    // General
    Ok = 200,           // Request was handled without issue, the desired result was achieved
    Waiting = 205,      // Waiting on something to happen


    /* --- NEGATIVE --- */
    // General
    NoBody = 510,       // No request body given
    NotFound = 404,     // Requested resource was not found
    GnrlErr = 500,      // "General Error", non descript way to say something went wrong

    // 520s are to do with players
    PIDUndef = 520,     // No PID was given
    PIDNaN = 521,       // Player ID was NaN
    PlyrBusy = 522,     // Player is currently in a game

    // 530s are to do with matches
    MtchUndef = 530,    // Game Number Field was undefined
    MtchFll = 531,      // Match was full
    MtchNaN = 532,      // Game Number was not a number
    MtchOutBnds = 533,  // Game number was out of bounds: [10000, 50000]

    // More to come...

}
