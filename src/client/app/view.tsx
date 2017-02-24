import { Grid } from "./grid.tsx"
import { Sprites } from "./sprites.tsx"

export class View {
    sprites: Sprites = new Sprites();
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
                    var info = this.sprites.get_sprite_named('floor_sand_stone2')
                    this.context.drawImage(this.sprite, info.top_left_x, info.top_left_y, info.width, info.height, _x * 64, _y * 64, 64, 64);
                }
                var actors = cell.actors;
                var actorIds = Object.keys(actors);
                for (let id of actorIds) {
                    var actor = actors[id];
                    switch (actor.kind) {
                        case "character": this.renderHuman(_x, _y); break;
                        case "wall": this.renderWall(_x, _y); break;
                    }
                }
            }
        }
    }

    renderHuman(x: number, y: number) {
        var info = this.sprites.get_sprite_named('human_m')
        this.context.drawImage(this.sprite, info.top_left_x, info.top_left_y, info.width, info.height, x * 64, y * 64, 64, 64);
    }

    renderWall(x: number, y: number) {
        var info = this.sprites.get_sprite_named('brick_dark0')
        this.context.drawImage(this.sprite, info.top_left_x, info.top_left_y, info.width, info.height, x * 64, y * 64, 64, 64);
    }

}
