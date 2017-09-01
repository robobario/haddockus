import { Grid, Cell } from "./grid"
import * as e from "./event"
import * as a from "./character"
import { World } from "./world"
import { extend } from "./lang"
import { StateChangeEvent, StartTick, TickEvent, EndTick } from "./event";
import { Snapshot } from "./snapshot";

export enum State {
    RUNNING,
    DECISION_REQUIRED,
    PC_DEAD
}

export class Engine {
    private readonly events: e.StateChangeEvent[] = [];
    private tick: number = 0;
    private processedOffset: number = 0;
    private readonly world = new World(this);
    private player_character_id: string = this.get_unique_actor_id();
    private active: boolean = true;

    act(event: e.InputEvent) {
        if (!this.active) {
            console.log("Game over!")
        }
        this.events.push(event);
    }

    snapshot() {
        return new Snapshot(this.world.snapshot(), this.active);
    }

    get_unique_actor_id() {
        return this.world.get_unique_actor_id();
    }

    get_player_character_id() {
        return this.player_character_id;
    }

    run(): State {
        if (!this.active) {
            return State.PC_DEAD;
        }
        let interrupt_pc = State.RUNNING;

        function max(tick_result: State, end_tick_result: State) {
            if (tick_result == State.PC_DEAD || end_tick_result == State.PC_DEAD) {
                return State.PC_DEAD;
            } else if (tick_result == State.DECISION_REQUIRED || end_tick_result == State.DECISION_REQUIRED) {
                return State.DECISION_REQUIRED;
            }
            return State.RUNNING;
        }

        while (interrupt_pc == State.RUNNING) {
            this.events.push(new StartTick(this.tick));
            let tick_result = this.process_events();
            this.events.push(new EndTick(this.tick));
            let end_tick_result = this.process_events();
            interrupt_pc = max(tick_result, end_tick_result);
            if (interrupt_pc == State.RUNNING) {
                this.tick += 1;
            }
        }
        if (interrupt_pc == State.PC_DEAD) {
            this.active = false;
        }
        return interrupt_pc;
    }

    process_events(): State {
        let interrupt_pc = State.RUNNING;
        while (this.processedOffset < this.events.length) {
            const event: e.StateChangeEvent = this.events[this.processedOffset];
            console.log(event.kind);
            switch (event.kind) {
                case "pc-decision": interrupt_pc = State.DECISION_REQUIRED; break;
                case "death": if (event.actor_id == this.get_player_character_id()) { interrupt_pc = State.PC_DEAD } break;
            }
            this.apply_state_change(event);
            this.processedOffset += 1;
        }
        return interrupt_pc;
    }

    private apply_state_change(event: StateChangeEvent) {
        let reactions = this.world.react(event, this.tick);
        if (reactions.length > 0) {
            this.events.splice(this.processedOffset + 1, 0, ...reactions);
        }
    }

    current_tick(): number {
        return this.tick;
    }
}
