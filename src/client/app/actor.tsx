import { StateChangeEvent } from './event.tsx'

export class Action {
    readonly event: StateChangeEvent;
    readonly start_tick: number;

    constructor(event: StateChangeEvent, start_tick: number) {
        this.event = event;
        this.start_tick = start_tick;
    }
}

export class Character {
    readonly actor_id: number;
    actions: Action[] = [];
    readonly kind = "character";
    readonly base_decision_interval: number = 500;
    constructor(actor_id: number) {
        this.actor_id = actor_id;
    }
}

export class Wall {
    readonly actor_id: number;
    readonly kind = "wall";
    constructor(actor_id: number) {
        this.actor_id = actor_id;
    }

}

export type Actor = Character | Wall
