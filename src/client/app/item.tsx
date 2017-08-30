import { BaseActor } from "./actor";
import { StateChangeEvent } from "./event";
import { Grid } from "./grid";

const EMPTY: StateChangeEvent[] = [];
export abstract class Item extends BaseActor {
    readonly kind: string;
    readonly sprite: string;
    owner_id: string | null = null;

    react(event: StateChangeEvent, tick: number): StateChangeEvent[] {
        return EMPTY;
    }

    constructor(actor_id: string, grid: Grid) {
        super(actor_id, grid);
    }
}

export class Sword extends Item {
    readonly kind = "sword";
    readonly sprite: string = "sword";
}