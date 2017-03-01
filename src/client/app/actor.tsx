import { StateChangeEvent, FinishMove, Negate } from './event.tsx'
import { Grid } from './grid.tsx'
import { extend } from './lang.tsx'

const EMPTY: StateChangeEvent[] = [];

export class Action {
    readonly event: StateChangeEvent;
    readonly start_tick: number;

    constructor(event: StateChangeEvent, start_tick: number) {
        this.event = event;
        this.start_tick = start_tick;
    }
}

export abstract class BaseActor {
    readonly actor_id: number;
    readonly random_num: number;
    readonly grid: Grid;
    abstract readonly kind: string;

    constructor(actor_id: number, grid: Grid) {
        this.actor_id = actor_id;
        this.grid = grid;
        this.random_num = Math.floor(Math.random() * 100) + 1;
    }

    abstract react(event: StateChangeEvent, tick: number): StateChangeEvent[];
}

export class Character extends BaseActor {
    readonly kind = "character";
    actions: Action[] = [];
    readonly base_decision_interval: number = 500;

    constructor(actor_id: number, grid: Grid) {
        super(actor_id, grid);
    }

    react(event: StateChangeEvent, tick: number): StateChangeEvent[] {
        return EMPTY;
    }
}

export class Wall extends BaseActor {
    readonly kind = "wall";

    constructor(actor_id: number, grid: Grid) {
        super(actor_id, grid);
    }

    react(event: StateChangeEvent, tick: number): StateChangeEvent[] {
        var reactions = [];
        switch (event.kind) {
            case "finish-move": extend(reactions, this.negate_movement_into_wall(event)); break;
        }
        return reactions;
    }

    negate_movement_into_wall(event: FinishMove) {
        if (this.grid.locate(this.actor_id) === this.grid.locate(event.actor_id)) {
            return [new Negate(event)];
        } else {
            return EMPTY;
        }
    }
}

export type Actor = Character | Wall
