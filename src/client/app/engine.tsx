import { Grid, Cell } from "./grid.tsx"
import * as e from "./event.tsx"
import * as a from "./actor.tsx"
import { StateChangeCalculator } from "./state_change_calculator.tsx"
import { World } from "./state.tsx"

function extend<T>(a: T[], b: T[]) {
    a.push.apply(a, b);
}

export class Engine {
    private input_events: e.InputEvent[] = [];
    private events: e.StateChangeEvent[] = [];
    private tick: number = 0;
    private processedOffset: number = 0;
    private state_change_calculator = new StateChangeCalculator();
    private world = new World();

    act(event: e.InputEvent) {
        this.input_events.push(event);
        extend(this.events, this.state_change_calculator.calculate_state_changes([event]));
    }

    snapshot() {
        return this.world.snapshot();
    }

    get_unique_actor_id() {
        return this.world.get_unique_actor_id();
    }

    run() {
        var interrupt_pc = false;
        while (interrupt_pc == false) {
            extend(this.events, this.world.resolve_actions(this.tick));
            interrupt_pc = this.process_events();
            if (!interrupt_pc) {
                this.tick += 1;
            }
        }
    }

    process_events() {
        var interrupt_pc = false;
        while (this.processedOffset < this.events.length) {
            var event: e.StateChangeEvent = this.events[this.processedOffset];
            switch (event.kind) {
                case "conscious-decision": interrupt_pc = true;
                default: extend(this.events, this.world.apply_state_change(event, this.tick));
            }
            this.processedOffset += 1;
        }
        return interrupt_pc;
    }
}
