import { Grid, Cell } from "./grid.tsx"
import * as e from "./event.tsx"
import * as a from "./actor.tsx"
import { StateChangeCalculator } from "./state_change_calculator.tsx"
import { extend, iteritems } from "./lang.tsx"

export class World {
    private grid: Grid = new Grid(16, 16);
    private actors: { [key: number]: a.Actor } = {};
    private id_sequence: number = 0;

    private actor(id: number) {
        return this.actors[id];
    }

    private add_actor(actor: a.Actor, x: number, y: number) {
        this.actors[actor.actor_id] = actor;
        this.grid.add_actor(x, y, actor);
    }

    private spawn_pc(event: e.SpawnPc) {
        var pc = new a.Character(event.actor_id, this.grid);
        this.add_actor(pc, event.x, event.y);
    }

    private place_wall(event: e.PlaceWall) {
        var wall = new a.Wall(this.get_unique_actor_id(), this.grid);
        this.add_actor(wall, event.x, event.y);
    }

    get_unique_actor_id() {
        return ++this.id_sequence;
    }

    snapshot() {
        return this.grid
    }

    apply_state_change(event: e.StateChangeEvent, tick: number): e.StateChangeEvent[] {
        switch (event.kind) {
            case "place-wall": this.place_wall(event); break;
            case "place-floor": this.grid.get(event.x, event.y).set_floor(true); break;
            case "spawn-pc": this.spawn_pc(event); break;
            case "conscious-decision": this.queue_next_decision(event, tick); break;
            case "start-move": this.start_move(event, tick); break;
            case "finish-move": this.finish_move(event); break;
            case "negate": this.negate(event); break;
        }
        return this.react(event, tick);
    }

    private negate(event: e.Negate) {
        let negated = event.event_to_negate;
        switch (negated.kind) {
            case "finish-move": this.grid.move(negated.actor_id, e.opposite_direction(negated.direction))
        }
    }

    private react(event: e.StateChangeEvent, tick: number): e.StateChangeEvent[] {
        let reactions: e.StateChangeEvent[] = [];
        iteritems(this.actors, function(id, actor) {
            extend(reactions, actor.react(event, tick));
        })
        return reactions;
    }

    queue_next_decision(event: e.ConsciousDecision, tick: number) {
        this.queue_action(event.actor_id, new e.ConsciousDecision(event.actor_id), tick)
    }

    start_move(move: e.StartMove, tick: number) {
        this.queue_action(move.actor_id, move, tick)
    }

    finish_move(move: e.FinishMove) {
        this.grid.move(move.actor_id, move.direction);
    }

    queue_action(actor_id: number, trigger_event: e.StateChangeEvent, tick: number) {
        let actor = this.actor(actor_id);
        switch (actor.kind) {
            case "character": actor.actions.push(new a.Action(trigger_event, tick)); break;
            default: throw new Error('tried to queue action for non character action');
        }
    }

    resolve_actions(tick: number): e.StateChangeEvent[] {
        let actions: e.StateChangeEvent[] = [];
        let state = this;
        iteritems(this.actors, function(id, actor) {
            switch (actor.kind) {
                case "character": extend(actions, state.resolve_actions_for_actor(actor, tick)); break;
            }
        });
        return actions
    }


    resolve_actions_for_actor(actor: a.Character, tick: number): e.StateChangeEvent[] {
        let actions: e.StateChangeEvent[] = [];
        for (let i = actor.actions.length - 1; i >= 0; i--) {
            let action = actor.actions[i];
            switch (action.event.kind) {
                case "conscious-decision": if (tick - action.start_tick >= actor.base_decision_interval) {
                    actions.push(new e.ConsciousDecision(actor.actor_id));
                    actor.actions.splice(i, 1);
                }; break;
                case "start-move": if (tick - action.start_tick >= 500) {
                    actions.push(new e.FinishMove(actor.actor_id, action.event.direction));
                    actor.actions.splice(i, 1);
                }; break;
            }
        }
        return actions;
    }

}
