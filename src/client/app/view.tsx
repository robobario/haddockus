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
                    this.drawSprite(_x,_y, 'floor_sand_stone2');
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
        this.drawSprite(x, y, 'human_m')
    }

    renderWall(x: number, y: number) {
        this.drawSprite(x, y, 'brick_dark0')
    }

    drawSprite(x: number, y: number, sprite: string) {
        var info = this.sprites.get_sprite_named(sprite)
        this.context.drawImage(this.sprite, info.top_left_x, info.top_left_y, info.width, info.height, x * 64, y * 64, 64, 64)
    }

}
