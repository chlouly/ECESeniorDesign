import { Player, Action, PlayerRow, player2row } from './player';
import { matches, online } from '../app';
import { ResCode, isResCode } from '../error';
import { fetch_monster } from '../rds_actions';
import { Monster } from './monster';

const MAX_OCCUPANCY: number = 2;
const WAIT_TIMEOUT: number = 5 * 60 * 1000; // Timeout for waiting 5 minutes (in ms)
const TURN_POLL: number = 1 * 1000          // Polls to see if it's your turn every second (in ms)

class Match {
    private players: { [key: number] : Player } = {};
    public match_number: number;
    private to_move: number = 0;        // The player ID of the player who moves now
    private next_to_move: number = 0;   // The player ID of the player who moves next
    private loser: number = 0;         // The id of the winner of the game (0 when game is in progress)

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
        return (this.occupancy() >= MAX_OCCUPANCY) 
    }

    // Takes a player id and checks if that player is in the match
    public is_in_match(id: number): boolean { 
        return this.players[id] !== undefined ; 
    } 

    private is_your_turn(id: number): boolean {
        return this.to_move === id;
    }

    public loser_id(): number | null {
        return (this.loser === 0)? null : this.loser;
    }

    public async join(player: Player): Promise<boolean> {
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

        if (player.current_monster === null) {
            if (player.monsters_roster[0] !== undefined) {
                const monster = await fetch_monster(player.get_id(), player.monsters_roster[0]);
                if (!isResCode(monster)) {
                    player.current_monster = monster;
                }
            }
        }

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

        this.players[id].heal_all();

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
    public async take_turn(id: number, action: Action, m_id: number | null, corr_ans: number, chosen_ans: number): Promise<ResCode> {
        // You're not playing
        if (!this.is_in_match(id)) {
            return ResCode.NotFound;
        }

        // Not your turn
        if (this.to_move !== id) {
            return ResCode.NotYourTurn;
        }

        if (corr_ans !== chosen_ans) {
            this.next_turn();
            return ResCode.Incorrect;
        }

        // Perform the action
        let code: ResCode = await this.players[id].perform_action(this.players[this.next_to_move], action, m_id);

        // If the turn was successful, go to the next one
        if (code === ResCode.Ok) {
            this.next_turn();
        }

        return ResCode.Correct;
    }

    public async check_for_win(id: number): Promise<ResCode | null> {
        if (this.loser === 0) {
            return null;
        } else if (this.loser === id) {
            return ResCode.Defeat;
        } else {
            return ResCode.Victory;
        }
    }

    public async wait_to_move(id: number): Promise<ResCode> {
        return new Promise ((resolve, _) => {
            if (!this.is_in_match(id)) {
                resolve(ResCode.NotInMatch);
            }

            const checkInterval = setInterval(async () => {
                const vic = await this.check_for_win(id);
                if (vic !== null) {
                    clearInterval(checkInterval);
                    resolve(vic);
                }
                if (this.is_your_turn(id) && this.is_full()) {
                    clearInterval(checkInterval);
                    const code = await this.players[id].check_4_dead();
                    if (code === ResCode.Defeat) {
                        this.loser = id;
                    }
                    resolve(code);
                }
            }, TURN_POLL);

            setTimeout(() => {
                clearInterval(checkInterval);
                resolve(ResCode.WaitTimeout);
            }, WAIT_TIMEOUT);
        })
    }

    public get_data(): MatchData {
        return {
            gameNumber: this.match_number,
            to_move: this.to_move,
            next_to_move: this.next_to_move,
            players: Object.values(this.players).map(player => player.get_data())
        }
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

interface MatchData {
    gameNumber: number,
    to_move: number,
    next_to_move: number,
    players: PlayerRow[],
}

export {
    MatchQueue,
    Match
}
