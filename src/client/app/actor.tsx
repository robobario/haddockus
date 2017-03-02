import { StateChangeEvent, FinishMove, Negate, ConsciousDecision } from './event.tsx'
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

abstract class BaseActor {
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
    private actions: Action[] = [];
    readonly base_decision_interval: number = 500;

    react(event: StateChangeEvent, tick: number): StateChangeEvent[] {
        return EMPTY;
    }

    queue_action(trigger: StateChangeEvent, tick: number) {
        this.actions.push(new Action(trigger, tick));
    }

    resolve_actions(tick: number): StateChangeEvent[] {
        let actions: StateChangeEvent[] = [];
        for (let i = this.actions.length - 1; i >= 0; i--) {
            let action = this.actions[i];
            switch (action.event.kind) {
                case "conscious-decision": if (tick - action.start_tick >= this.base_decision_interval) {
                    actions.push(new ConsciousDecision(this.actor_id));
                    this.actions.splice(i, 1);
                }; break;
                case "start-move": if (tick - action.start_tick >= 500) {
                    actions.push(new FinishMove(this.actor_id, action.event.direction));
                    this.actions.splice(i, 1);
                }; break;
            }
        }
        return actions;
    }
}

export class Wall extends BaseActor {
    readonly kind = "wall";

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
