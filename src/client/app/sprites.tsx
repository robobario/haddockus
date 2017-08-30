const sprite_data: any = require('./sprites.json');

export class Sprite {
    readonly top_left_x: number;
    readonly top_left_y: number;
    readonly width: number;
    readonly height: number;

    constructor(top_left_x: number, top_left_y: number, width: number, height: number) {
        this.top_left_x = top_left_x;
        this.top_left_y = top_left_y;
        this.width = width;
        this.height = height;
    }
}

export class Sprites {
    private sprites: { [s: string]: Sprite; } = {};
    private keys: string[];
    private length: number;

    constructor() {
        for (let frame of sprite_data['frames']) {
            const f = frame.frame;
            this.sprites[frame.filename] = new Sprite(-f.x, -f.y, f.w, f.h)
        }
        this.keys = Object.keys(this.sprites);
        this.length = this.keys.length;
    }

    public get_sprite_named(name: String): Sprite {
        return this.sprites[name + '.png']
    }

    public get_random_sprite(): Sprite {
        return this.sprites[this.keys[Math.floor(Math.random() * this.length)]]
    }
}

