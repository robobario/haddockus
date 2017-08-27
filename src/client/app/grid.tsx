import { Actor } from './actor';
import { Direction } from './event';

export class Coordinates {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Cell {
    is_floor: boolean = false;
    readonly random_num: number = Math.floor(Math.random() * 100) + 1;
    readonly coordinate: Coordinates;
    readonly actors: { [key: string]: Actor } = {};
    constructor(x: number, y: number) {
        this.coordinate = new Coordinates(x, y);
    }
    set_floor(is_floor: boolean) {
        this.is_floor = is_floor;
    }
    add_actor(actor: Actor) {
        this.actors[actor.actor_id] = actor;
    }
    remove(actor_id: string): Actor {
        let actor = this.actors[actor_id];
        delete this.actors[actor_id];
        return actor;
    }
}

export class Grid {
    private grid: Cell[];
    readonly width: number;
    readonly height: number;
    private actors: { [key: string]: Cell } = {};
    constructor(width: number, height: number) {
        this.grid = [];
        this.width = width;
        this.height = height;
        for (let _i = 0; _i < width; _i++) {
            for (let _j = 0; _j < height; _j++) {
                this.grid[_i + width * _j] = new Cell(_i, _j);
            }
        }
    }
    get(x: number, y: number): Cell {
        return this.grid[x + y * this.width];
    }
    locate(actor_id: string): Cell {
        return this.actors[actor_id];
    }
    add_actor(x: number, y: number, actor: Actor) {
        let cell = this.get(x, y);
        cell.add_actor(actor);
        this.actors[actor.actor_id] = cell;
    }
    move(actor_id: string, direction: Direction) {
        let cell = this.actors[actor_id];
        let x = cell.coordinate.x;
        let y = cell.coordinate.y;
        switch (direction) {
            case (Direction.Up): y -= 1; break;
            case (Direction.Down): y += 1; break;
            case (Direction.Left): x -= 1; break;
            case (Direction.Right): x += 1; break;
        }
        let actor = cell.remove(actor_id);
        this.add_actor(x, y, actor);
    }

    foreach(f: (x: number, y: number, cell: Cell) => any) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                f(x, y, this.get(x, y));
            }
        }
    }
}
