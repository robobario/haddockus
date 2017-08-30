import { Grid } from "./grid";

export class Snapshot {
    readonly grid: Grid;
    readonly is_alive: boolean;
    constructor(grid: Grid, is_alive: boolean) {
        this.grid = grid;
        this.is_alive = is_alive;
    }
}