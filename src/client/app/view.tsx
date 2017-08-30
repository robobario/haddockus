import { Grid, Cell } from "./grid"
import { Character, Species } from "./character"
import { Sprites } from "./sprites"
import { any_match, iteritems } from "./lang"
import { Actor } from "./actor";
import { Snapshot } from "./snapshot";

export class View {
    private sprites: Sprites = new Sprites();
    private alternatives: any = require('./sprite-alternatives.json');
    private canvas: any = document.getElementById("canvas");
    private context = this.canvas.getContext("2d");
    private sprite = new Image();

    load_sprite(callback: () => void) {
        this.sprite.src = String(require('./sprites.png'));
        if (this.sprite.complete) {
            callback();
        } else {
            this.sprite.onload = callback;
        }
    }

    render(snapshot: Snapshot) {
        if (snapshot.is_alive) {
            this.renderMap(snapshot);
        } else {
            this.renderDeath(snapshot);
        }
    }

    private renderDeath(snapshot: Snapshot) {
        snapshot.grid.foreach((x, y, cell) => {
            this.draw_random_sprite(x, y);
            this.draw_random_sprite(x, y);
            this.draw_random_sprite(x, y);
            this.draw_random_sprite(x, y);
        });
        let mid_y = Math.floor(snapshot.grid.height / 2);
        let mid_x = Math.floor(snapshot.grid.width / 2);
        let offset_y = 128 / 2;
        this.context.fillStyle = '#000000';
        let padding_y = 32;
        this.context.fillRect(0, mid_y * 64 - offset_y - padding_y, 64 * snapshot.grid.width, 128 + 2 * padding_y);
        this.context.textAlign = "center";
        this.context.font = "128px Source Code Pro";
        this.context.fillStyle = '#ffffff';
        this.context.fillText("game over", mid_x * 64, mid_y * 64 + 32);
    }

    private renderMap(snapshot: Snapshot) {
        snapshot.grid.foreach((x, y, cell) => {
            if (cell.is_floor) {
                this.draw_sprite(x, y, this.get_floor_sprite('floor', cell));
            }

            any_match(cell.actors, (actor: Actor) => {
                switch (actor.kind) {
                    case "character":
                        return !actor.is_alive();
                    default:
                        return false;
                }
            }, () => this.draw_sprite(x, y, "corpse"));

            iteritems(cell.actors, (key: string, actor: Actor) => {
                switch (actor.kind) {
                    case "character":
                        this.render_character(x, y, actor);
                        break;
                    case "wall":
                        this.render_wall(x, y, actor);
                        break;
                }
            });
        })
    }

    render_character(x: number, y: number, actor: Character) {
        if (actor.is_alive()) {
            let spriteName: string;
            switch (actor.species) {
                case Species.Human: spriteName = this.get_sprite_name('human', actor); break;
                case Species.Goblin: spriteName = this.get_sprite_name('goblin', actor); break;
                default: throw new Error("unrecognized species!");
            }
            this.draw_sprite(x, y, spriteName)
        }
    }

    render_wall(x: number, y: number, actor: Actor) {
        this.draw_sprite(x, y, this.get_sprite_name('wall', actor))
    }

    draw_sprite(x: number, y: number, sprite: string) {
        const info = this.sprites.get_sprite_named(sprite);
        this.context.drawImage(this.sprite, info.top_left_x, info.top_left_y, info.width, info.height, x * 64, y * 64, 64, 64);
    }

    draw_random_sprite(x: number, y: number) {
        const info = this.sprites.get_random_sprite();
        this.context.drawImage(this.sprite, info.top_left_x, info.top_left_y, info.width, info.height, x * 64, y * 64, 64, 64);
    }

    get_sprite_name(alias: string, actor: Actor): string {
        let alts = this.alternatives[alias];
        return alts[actor.random_num % alts.length]
    }

    get_floor_sprite(alias: string, cell: Cell): string {
        let alts = this.alternatives[alias];
        return alts[cell.random_num % alts.length]
    }

}
