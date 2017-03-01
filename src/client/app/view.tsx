import { Grid, Cell } from "./grid.tsx"
import { Actor } from "./actor.tsx"
import { Sprites } from "./sprites.tsx"

export class View {
    sprites: Sprites = new Sprites();
    alternatives = require('./sprite-alternatives.json');
    canvas: any = document.getElementById("canvas");
    context = this.canvas.getContext("2d");
    sprite = new Image();

    load_sprite(callback) {
        this.sprite.src = String(require('./sprites.png'));
        if (this.sprite.complete) {
            callback();
        } else {
            this.sprite.onload = callback;
        }
    }

    render(grid: Grid) {
        for (var _x = 0; _x < grid.get_width(); _x++) {
            for (var _y = 0; _y < grid.get_height(); _y++) {
                var cell = grid.get(_x, _y);
                if (cell.is_floor) {
                    this.drawSprite(_x,_y, this.get_floor_sprite('floor', cell));
                }
                var actors = cell.actors;
                var actorIds = Object.keys(actors);
                for (let id of actorIds) {
                    var actor = actors[id];
                    switch (actor.kind) {
                        case "character": this.renderHuman(_x, _y, actor); break;
                        case "wall": this.renderWall(_x, _y, actor); break;
                    }
                }
            }
        }
    }

    renderHuman(x: number, y: number, actor: Actor) {
        this.drawSprite(x, y, this.get_sprite_name('human', actor))
    }

    renderWall(x: number, y: number, actor: Actor) {
        this.drawSprite(x, y, this.get_sprite_name('wall', actor))
    }

    drawSprite(x: number, y: number, sprite: string) {
        var info = this.sprites.get_sprite_named(sprite)
        this.context.drawImage(this.sprite, info.top_left_x, info.top_left_y, info.width, info.height, x * 64, y * 64, 64, 64)
    }

    get_sprite_name(alias:string, actor:Actor): string {
        let alts = this.alternatives[alias];
        return alts[actor.random_num % alts.length]
    }

    get_floor_sprite(alias:string, cell:Cell): string {
        let alts = this.alternatives[alias];
        return alts[cell.random_num % alts.length]
    }

}
