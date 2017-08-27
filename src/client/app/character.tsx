import * as e from './event'
import { extend } from './lang'
import { BaseActor } from "./actor";
import { Grid } from "./grid";

const EMPTY: e.StateChangeEvent[] = [];
export const enum Species {
    Human,
    Goblin
}
export class Character extends BaseActor {
    readonly kind = "character";
    private actions: e.StateChangeEvent[] = [];
    readonly base_decision_interval: number = 16;
    private hp: number = 50;
    private alive: boolean = true;
    private death_event: e.Death | null = null;
    readonly species: Species = Species.Human;

    constructor(species: Species, actor_id: string, grid: Grid) {
        super(actor_id, grid);
        this.species = species;
    }

    is_alive(): boolean {
        return this.alive;
    }

    react(event: e.StateChangeEvent, tick: number): e.StateChangeEvent[] {
        if (this.is_dead(tick)) {
            return EMPTY;
        }
        const reactions: e.StateChangeEvent[] = [];
        switch (event.kind) {
            case "tick": extend(reactions, this.resolve_actions(event.tick)); break;
            case "pc-decision": if (this.is_target_me(event)) { this.queue_action(event) } break;
            case "npc-decision": if (this.is_target_me(event)) { this.queue_action(event); this.queue_action(new e.StartMove(event.tick, this.actor_id, e.Direction.Left)) } break;
            case "start-move": if (this.is_target_me(event)) { this.queue_action(event) } break;
            case "finish-move": extend(reactions, negate_movement_and_initiate_combat(event, this, tick)); break;
            case "initiate-combat": extend(reactions, this.resolve_initiate_combat(event)); break;
            case "melee": extend(reactions, this.resolve_incoming_melee(event)); break;
            case "damage": extend(reactions, this.resolve_damage(event)); break;
            case "death": extend(reactions, this.resolve_death(event)); break;
        }
        return reactions;
    }

    private resolve_death(event: e.Death): e.StateChangeEvent[] {
        if (this.is_target_me(event)) {
            this.alive = false;
            this.death_event = event;
        }
        return EMPTY;
    }

    private is_target_me(event: e.ActorEvent) {
        return event.actor_id === this.actor_id;
    }
    private is_one_way_target(event: e.OneWayInteraction) {
        return event.to_actor_id === this.actor_id;
    }

    private resolve_damage(event: e.Damage): e.StateChangeEvent[] {
        if (!this.is_target_me(event)) {
            return EMPTY
        }
        this.hp = this.hp - event.damage;
        if (this.hp <= 0) {
            return [new e.Death(event.tick, this.actor_id)]
        }
        return EMPTY;
    }

    private resolve_initiate_combat(initiation: e.InitiateCombat): e.StateChangeEvent[] {
        if (!this.is_one_way_target(initiation)) {
            return EMPTY
        }
        return [new e.Melee(initiation.tick, this.actor_id, initiation.from_actor_id, 5)];
    }

    private resolve_incoming_melee(event: e.Melee): e.StateChangeEvent[] {
        if (!this.is_one_way_target(event)) {
            return EMPTY
        }
        return [new e.Damage(event.tick, this.actor_id, event.damage)];
    }

    queue_action(trigger: e.StateChangeEvent) {
        this.actions.push(trigger);
    }

    resolve_actions(tick: number): e.StateChangeEvent[] {
        if (this.is_dead(tick)) {
            return EMPTY
        }
        let state_changes: e.StateChangeEvent[] = [];
        for (let i = this.actions.length - 1; i >= 0; i--) {
            let event = this.actions[i];
            switch (event.kind) {
                case "npc-decision": if (tick - event.tick >= this.base_decision_interval) {
                    state_changes.push(new e.NpcDecision(tick, this.actor_id));
                    this.actions.splice(i, 1);
                } break;
                case "pc-decision": if (tick - event.tick >= this.base_decision_interval) {
                    state_changes.push(new e.PcDecision(tick, this.actor_id));
                    this.actions.splice(i, 1);
                } break;
                case "start-move": if (tick - event.tick >= 16) {
                    state_changes.push(new e.FinishMove(tick, this.actor_id, event.direction));
                    this.actions.splice(i, 1);
                } break;
                case "start-wait": if (tick - event.tick >= 16) {
                    state_changes.push(new e.FinishWait(tick, this.actor_id));
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


function negate_movement_and_initiate_combat(event: e.FinishMove, actor: BaseActor, tick: number) {
    let thisActor = actor.actor_id;
    let movingActor = event.actor_id;
    if (thisActor === movingActor) {
        return EMPTY;
    }
    if (actor.grid.locate(thisActor) === actor.grid.locate(movingActor)) {
        return [new e.Negate(event), new e.InitiateCombat(tick, thisActor, movingActor)];
    } else {
        return EMPTY;
    }
}
