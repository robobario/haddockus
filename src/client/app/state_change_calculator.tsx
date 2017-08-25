import * as e from "./event"
import { extend } from "./lang"

export class StateChangeCalculator {
    static calculate_state_changes(input_events: e.InputEvent[]): e.StateChangeEvent[] {
        const state_changes: e.StateChangeEvent[] = [];
        for (let event of input_events) {
            switch (event.kind) {
                case "place-floor":
                case "place-wall": state_changes.push(event); break;
                case "spawn-pc": extend(state_changes, StateChangeCalculator.spawn_pc(event)); break;
                case "spawn-monster": extend(state_changes, StateChangeCalculator.spawn_monster(event)); break;
                case "request-move": state_changes.push(new e.StartMove(event.actor_id, event.direction)); break;
            }
        }
        return state_changes;
    }

    static spawn_monster(event: e.SpawnMonster): e.StateChangeEvent[] {
        return [event, new e.NpcDecision(event.actor_id)];
    }

    static spawn_pc(event: e.SpawnPc): e.StateChangeEvent[] {
        return [event, new e.ConsciousDecision(event.actor_id)];
    }
}
