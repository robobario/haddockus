import { Grid, Cell } from "./grid.tsx"
import * as e from "./event.tsx"
import * as a from "./actor.tsx"
import { StateChangeCalculator } from "./state_change_calculator.tsx"

function extend<T>(a: T[], b: T[]) {
    a.push.apply(a, b);
}


export class World {
    private grid: Grid = new Grid(16, 16);
    private actors: { [key: number]: a.Actor } = {};
    private id_sequence: number = 0;

    private actor(id: number) {
        return this.actors[id];
    }

    private spawn_pc(event: e.SpawnPc) {
        var pc = new a.Character(event.actor_id);
        this.actors[event.actor_id] = pc;
        this.grid.add_actor(event.x, event.y, pc);
    }

    private place_wall(event: e.PlaceWall) {
        var wall = new a.Wall(this.get_unique_actor_id());
        this.actors[wall.actor_id] = wall;
        this.grid.add_actor(event.x, event.y, wall);
    }

    get_unique_actor_id() {
        return ++this.id_sequence;
    }

    snapshot() {
        return this.grid
    }

    apply_state_change(event: e.StateChangeEvent, tick: number): e.StateChangeEvent[] {
        var reactions: e.StateChangeEvent[] = []
        switch (event.kind) {
            case "place-wall": this.place_wall(event); break;
            case "place-floor": this.grid.get(event.x, event.y).set_floor(true); break;
            case "spawn-pc": this.spawn_pc(event); break;
            case "conscious-decision": this.queue_next_decision(event, tick); break;
            case "start-move": this.start_move(event, tick); break;
            case "finish-move": this.finish_move(event); break;
        }
        return reactions;
    }


    queue_next_decision(event: e.ConsciousDecision, tick: number) {
        this.queue_action(event.actor_id, new e.ConsciousDecision(event.actor_id), tick)
    }

    start_move(move: e.StartMove, tick: number) {
        this.queue_action(move.actor_id, move, tick)
    }

    finish_move(move: e.FinishMove) {
        this.grid.move(this.actor(move.actor_id), move.direction);
    }

    queue_action(actor_id: number, trigger_event: e.StateChangeEvent, tick: number) {
        var actor = this.actor(actor_id);
        switch (actor.kind) {
            case "character": actor.actions.push(new a.Action(trigger_event, tick)); break;
            default: throw new Error('tried to queue action for non character action');
        }
    }

    resolve_actions(tick: number): e.StateChangeEvent[] {
        var actions: e.StateChangeEvent[] = [];
        var actorIds = Object.keys(this.actors);
        for (let id of actorIds) {
            var actor = this.actors[id];
            switch (actor.kind) {
                case "character": extend(actions, this.resolve_actions_for_actor(actor, tick)); break;
            }
        }
        return actions
    }


    resolve_actions_for_actor(actor: a.Character, tick: number): e.StateChangeEvent[] {
        var actions: e.StateChangeEvent[] = [];
        for (var i = actor.actions.length - 1; i >= 0; i--) {
            var action = actor.actions[i];
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
