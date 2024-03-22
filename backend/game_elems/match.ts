import { Player, Action } from './player';
import { matches, online } from '../app';
import { ResCode } from '../error';

const MAX_OCCUPANCY: number = 2;
const WAIT_TIMEOUT: number = 5 * 60 * 1000; // Timeout for waiting 5 minutes (in ms)
const TURN_POLL: number = 1 * 1000          // Polls to see if it's your turn every second (in ms)

class Match {
    private players: { [key: number] : Player } = {};
    public match_number: number;
    private to_move: number = 0;        // The player ID of the player who moves now
    private next_to_move: number = 0;   // The player ID of the player who moves next

    // Matches are empty to start with
    public constructor(match_number: number | null) {
        if (match_number === null) {
            this.match_number = Math.floor(Math.random() * 40000 + 10000)   // Rondom match number between 10000 and 50000
            return;
        }

        this.match_number = match_number;
    }

    public occupancy(): number { 
        return Object.keys(this.players).length
    }

    public is_full(): boolean { 
        return (this.occupancy() >= 2) 
    }

    // Takes a player id and checks if that player is in the match
    public is_in_match(id: number): boolean { 
        return this.players[id] !== undefined ; 
    } 

    private is_your_turn(id: number): boolean {
        return this.to_move === id;
    }

    public join(player: Player): boolean {
        // Match is full
        if (this.is_full()) { return false; }

        // The player is already in the match
        if (this.is_in_match(player.get_id())) { return false; }

        // Add player to the match
        this.players[player.get_id()] = player;
        player.current_game = this.match_number;

        // put the id in one of the two move slots
        if (this.to_move === 0) {
            this.to_move = player.get_id();
        } else if (this.next_to_move === 0) {
            this.next_to_move = player.get_id();
        } else { return false }

        return true;
    }

    private next_turn() {
        const val: number = this.next_to_move;
        this.next_to_move = this.to_move;
        this.to_move = val;
    }

    public leave_game(id: number): boolean {
        // player was not in the match
        if (!this.is_in_match(id)) {
            return false;
        }

        // The desired player is alone in the game so we may as well delete the game
        if (this.occupancy() <= 1) {
            this.self_destruct();
            return true;
        }

        this.players[id].current_game = null;
        if (this.to_move === id) {
            this.to_move = 0;
        } else if (this.next_to_move === id) {
            this.next_to_move = 0;
        }

        delete this.players[id];

        return true;
    }

    // Currently does nothing. Soon will make the game execute 1 turn
    public take_turn(id: number, action: Action, m_id: number | null): ResCode {
        // You're not playing
        if (!this.is_in_match(id)) {
            return ResCode.NotFound;
        }

        // Not your turn
        if (this.to_move !== id) {
            return ResCode.NotYourTurn;
        }

        // TODO
        // ANSWER SAT QUESTION

        // Perform the action
        let code: ResCode = this.players[id].perform_action(this.players[this.next_to_move], action, m_id);

        // If the turn was successful, go to the next one
        if (code === ResCode.Ok) {
            this.next_turn();
        }

        return code;
    }

    public async wait_to_move(id: number): Promise<ResCode> {
        return new Promise ((resolve, _) => {
            if (!this.is_in_match(id)) {
                resolve(ResCode.NotInMatch);
            }

            const checkInterval = setInterval(() => {
                if (this.is_your_turn(id)) {
                    clearInterval(checkInterval);
                    resolve(ResCode.Ok);
                }
            }, TURN_POLL);

            setTimeout(() => {
                clearInterval(checkInterval);
                resolve(ResCode.WaitTimeout);
            }, WAIT_TIMEOUT);
        })
    }

    public self_destruct() {
        // Change the status of any and all players
        Object.keys(this.players)
            .map((id) => {
                online[parseInt(id)].current_game = null;
            }
        );

        // Delete this game from the game dictionary
        delete matches[this.match_number];
    }
}

class MatchQueue {
    private items: Player[] = [];

    enqueue(item: Player): void {
        this.items.push(item);
    }

    dequeue(): Player | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        return this.items.shift();
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    peek(): Player | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        return this.items[0];
    }

    size(): number {
        return this.items.length;
    }

    // Creates a new match
    newMatch(): number {
        let match = new Match(null);

        // If there are less than 2 players in the queue
        if (this.size() < 2) {
            return -1;
        }

        let player: Player | undefined;

        if ((player = this.dequeue()) === undefined) {
            //match.quit();
            return -1;
        }
        match.join(player);

        if ((player = this.dequeue()) === undefined) {
            //match.quit();
            return -1;
        }
        match.join(player);

        matches[match.match_number] = match;

        return match.match_number;
    }
}

export {
    MatchQueue,
    Match
}