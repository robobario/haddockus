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

export type InputEvent = PlaceWall | PlaceFloor | SpawnPc | SpawnMonster | RequestMove | RequestWait

export type StateChangeEvent = PlaceWall | PlaceFloor | SpawnPc | SpawnMonster | ConsciousDecision | NpcDecision | StartMove | FinishMove | Negate | InitiateCombat | Melee | Damage | Death | StartWait | FinishWait

export abstract class TickEvent {
    readonly tick: number;
    constructor(tick: number) {
        this.tick = tick;
    }
}

export abstract class OneWayInteraction extends TickEvent {
    readonly from_actor_id: string;
    readonly to_actor_id: string;
    constructor(tick: number, from_actor_id: string, to_actor_id: string) {
        super(tick);
        this.from_actor_id = from_actor_id;
        this.to_actor_id = to_actor_id;
    }
}

export abstract class ActorEvent extends TickEvent {
    readonly actor_id: string;
    constructor(tick: number, actor_id: string) {
        super(tick);
        this.actor_id = actor_id;
    }
}

export class LocationEvent extends TickEvent {
    readonly x: number;
    readonly y: number;
    constructor(tick: number, x: number, y: number) {
        super(tick);
        this.x = x;
        this.y = y;
    }
}


export class PlaceWall extends LocationEvent {
    readonly kind = "place-wall";
}

export class PlaceFloor extends LocationEvent {
    readonly kind = "place-floor";
}

export class SpawnMonster extends ActorEvent {
    readonly kind = "spawn-monster";
    readonly x: number;
    readonly y: number;
    constructor(tick: number, x: number, y: number, id: string) {
        super(tick, id);
        this.x = x;
        this.y = y;
    }
}

export class SpawnPc extends ActorEvent {
    readonly kind = "spawn-pc";
    readonly x: number;
    readonly y: number;
    constructor(tick: number, x: number, y: number, id: string) {
        super(tick, id);
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
    constructor(tick: number, actor_id: string, damage: number) {
        super(tick, actor_id);
        this.damage = damage;
    }
}

export class InitiateCombat extends OneWayInteraction {
    readonly kind = "initiate-combat";
}

export class Melee extends OneWayInteraction {
    readonly kind = "melee";
    readonly damage: number;
    constructor(tick: number, from_actor_id: string, to_actor_id: string, damage: number) {
        super(tick, from_actor_id, to_actor_id);
        this.damage = damage;
    }
}

export class Negate extends TickEvent {
    readonly kind = "negate";
    readonly event_to_negate: StateChangeEvent;
    constructor(event_to_negate: StateChangeEvent) {
        super(event_to_negate.tick);
        this.event_to_negate = event_to_negate;
    }
}

export class RequestWait extends ActorEvent {
    readonly kind = "request-wait";
}

export class RequestMove extends ActorEvent {
    readonly kind = "request-move";
    readonly direction: Direction;
    constructor(tick: number, actor_id: string, direction: Direction) {
        super(tick, actor_id);
        this.direction = direction;
    }
}

export class StartWait extends ActorEvent {
    readonly kind = "start-wait";
}

export class FinishWait extends ActorEvent {
    readonly kind = "finish-wait";
}

export class StartMove extends ActorEvent {
    readonly kind = "start-move";
    readonly direction: Direction;
    constructor(tick: number, actor_id: string, direction: Direction) {
        super(tick, actor_id);
        this.direction = direction;
    }
}

export class FinishMove extends ActorEvent {
    readonly kind = "finish-move";
    readonly direction: Direction;
    constructor(tick: number, actor_id: string, direction: Direction) {
        super(tick, actor_id);
        this.direction = direction;
    }
}

