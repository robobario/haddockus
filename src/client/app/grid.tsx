import { Actor } from './actor.tsx';
import { Direction } from './event.tsx';

export class Cell {
    is_wall: boolean = false;
    is_floor: boolean = false;
    readonly x: number;
    readonly y: number;
    actors: { [key: number]: Actor } = {};
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    set_floor(is_floor: boolean) {
        this.is_floor = is_floor;
    }
    set_wall(is_wall: boolean) {
        this.is_wall = is_wall;
    }
    add_actor(actor: Actor) {
        this.actors[actor.actor_id] = actor;
    }
    is_occupied(): boolean {
        return Object.keys(this.actors).length > 0;
    }
    remove(actor: Actor) {
        delete this.actors[actor.actor_id];
    }
}

export class Grid {
    private grid: Cell[];
    private width: number;
    private height: number;
    private actors: { [key: number]: Cell } = {};
    constructor(width: number, height: number) {
        this.grid = [];
        this.width = width;
        this.height = height;
        for (var _i = 0; _i < width; _i++) {
            for (var _j = 0; _j < height; _j++) {
                this.grid[_i + width * _j] = new Cell(_i, _j);
            }
        }
    }
    get(x: number, y: number): Cell {
        return this.grid[x + y * this.width];
    }
    locate(actor_id:number) : Cell {
        return this.actors[actor_id];
    }
    get_width(): number {
        return this.width;
    }
    get_height(): number {
        return this.height;
    }
    add_actor(x: number, y: number, actor: Actor) {
        var cell = this.get(x, y);
        cell.add_actor(actor);
        this.actors[actor.actor_id] = cell;
    }
    move(actor: Actor, direction: Direction) {
        var cell = this.actors[actor.actor_id];
        var x = cell.x;
        var y = cell.y;
        switch (direction) {
            case (Direction.Up): y -= 1; break;
            case (Direction.Down): y += 1; break;
            case (Direction.Left): x -= 1; break;
            case (Direction.Right): x += 1; break;
        }
        cell.remove(actor);
        this.add_actor(x, y, actor);
    }
}
