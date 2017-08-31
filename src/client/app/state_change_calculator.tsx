import * as e from "./event"
import { extend } from "./lang"
import { InputEvent, SpawnPc, StateChangeEvent } from "./event";

export class StateChangeCalculator {
    static calculate_state_changes(input_events: InputEvent[], tick: number): StateChangeEvent[] {
        const state_changes: e.StateChangeEvent[] = [];
        for (let event of input_events) {
            switch (event.kind) {
                case "place-sword":
                case "place-floor":
                case "pickup-all":
                case "place-wall": state_changes.push(event); break;
                case "spawn-pc": extend(state_changes, StateChangeCalculator.spawn_pc(event, tick)); break;
                case "spawn-monster": extend(state_changes, StateChangeCalculator.spawn_monster(event, tick)); break;
                case "request-move": state_changes.push(new e.StartMove(tick, event.actor_id, event.direction)); break;
                case "request-wait": state_changes.push(new e.StartWait(tick, event.actor_id)); break;
            }
        }
        return state_changes;
    }

    static spawn_monster(event: e.SpawnMonster, tick: number): e.StateChangeEvent[] {
        return [event, new e.NpcDecision(tick, event.actor_id)];
    }

    static spawn_pc(event: SpawnPc, tick: number): StateChangeEvent[] {
        return [event, new e.PcDecision(tick, event.actor_id)];
    }
}
