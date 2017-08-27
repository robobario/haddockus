import { Grid } from "./grid"
import * as e from "./event"
import * as a from "./character"
import { flatmap } from "./lang"
import { Actor, BaseActor } from "./actor";
import { Wall } from "./scenery";
import { Species } from "./character";

export class World extends BaseActor {
    readonly kind = "world";
    private actors: { [key: string]: Actor } = {};
    private id_sequence: number = 0;

    constructor() {
        super(String(0), new Grid(16, 16));
    }

    private actor(id: string) {
        return this.actors[id];
    }

    private add_actor(actor: Actor, x: number, y: number) {
        this.actors[actor.actor_id] = actor;
        this.grid.add_actor(x, y, actor);
    }

    private spawn_monster(event: e.SpawnMonster) {
        const monster = new a.Character(Species.Goblin, event.actor_id, this.grid);
        this.add_actor(monster, event.x, event.y);
    }

    private spawn_pc(event: e.SpawnPc) {
        const pc = new a.Character(Species.Human, event.actor_id, this.grid);
        this.add_actor(pc, event.x, event.y);
    }

    private place_wall(event: e.PlaceWall) {
        const wall = new Wall(this.get_unique_actor_id(), this.grid);
        this.add_actor(wall, event.x, event.y);
    }

    get_unique_actor_id() {
        return String(++this.id_sequence);
    }

    snapshot() {
        return this.grid
    }

    react(event: e.StateChangeEvent, tick: number): e.StateChangeEvent[] {
        switch (event.kind) {
            case "place-wall": this.place_wall(event); break;
            case "place-floor": this.grid.get(event.x, event.y).set_floor(true); break;
            case "spawn-pc": this.spawn_pc(event); break;
            case "spawn-monster": this.spawn_monster(event); break;
            case "finish-move": this.finish_move(event); break;
            case "negate": this.negate(event); break;
        }
        return this.all_actors_react(event, tick);
    }

    private negate(event: e.Negate) {
        let negated = event.event_to_negate;
        switch (negated.kind) {
            case "finish-move": this.grid.move(negated.actor_id, e.opposite_direction(negated.direction))
        }
    }

    private all_actors_react(event: e.StateChangeEvent, tick: number): e.StateChangeEvent[] {
        return flatmap(this.actors, (id: string, actor: Actor) => {
            return actor.react(event, tick);
        });
    }

    finish_move(move: e.FinishMove) {
        this.grid.move(move.actor_id, move.direction);
    }
}
