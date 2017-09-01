import { BaseActor } from "./actor";
import { Damage, Melee, StateChangeEvent } from "./event";
import { Grid } from "./grid";
import { Engine } from "./engine";

const EMPTY: StateChangeEvent[] = [];
export abstract class Item extends BaseActor {
    readonly kind: string;
    readonly sprite: string;
    owner_id: string | null = null;

    react(event: StateChangeEvent, tick: number): StateChangeEvent[] {
        switch (event.kind) {
            case "melee": return this.on_melee(event);
        }
        return EMPTY;
    }

    private on_melee(event: Melee): StateChangeEvent[] {
        if (event.from_actor_id == this.owner_id) {
            return [new Damage(5, event.to_actor_id, 5)];
        }
        return EMPTY;
    }

    constructor(actor_id: string, grid: Grid, engine: Engine) {
        super(actor_id, grid, engine);
    }
}

export class Sword extends Item {
    readonly kind = "sword";
    readonly sprite: string = "sword";
}