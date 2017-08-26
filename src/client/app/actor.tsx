import {
    StateChangeEvent, FinishMove, Negate, ConsciousDecision, NpcDecision, InitiateCombat, Melee,
    Damage,
    Death, ActorEvent, OneWayInteraction, FinishWait,
} from './event'
import { extend } from './lang'
import { Grid } from "./grid";

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
    readonly actor_id: string;
    readonly random_num: number;
    readonly grid: Grid;
    abstract readonly kind: string;

    constructor(actor_id: string, grid: Grid) {
        this.actor_id = actor_id;
        this.grid = grid;
        this.random_num = Math.floor(Math.random() * 100) + 1;
    }

    abstract react(event: StateChangeEvent, tick: number): StateChangeEvent[];
}

export class Character extends BaseActor {
    readonly kind = "character";
    private actions: Action[] = [];
    readonly base_decision_interval: number = 16;
    private hp: number = 50;
    private alive: boolean = true;

    is_alive(): boolean {
        return this.alive;
    }

    react(event: StateChangeEvent, tick: number): StateChangeEvent[] {
        if (!this.alive) {
            return EMPTY;
        }
        const reactions: StateChangeEvent[] = [];
        switch (event.kind) {
            case "finish-move": extend(reactions, negate_movement_and_initiate_combat(event, this, tick)); break;
            case "initiate-combat": extend(reactions, this.resolve_initiate_combat(event, tick)); break;
            case "melee": extend(reactions, this.resolve_incoming_melee(event, tick)); break;
            case "damage": extend(reactions, this.resolve_damage(event, tick)); break;
            case "death": extend(reactions, this.resolve_death(event)); break;
        }
        return reactions;
    }

    private resolve_death(event: Death): StateChangeEvent[] {
        if (this.is_target_me(event)) {
            this.alive = false;
        }
        return EMPTY;
    }

    private is_target_me(event: ActorEvent) {
        return event.actor_id === this.actor_id;
    }
    private is_one_way_target(event: OneWayInteraction) {
        return event.to_actor_id === this.actor_id;
    }

    private resolve_damage(event: Damage, tick: number): StateChangeEvent[] {
        if (!this.is_target_me(event)) {
            return EMPTY
        }
        this.hp = this.hp - event.damage;
        if (this.hp <= 0) {
            return [new Death(tick, this.actor_id)]
        }
        return EMPTY;
    }

    private resolve_initiate_combat(initiation: InitiateCombat, tick: number): StateChangeEvent[] {
        if (!this.is_one_way_target(initiation)) {
            return EMPTY
        }
        return [new Melee(tick, this.actor_id, initiation.from_actor_id, 5)];
    }

    private resolve_incoming_melee(event: Melee, tick: number): StateChangeEvent[] {
        if (!this.is_one_way_target(event)) {
            return EMPTY
        }
        return [new Damage(tick, this.actor_id, event.damage)];
    }

    queue_action(trigger: StateChangeEvent, tick: number) {
        this.actions.push(new Action(trigger, tick));
    }

    resolve_actions(tick: number): StateChangeEvent[] {
        if (!this.alive) {
            return EMPTY
        }
        let actions: StateChangeEvent[] = [];
        for (let i = this.actions.length - 1; i >= 0; i--) {
            let action = this.actions[i];
            switch (action.event.kind) {
                case "npc-decision": if (tick - action.start_tick >= this.base_decision_interval) {
                    actions.push(new NpcDecision(tick, this.actor_id));
                    this.actions.splice(i, 1);
                } break;
                case "conscious-decision": if (tick - action.start_tick >= this.base_decision_interval) {
                    actions.push(new ConsciousDecision(tick, this.actor_id));
                    this.actions.splice(i, 1);
                } break;
                case "start-move": if (tick - action.start_tick >= 16) {
                    actions.push(new FinishMove(tick, this.actor_id, action.event.direction));
                    this.actions.splice(i, 1);
                } break;
                case "start-wait": if (tick - action.start_tick >= 16) {
                    actions.push(new FinishWait(tick, this.actor_id));
                    this.actions.splice(i, 1);
                } break;
            }
        }
        return actions;
    }

}

export class Wall extends BaseActor {
    readonly kind = "wall";

    react(event: StateChangeEvent, tick: number): StateChangeEvent[] {
        const reactions: StateChangeEvent[] = [];
        switch (event.kind) {
            case "finish-move": extend(reactions, negate_movement(event, this)); break;
        }
        return reactions;
    }

}

function negate_movement_and_initiate_combat(event: FinishMove, actor: BaseActor, tick: number) {
    let thisActor = actor.actor_id;
    let movingActor = event.actor_id;
    if (thisActor === movingActor) {
        return EMPTY;
    }
    if (actor.grid.locate(thisActor) === actor.grid.locate(movingActor)) {
        return [new Negate(event), new InitiateCombat(tick, thisActor, movingActor)];
    } else {
        return EMPTY;
    }
}

function negate_movement(event: FinishMove, actor: BaseActor) {
    if (actor.actor_id === event.actor_id) {
        return EMPTY;
    }
    if (actor.grid.locate(actor.actor_id) === actor.grid.locate(event.actor_id)) {
        return [new Negate(event)];
    } else {
        return EMPTY;
    }
}
export type Actor = Character | Wall
