import { StateChangeEvent, FinishMove, Negate } from './event.tsx'
import { Grid } from './grid.tsx'

const EMPTY: StateChangeEvent[] = [];

function extend<T>(a: T[], b: T[]) {
    a.push.apply(a, b);
}

export class Action {
    readonly event: StateChangeEvent;
    readonly start_tick: number;

    constructor(event: StateChangeEvent, start_tick: number) {
        this.event = event;
        this.start_tick = start_tick;
    }
}

export class Character {
    readonly actor_id: number;
    actions: Action[] = [];
    readonly grid: Grid; 
    readonly kind = "character";
    readonly base_decision_interval: number = 500;
    constructor(actor_id: number, grid:Grid) {
        this.actor_id = actor_id;
        this.grid = grid;
    }
    react(event: StateChangeEvent, tick:number): StateChangeEvent[] {
        return EMPTY;
    }
}

export class Wall {
    readonly actor_id: number;
    readonly grid: Grid; 
    readonly kind = "wall";
    constructor(actor_id: number, grid:Grid) {
        this.actor_id = actor_id;
        this.grid = grid;
    }
    react(event: StateChangeEvent, tick:number): StateChangeEvent[] {
        var reactions = [];
        switch(event.kind) {
           case "finish-move" : extend(reactions, this.negate_movement_into_wall(event)); break;
        }
        return reactions;
    }
    negate_movement_into_wall(event: FinishMove) {
      if(this.grid.locate(this.actor_id) === this.grid.locate(event.actor_id)){
        return [new Negate(event)];
      }else{
        return EMPTY;
      }
    }
}

export type Actor = Character | Wall
