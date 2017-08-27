import { Grid } from "./grid";
import { StateChangeEvent } from "./event";
import { Character } from "./character";
import { Wall } from "./scenery";
import { World } from "./world";

export abstract class BaseActor {
    readonly actor_id: string;
    readonly random_num: number;
    readonly grid: Grid;
    abstract readonly kind: string;

    constructor(actor_id: string, grid: Grid) {
        this.actor_id = actor_id;
        this.grid = grid;
        this.random_num = Math.floor(Math.random() * 100) + 1;
    }

    abstract react(event: StateChangeEvent, tick: number): StateChangeEvent[];
}

export type Actor = Character | Wall | World