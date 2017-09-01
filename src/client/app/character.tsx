import * as e from './event'
import { extend, iteritems } from './lang'
import { Actor, BaseActor } from "./actor";
import { Coordinates, Grid } from "./grid";
import { Damage, EndTick, Pickup, PickupAll, StartMove, StateChangeEvent } from "./event";
import { Engine } from "./engine";

const EMPTY: e.StateChangeEvent[] = [];
export const enum Species {
    Human,
    Goblin
}

export const enum HealthIndicator {
    NEAR_DEATH,
    SEVERELY_WOUNDED,
    HEAVILY_WOUNDED,
    MODERATELY_WOUNDED,
    LIGHTLY_WOUNDED,
    HEALTHY
}

export class Character extends BaseActor {
    readonly kind = "character";
    private actions: e.StateChangeEvent[] = [];
    readonly base_decision_interval: number = 16;
    private hp: number = 50;
    private hp_max: number = 50;
    private alive: boolean = true;
    private death_event: e.Death | null = null;
    readonly species: Species = Species.Human;
    readonly actors: { [key: string]: Actor } = {};

    constructor(species: Species, actor_id: string, grid: Grid, engine: Engine) {
        super(actor_id, grid, engine);
        this.species = species;
    }

    is_alive(): boolean {
        return this.alive;
    }

    get_health_indicator(): HealthIndicator {
        let percent = (this.hp * 100) / this.hp_max;
        if (percent <= 10) {
            return HealthIndicator.NEAR_DEATH;
        }
        else if (percent <= 20) {
            return HealthIndicator.SEVERELY_WOUNDED;
        }
        else if (percent <= 40) {
            return HealthIndicator.HEAVILY_WOUNDED;
        }
        else if (percent <= 60) {
            return HealthIndicator.MODERATELY_WOUNDED;
        }
        else if (percent <= 80) {
            return HealthIndicator.LIGHTLY_WOUNDED;
        }
        else {
            return HealthIndicator.HEALTHY;
        }
    }

    react(event: e.StateChangeEvent, tick: number): e.StateChangeEvent[] {
        if (this.is_dead(tick)) {
            return EMPTY;
        }
        const reactions: e.StateChangeEvent[] = [];
        switch (event.kind) {
            case "tick": extend(reactions, this.resolve_actions(event.tick)); break;
            case "end-tick": extend(reactions, this.resolve_end_tick(event)); break;
            case "pc-decision": if (this.is_target_me(event)) { this.queue_action(event) } break;
            case "npc-decision": if (this.is_target_me(event)) { this.queue_action(event); this.queue_action(this.npc_decision(event)) } break;
            case "start-move": if (this.is_target_me(event)) { this.queue_action(event) } break;
            case "finish-move": extend(reactions, negate_movement_and_initiate_combat(event, this, tick)); break;
            case "initiate-combat": extend(reactions, this.resolve_initiate_combat(event)); break;
            case "melee": extend(reactions, this.resolve_incoming_melee(event)); break;
            case "damage": extend(reactions, this.resolve_damage(event)); break;
            case "death": extend(reactions, this.resolve_death(event)); break;
            case "pickup-all": if (this.is_target_me(event)) { this.queue_action(event) } break;
            case "pickup": extend(reactions, this.pickup(event)); break;
            case "start-wait": if (this.is_target_me(event)) { this.queue_action(event) } break;
            case "finish-wait": if (this.is_target_me(event)) { this.hp = this.hp + 1 } break;
        }
        return reactions;
    }

    private npc_decision(event: StateChangeEvent) {
        let my_cell = this.grid.locate(this.actor_id);
        let my_species = this.species;
        let me = this;
        let reaction: null | StateChangeEvent = null;
        this.grid.foreach((x, y, cell) => {
            if (Math.abs(my_cell.coordinate.x - x) < 5 && Math.abs(my_cell.coordinate.y - y) < 5) {
                let actors = cell.actors;
                iteritems(actors, function(key, value) {
                    switch (value.kind) {
                        case "character": if (value.species !== my_species) {
                            reaction = me.move_towards(event.tick, my_cell.coordinate, cell.coordinate)
                        }
                    }
                });
            }
        });
        if (reaction != null) {
            return reaction;
        }
        return new e.StartWait(event.tick, this.actor_id);
    }

    private move_towards(tick: number, from: Coordinates, to: Coordinates): StateChangeEvent {
        let diff_x = from.x - to.x;
        let diff_y = from.y - to.y;
        let abs_diff_x = Math.abs(diff_x);
        let abs_diff_y = Math.abs(diff_y);
        if (abs_diff_x > abs_diff_y) {
            if (diff_x < 0) {
                return new StartMove(tick, this.actor_id, e.Direction.Right)
            } else {
                return new StartMove(tick, this.actor_id, e.Direction.Left)
            }
        } else {
            if (diff_y < 0) {
                return new StartMove(tick, this.actor_id, e.Direction.Down)
            } else {
                return new StartMove(tick, this.actor_id, e.Direction.Up)
            }
        }
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
        console.log(this.hp);
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
                case "pickup-all": if (tick - event.tick >= 16) {
                    extend(state_changes, this.pickup_all(event, tick));
                    this.actions.splice(i, 1);
                } break;
            }
        }
        return state_changes;
    }

    private is_dead(tick: number) {
        return !this.alive && this.death_event !== null && this.death_event.tick != tick;
    }

    private resolve_end_tick(event: EndTick): StateChangeEvent[] {
        if (this.hp <= 0) {
            return [new e.Death(event.tick, this.actor_id)]
        } else {
            return EMPTY;
        }
    }

    private pickup(event: Pickup): StateChangeEvent[] {
        if (event.actor_id !== this.actor_id) {
            return EMPTY;
        }
        let cell = this.grid.locate(this.actor_id);
        let sword = cell.remove(event.item_id);
        this.actors[sword.actor_id] = sword;
        if (sword.kind == "sword") {
            sword.owner_id = this.actor_id;
        }
        return EMPTY;
    }

    private pickup_all(event: PickupAll, tick: number): StateChangeEvent[] {
        if (event.actor_id !== this.actor_id) {
            return EMPTY;
        }
        let cell = this.grid.locate(this.actor_id);
        let actors = cell.actors;
        for (let actor_id in actors) {
            if (actors.hasOwnProperty(actor_id)) {
                let act = actors[actor_id];
                switch (act.kind) {
                    case "sword": return [new Pickup(tick, this.actor_id, act.actor_id)];
                }
            }
        }
        return EMPTY;
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
