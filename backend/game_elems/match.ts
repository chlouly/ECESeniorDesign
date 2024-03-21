import { Player } from './player';
import { matches, online } from '../app';

const MAX_OCCUPANCY: number = 2;

class Match {
    private players: Player[] = [];
    public match_number: number;

    public constructor(match_number: number | null) {
        if (match_number === null) {
            this.match_number = Math.floor(Math.random() * 40000 + 10000)   // Rondom match number between 10000 and 50000
            return;
        }

        this.match_number = match_number;
    }

    public occupancy(): number { 
        return this.players.length 
    }

    public is_full(): boolean { 
        return (this.occupancy() >= 2) 
    }

    // Takes a player id and checks if that player is in the match
    public is_in_match(id: number): boolean { 
        return this.players.some(player => player.get_id() === id); 
    } 

    public join(player: Player): boolean {
        // Match is full
        if (this.is_full()) { return false; }

        // The player is already in the match
        if (this.is_in_match(player.get_id())) { return false; }

        // Add player to the match
        this.players.push(player);
        player.current_game = this.match_number;

        return true;
    }

    public leave_game(id: number): boolean {
        // player was not in the match
        if (!this.is_in_match(id)) {
            return false;
        }

        // THe desired player is alone in the game so we may as well delete the game
        if (this.occupancy() <= 1) {
            this.self_destruct();
            return true;
        }

        const idx = this.players.map(player => player.get_id()).indexOf(id)

        if (idx === -1) { return false; }

        online[idx].current_game = null;
        this.players = this.players.filter(player => player.get_id() !== id);

        return true;
    }

    // Currently does nothing. Soon will make the game execute 1 turn
    public take_turn() {}

    public self_destruct() {
        // Change the status of any and all players
        this.players
            .map(player => player.get_id())
            .map((id) => {
                online[id].current_game = null;
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
