import { Grid, Cell } from "./grid"
import * as e from "./event"
import * as a from "./actor"
import { StateChangeCalculator } from "./state_change_calculator"
import { World } from "./state"
import { extend } from "./lang"
import { StateChangeEvent, Tick, TickEvent } from "./event";

export class Engine {
    private readonly input_events: e.InputEvent[] = [];
    private readonly events: e.StateChangeEvent[] = [];
    private tick: number = 0;
    private processedOffset: number = 0;
    private readonly state_change_calculator = new StateChangeCalculator();
    private readonly world = new World();

    act(event: e.InputEvent) {
        this.input_events.push(event);
        extend(this.events, StateChangeCalculator.calculate_state_changes([event], this.tick));
    }

    snapshot() {
        return this.world.snapshot();
    }

    get_unique_actor_id() {
        return this.world.get_unique_actor_id();
    }

    run() {
        let interrupt_pc = false;
        while (interrupt_pc == false) {
            interrupt_pc = this.process_events();
            if (!interrupt_pc) {
                this.tick += 1;
                this.events.push(new Tick(this.tick))
            }
        }
    }

    process_events() {
        let interrupt_pc = false;
        while (this.processedOffset < this.events.length) {
            const event: e.StateChangeEvent = this.events[this.processedOffset];
            console.log(event.kind);
            switch (event.kind) {
                case "conscious-decision": interrupt_pc = true;
                default: this.apply_state_change(event);
            }
            this.processedOffset += 1;
        }
        return interrupt_pc;
    }

    private apply_state_change(event: StateChangeEvent) {
        let reactions = this.world.apply_state_change(event, this.tick);
        if (reactions.length > 0) {
            this.events.splice(this.processedOffset + 1, 0, ...reactions);
        }
    }

    current_tick(): number {
        return this.tick;
    }
}
