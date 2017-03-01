import { Grid, Cell } from "./grid.tsx"
import { Actor } from "./actor.tsx"
import { Sprites } from "./sprites.tsx"
import { iteritems } from "./lang.tsx"

export class View {
    private sprites: Sprites = new Sprites();
    private alternatives = require('./sprite-alternatives.json');
    private canvas: any = document.getElementById("canvas");
    private context = this.canvas.getContext("2d");
    private sprite = new Image();

    load_sprite(callback) {
        this.sprite.src = String(require('./sprites.png'));
        if (this.sprite.complete) {
            callback();
        } else {
            this.sprite.onload = callback;
        }
    }

    render(grid: Grid) {
        let view = this;
        grid.foreach(function(x, y, cell) {
            if (cell.is_floor) {
                view.draw_sprite(x, y, view.get_floor_sprite('floor', cell));
            }
            iteritems(cell.actors, function(key, actor) {
                switch (actor.kind) {
                    case "character": view.render_human(x, y, actor); break;
                    case "wall": view.render_wall(x, y, actor); break;
                }
            });
        })
    }

    render_human(x: number, y: number, actor: Actor) {
        this.draw_sprite(x, y, this.get_sprite_name('human', actor))
    }

    render_wall(x: number, y: number, actor: Actor) {
        this.draw_sprite(x, y, this.get_sprite_name('wall', actor))
    }

    draw_sprite(x: number, y: number, sprite: string) {
        var info = this.sprites.get_sprite_named(sprite)
        this.context.drawImage(this.sprite, info.top_left_x, info.top_left_y, info.width, info.height, x * 64, y * 64, 64, 64)
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
