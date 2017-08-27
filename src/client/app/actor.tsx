import {
    StateChangeEvent, FinishMove, Negate, ConsciousDecision, NpcDecision, InitiateCombat, Melee,
    Damage,
    Death, ActorEvent, OneWayInteraction, FinishWait,
} from './event'
import { extend } from './lang'
import { Grid } from "./grid";

const EMPTY: StateChangeEvent[] = [];

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
    private actions: StateChangeEvent[] = [];
    readonly base_decision_interval: number = 16;
    private hp: number = 50;
    private alive: boolean = true;
    private death_event: Death | null = null;

    is_alive(): boolean {
        return this.alive;
    }

    react(event: StateChangeEvent, tick: number): StateChangeEvent[] {
        if (this.is_dead(tick)) {
            return EMPTY;
        }
        const reactions: StateChangeEvent[] = [];
        switch (event.kind) {
            case "finish-move": extend(reactions, negate_movement_and_initiate_combat(event, this, tick)); break;
            case "initiate-combat": extend(reactions, this.resolve_initiate_combat(event)); break;
            case "melee": extend(reactions, this.resolve_incoming_melee(event)); break;
            case "damage": extend(reactions, this.resolve_damage(event)); break;
            case "death": extend(reactions, this.resolve_death(event)); break;
        }
        return reactions;
    }

    private resolve_death(event: Death): StateChangeEvent[] {
        if (this.is_target_me(event)) {
            this.alive = false;
            this.death_event = event;
        }
        return EMPTY;
    }

    private is_target_me(event: ActorEvent) {
        return event.actor_id === this.actor_id;
    }
    private is_one_way_target(event: OneWayInteraction) {
        return event.to_actor_id === this.actor_id;
    }

    private resolve_damage(event: Damage): StateChangeEvent[] {
        if (!this.is_target_me(event)) {
            return EMPTY
        }
        this.hp = this.hp - event.damage;
        if (this.hp <= 0) {
            return [new Death(event.tick, this.actor_id)]
        }
        return EMPTY;
    }

    private resolve_initiate_combat(initiation: InitiateCombat): StateChangeEvent[] {
        if (!this.is_one_way_target(initiation)) {
            return EMPTY
        }
        return [new Melee(initiation.tick, this.actor_id, initiation.from_actor_id, 5)];
    }

    private resolve_incoming_melee(event: Melee): StateChangeEvent[] {
        if (!this.is_one_way_target(event)) {
            return EMPTY
        }
        return [new Damage(event.tick, this.actor_id, event.damage)];
    }

    queue_action(trigger: StateChangeEvent) {
        this.actions.push(trigger);
    }

    resolve_actions(tick: number): StateChangeEvent[] {
        if (this.is_dead(tick)) {
            return EMPTY
        }
        let state_changes: StateChangeEvent[] = [];
        for (let i = this.actions.length - 1; i >= 0; i--) {
            let e = this.actions[i];
            switch (e.kind) {
                case "npc-decision": if (tick - e.tick >= this.base_decision_interval) {
                    state_changes.push(new NpcDecision(tick, this.actor_id));
                    this.actions.splice(i, 1);
                } break;
                case "conscious-decision": if (tick - e.tick >= this.base_decision_interval) {
                    state_changes.push(new ConsciousDecision(tick, this.actor_id));
                    this.actions.splice(i, 1);
                } break;
                case "start-move": if (tick - e.tick >= 16) {
                    state_changes.push(new FinishMove(tick, this.actor_id, e.direction));
                    this.actions.splice(i, 1);
                } break;
                case "start-wait": if (tick - e.tick >= 16) {
                    state_changes.push(new FinishWait(tick, this.actor_id));
                    this.actions.splice(i, 1);
                } break;
            }
        }
        return state_changes;
    }

    private is_dead(tick: number) {
        return !this.alive && this.death_event !== null && this.death_event.tick != tick;
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
