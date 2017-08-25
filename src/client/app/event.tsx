import { Actor } from './actor';

export const enum Direction {
    Up,
    Down,
    Left,
    Right
}

export function opposite_direction(d: Direction): Direction {
    switch (d) {
        case Direction.Up: return Direction.Down;
        case Direction.Down: return Direction.Up;
        case Direction.Left: return Direction.Right;
        case Direction.Right: return Direction.Left;
    }
}

export type InputEvent = PlaceWall | PlaceFloor | SpawnPc | SpawnMonster | RequestMove

export type StateChangeEvent = PlaceWall | PlaceFloor | SpawnPc | SpawnMonster | ConsciousDecision | NpcDecision | StartMove | FinishMove | Negate

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

export class SpawnMonster {
    readonly kind = "spawn-monster";
    readonly x: number;
    readonly y: number;
    readonly actor_id: string;
    constructor(x: number, y: number, id: string) {
        this.x = x;
        this.y = y;
        this.actor_id = id;
    }
}

export class SpawnPc {
    readonly kind = "spawn-pc";
    readonly x: number;
    readonly y: number;
    readonly actor_id: string;
    constructor(x: number, y: number, id: string) {
        this.x = x;
        this.y = y;
        this.actor_id = id;
    }
}

export class ConsciousDecision {
    readonly kind = "conscious-decision";
    readonly actor_id: string;
    constructor(actor_id: string) {
        this.actor_id = actor_id;
    }
}

export class NpcDecision {
    readonly kind = "npc-decision";
    readonly actor_id: string;
    constructor(actor_id: string) {
        this.actor_id = actor_id;
    }
}

export class Negate {
    readonly kind = "negate";
    readonly event_to_negate: StateChangeEvent;
    constructor(event_to_negate: StateChangeEvent) {
        this.event_to_negate = event_to_negate;
    }
}

export class RequestMove {
    readonly kind = "request-move";
    readonly actor_id: string;
    readonly direction: Direction;
    constructor(actor_id: string, direction: Direction) {
        this.actor_id = actor_id;
        this.direction = direction;
    }
}

export class StartMove {
    readonly kind = "start-move";
    readonly actor_id: string;
    readonly direction: Direction;
    constructor(actor_id: string, direction: Direction) {
        this.actor_id = actor_id;
        this.direction = direction;
    }
}

export class FinishMove {
    readonly kind = "finish-move";
    readonly actor_id: string;
    readonly direction: Direction;
    constructor(actor_id: string, direction: Direction) {
        this.actor_id = actor_id;
        this.direction = direction;
    }
}

