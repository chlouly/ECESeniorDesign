import { Player } from './player';
import { matches } from '../app';

class Match {
    private player_1: Player | null = null;
    private player_2: Player | null = null;

    public match_number: number;

    public constructor(match_number: number | null) {
        if (match_number === null) {
            this.match_number = Math.floor(Math.random() * 40000 + 10000)   // Rondom match number between 10000 and 50000
            return;
        }

        this.match_number = match_number;
    }

    public occupancy(): number {
        let num = 0;
        num += (this.player_1 === null)? 0 : 1;
        num += (this.player_2 === null)? 0 : 1;
        return num;
    }

    public is_full(): boolean { return (this.occupancy() >= 2) }

    // Takes a player id and checks if that player is in the match
    public is_in_match(id: number): boolean { 
        if (this.occupancy() === 0) { return false; }

        if (this.player_1 !== null) {
            if (this.player_1.get_id() === id) { return true; }
        }

        if (this.player_2 !== null) {
            if (this.player_2.get_id() === id) { return true; }
        }

        return false;
    } 

    public join(player: Player): Player | null {
        if (this.is_full()) {
            return player
        }

        // If player 1 is empty then place in player 1 slot
        if (this.player_1 === null) {
            this.player_1 = player;
            player.current_game = this.match_number;
            return null;
        }

        // If player 2 is empty then place in player 2 slot
        if (this.player_2 === null) {
            this.player_2 = player;
            player.current_game = this.match_number;
            return null;
        }

        // Should never reach this point
        return player;
    }

    public leave_game(id: number): boolean {
        // Player 1 is the one with this id
        if ((this.player_1 !== null) && (this.player_1.get_id() === id)) {
            this.player_1.current_game = null;
            this.player_1 = null;
            return true;
        }

        // Player 2 is the one with this id
        if ((this.player_2 !== null) && (this.player_2.get_id() === id)) {
            this.player_2.current_game = null;
            this.player_2 = null;
            return true;
        }

        // None of the statements executed, so the player was not in the match
        return false;
    }

    // Currently does nothing. Soon will make the game execute 1 turn
    public take_turn() {}
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
