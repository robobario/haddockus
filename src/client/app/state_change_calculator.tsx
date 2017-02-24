import * as e from "./event.tsx"

function extend<T>(a: T[], b: T[]) {
    a.push.apply(a, b);
}

export class StateChangeCalculator {
    calculate_state_changes(input_events: e.InputEvent[]): e.StateChangeEvent[] {
        var state_changes: e.StateChangeEvent[] = [];
        for (let event of input_events) {
            switch (event.kind) {
                case "place-floor":
                case "place-wall": state_changes.push(event); break;
                case "spawn-pc": extend(state_changes, this.spawn_pc(event)); break;
                case "request-move": state_changes.push(new e.StartMove(event.actor_id, event.direction)); break;
            }
        }
        return state_changes;
    }

    spawn_pc(event: e.SpawnPc): e.StateChangeEvent[] {
        return [event, new e.ConsciousDecision(event.actor_id)];
    }
}