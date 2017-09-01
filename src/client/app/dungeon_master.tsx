import { BaseActor } from "./actor";
import {
    NpcDecision, PcDecision, PlaceFloor, PlaceSword, PlaceWall, SpawnMonster, SpawnPc,
    StateChangeEvent
} from "./event";
import { Coordinates } from "./grid";

export class DungeonMaster extends BaseActor {
    readonly kind = "dungeon-master";

    react(event: StateChangeEvent, tick: number): StateChangeEvent[] {
        if (event.kind === "enter-level") {
            let events: StateChangeEvent[] = [];
            for (let _x = 0; _x < this.grid.width; _x++) {
                for (let _y = 0; _y < this.grid.height; _y++) {
                    events.push(new PlaceFloor(tick, new Coordinates(_x, _y)));
                }
            }
            for (let _x = 0; _x < this.grid.width; _x++) {
                events.push(new PlaceWall(tick, new Coordinates(_x, 0)));
                events.push(new PlaceWall(tick, new Coordinates(_x, this.grid.height - 1)));
            }
            for (let _y = 1; _y < this.grid.height - 1; _y++) {
                events.push(new PlaceWall(tick, new Coordinates(0, _y)));
                events.push(new PlaceWall(tick, new Coordinates(this.grid.width - 1, _y)));
            }
            events.push(new SpawnPc(tick, event.actor_id, new Coordinates(5, 5)));
            events.push(new SpawnMonster(tick, this.engine.get_unique_actor_id(), new Coordinates(8, 3)));
            events.push(new PlaceSword(tick, this.engine.get_unique_actor_id(), new Coordinates(12, 8)));
            return events;
        } else if (event.kind === "spawn-monster") {
            return [new NpcDecision(tick, event.actor_id)]
        }
        else if (event.kind === "spawn-pc") {
            return [new PcDecision(tick, event.actor_id)]
        }
        return [];
    }

}