import { Grid, Cell } from "./grid"
import * as e from "./event"
import * as a from "./actor"
import { StateChangeCalculator } from "./state_change_calculator"
import { extend, iteritems, flatmap } from "./lang"
import { Direction } from "./event";
import { Actor } from "./actor";

export class World {
    private grid: Grid = new Grid(16, 16);
    private actors: { [key: string]: a.Actor } = {};
    private id_sequence: number = 0;

    private actor(id: string) {
        return this.actors[id];
    }

    private add_actor(actor: a.Actor, x: number, y: number) {
        this.actors[actor.actor_id] = actor;
        this.grid.add_actor(x, y, actor);
    }

    private spawn_monster(event: e.SpawnMonster) {
        const monster = new a.Character(event.actor_id, this.grid);
        this.add_actor(monster, event.x, event.y);
    }

    private spawn_pc(event: e.SpawnPc) {
        const pc = new a.Character(event.actor_id, this.grid);
        this.add_actor(pc, event.x, event.y);
    }

    private place_wall(event: e.PlaceWall) {
        const wall = new a.Wall(this.get_unique_actor_id(), this.grid);
        this.add_actor(wall, event.x, event.y);
    }

    get_unique_actor_id() {
        return String(++this.id_sequence);
    }

    snapshot() {
        return this.grid
    }

    apply_state_change(event: e.StateChangeEvent, tick: number): e.StateChangeEvent[] {
        switch (event.kind) {
            case "place-wall": this.place_wall(event); break;
            case "place-floor": this.grid.get(event.x, event.y).set_floor(true); break;
            case "spawn-pc": this.spawn_pc(event); break;
            case "spawn-monster": this.spawn_monster(event); break;
            case "npc-decision": this.queue_monster_decision(event, tick); break;
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
        return flatmap(this.actors, (id: string, actor: Actor) => {
            return actor.react(event, tick);
        });
    }

    queue_monster_decision(event: e.NpcDecision, tick: number) {
        this.queue_action(event.actor_id, new e.StartMove(tick, event.actor_id, Direction.Left));
        this.queue_action(event.actor_id, new e.NpcDecision(tick, event.actor_id))
    }

    finish_move(move: e.FinishMove) {
        this.grid.move(move.actor_id, move.direction);
    }

    queue_action(actor_id: string, trigger_event: e.StateChangeEvent) {
        let actor = this.actor(actor_id);
        switch (actor.kind) {
            case "character": actor.queue_action(trigger_event); break;
            default: throw new Error('tried to queue action for non character action');
        }
    }

}
