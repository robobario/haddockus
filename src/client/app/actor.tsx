import { Grid } from "./grid";
import { StateChangeEvent } from "./event";
import { Character } from "./character";
import { Wall } from "./scenery";
import { World } from "./world";
import { Sword } from "./item";
import { Engine } from "./engine";
import { DungeonMaster } from "./dungeon_master";

export abstract class BaseActor {
    readonly actor_id: string;
    readonly random_num: number;
    readonly grid: Grid;
    readonly engine: Engine;
    abstract readonly kind: string;

    constructor(actor_id: string, grid: Grid, engine: Engine) {
        this.actor_id = actor_id;
        this.grid = grid;
        this.random_num = Math.floor(Math.random() * 100) + 1;
        this.engine = engine;
    }

    abstract react(event: StateChangeEvent, tick: number): StateChangeEvent[];
}

export type Actor = Character | Wall | World | Sword | DungeonMaster