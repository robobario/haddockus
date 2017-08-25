import { Actor, Character } from './actor';

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

export type StateChangeEvent = PlaceWall | PlaceFloor | SpawnPc | SpawnMonster | ConsciousDecision | NpcDecision | StartMove | FinishMove | Negate | InitiateCombat | Melee | Damage | Death

abstract class OneWayInteraction {
    readonly from_actor_id: string;
    readonly to_actor_id: string;
    constructor(from_actor_id: string, to_actor_id: string) {
        this.from_actor_id = from_actor_id;
        this.to_actor_id = to_actor_id;
    }
}

abstract class ActorEvent {
    readonly actor_id: string;
    constructor(actor_id: string) {
        this.actor_id = actor_id;
    }
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

export class SpawnMonster extends ActorEvent {
    readonly kind = "spawn-monster";
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number, id: string) {
        super(id);
        this.x = x;
        this.y = y;
    }
}

export class SpawnPc extends ActorEvent {
    readonly kind = "spawn-pc";
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number, id: string) {
        super(id);
        this.x = x;
        this.y = y;
    }
}

export class ConsciousDecision extends ActorEvent {
    readonly kind = "conscious-decision";
}

export class NpcDecision extends ActorEvent {
    readonly kind = "npc-decision";
}

export class Death extends ActorEvent {
    readonly kind = "death";
}

export class Damage extends ActorEvent {
    readonly kind = "damage";
    readonly damage: number;
    constructor(actor_id: string, damage: number) {
        super(actor_id);
        this.damage = damage;
    }
}

export class InitiateCombat extends OneWayInteraction {
    readonly kind = "initiate-combat";
}

export class Melee extends OneWayInteraction {
    readonly kind = "melee";
    readonly damage: number;
    constructor(from_actor_id: string, to_actor_id: string, damage: number) {
        super(from_actor_id, to_actor_id);
        this.damage = damage;
    }
}

export class Negate {
    readonly kind = "negate";
    readonly event_to_negate: StateChangeEvent;
    constructor(event_to_negate: StateChangeEvent) {
        this.event_to_negate = event_to_negate;
    }
}

export class RequestMove extends ActorEvent {
    readonly kind = "request-move";
    readonly direction: Direction;
    constructor(actor_id: string, direction: Direction) {
        super(actor_id);
        this.direction = direction;
    }
}

export class StartMove extends ActorEvent {
    readonly kind = "start-move";
    readonly direction: Direction;
    constructor(actor_id: string, direction: Direction) {
        super(actor_id);
        this.direction = direction;
    }
}

export class FinishMove extends ActorEvent {
    readonly kind = "finish-move";
    readonly direction: Direction;
    constructor(actor_id: string, direction: Direction) {
        super(actor_id);
        this.direction = direction;
    }
}

