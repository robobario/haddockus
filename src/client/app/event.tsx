import { Actor } from './actor.tsx';

export const enum Direction {
    Up,
    Down,
    Left,
    Right
}
export class PlaceWall {
    readonly kind = "place-wall";
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
export class PlaceFloor {
    readonly kind = "place-floor";
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
export class SpawnPc {
    readonly kind = "spawn-pc";
    readonly x: number;
    readonly y: number;
    readonly actor_id: number;
    constructor(x: number, y: number, id: number) {
        this.x = x;
        this.y = y;
        this.actor_id = id;
    }
}
export class ConsciousDecision {
    readonly kind = "conscious-decision";
    readonly actor_id: number;
    constructor(actor_id: number) {
        this.actor_id = actor_id;
    }
}
export class RequestMove {
    readonly kind = "request-move";
    readonly actor_id: number;
    readonly direction: Direction;
    constructor(actor_id: number, direction: Direction) {
        this.actor_id = actor_id;
        this.direction = direction;
    }
}
export class StartMove {
    readonly kind = "start-move";
    readonly actor_id: number;
    readonly direction: Direction;
    constructor(actor_id: number, direction: Direction) {
        this.actor_id = actor_id;
        this.direction = direction;
    }
}
export class FinishMove {
    readonly kind = "finish-move";
    readonly actor_id: number;
    readonly direction: Direction;
    constructor(actor_id: number, direction: Direction) {
        this.actor_id = actor_id;
        this.direction = direction;
    }
}
export type InputEvent = PlaceWall | PlaceFloor | SpawnPc | RequestMove
export type StateChangeEvent = PlaceWall | PlaceFloor | SpawnPc | ConsciousDecision | StartMove | FinishMove