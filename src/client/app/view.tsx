import { Grid, Cell } from "./grid"
import { Character, HealthIndicator, Species } from "./character"
import { Sprites } from "./sprites"
import { any_match, iteritems } from "./lang"
import { Actor } from "./actor";
import { Snapshot } from "./snapshot";

export class View {
    private sprites: Sprites = new Sprites();
    private alternatives: any = require('./sprite-alternatives.json');
    private canvas: any = document.getElementById("canvas");
    private overlay: any = document.getElementById("overlay");
    private overlay_context: CanvasRenderingContext2D = this.overlay.getContext("2d");
    private overlay_visible: boolean = false;
    private internal_canvas: HTMLCanvasElement = document.createElement("canvas");
    private internal_context: CanvasRenderingContext2D = View.create_internal(this.internal_canvas);
    private overlay_buffer: string = " > ";
    private commands: string[] = ["wield"];

    private static create_internal(element: HTMLCanvasElement): CanvasRenderingContext2D {
        element.width = 1024;
        element.height = 1024;
        let context = element.getContext("2d");
        if (context == null) {
            throw Error("could not get a 2d context!");
        }
        return context;
    }

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
        this.context.drawImage(this.internal_canvas, 0, 0);
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
        this.internal_context.fillStyle = '#000000';
        let padding_y = 32;
        this.internal_context.fillRect(0, mid_y * 64 - offset_y - padding_y, 64 * snapshot.grid.width, 128 + 2 * padding_y);
        this.internal_context.textAlign = "center";
        this.internal_context.font = "128px Source Code Pro";
        this.internal_context.fillStyle = '#ffffff';
        this.internal_context.fillText("game over", mid_x * 64, mid_y * 64 + 32);
    }

    private renderMap(snapshot: Snapshot) {
        snapshot.grid.foreach((x, y, cell) => {
            this.renderFloor(cell, x, y);
            this.renderCorpse(cell, x, y);
            this.renderItems(cell, x, y);
            this.renderCharacter(cell, x, y);
            this.renderWall(cell, x, y);
        })
    }

    private renderCorpse(cell: Cell, x: number, y: number) {
        let is_corpse = any_match(cell.actors, (actor: Actor) => {
            switch (actor.kind) {
                case "character":
                    return !actor.is_alive();
                default:
                    return false;
            }
        });
        if (is_corpse) {
            this.draw_sprite(x, y, "corpse");
        }
    }

    private renderFloor(cell: Cell, x: number, y: number) {
        if (cell.is_floor) {
            this.draw_sprite(x, y, this.get_floor_sprite('floor', cell));
        }
    }

    render_character(x: number, y: number, actor: Character) {
        if (actor.is_alive()) {
            let spriteName: string;
            switch (actor.species) {
                case Species.Human: spriteName = this.get_sprite_name('human', actor); break;
                case Species.Goblin: spriteName = this.get_sprite_name('goblin', actor); break;
                default: throw new Error("unrecognized species!");
            }
            this.draw_sprite(x, y, spriteName);
            this.renderHealthOverlay(actor, x, y);
        }
    }

    private renderHealthOverlay(actor: Character, x: number, y: number) {
        switch (actor.get_health_indicator()) {
            case HealthIndicator.NEAR_DEATH: this.draw_sprite(x, y, "mdam_almost_dead"); break;
            case HealthIndicator.SEVERELY_WOUNDED: this.draw_sprite(x, y, "mdam_severely_damaged"); break;
            case HealthIndicator.HEAVILY_WOUNDED: this.draw_sprite(x, y, "mdam_heavily_damaged"); break;
            case HealthIndicator.MODERATELY_WOUNDED: this.draw_sprite(x, y, "mdam_moderately_damaged"); break;
            case HealthIndicator.LIGHTLY_WOUNDED: this.draw_sprite(x, y, "mdam_lightly_damaged"); break;
        }
    }

    render_wall(x: number, y: number, actor: Actor) {
        this.draw_sprite(x, y, this.get_sprite_name('wall', actor))
    }

    draw_sprite(x: number, y: number, sprite: string) {
        const info = this.sprites.get_sprite_named(sprite);
        this.internal_context.drawImage(this.sprite, info.top_left_x, info.top_left_y, info.width, info.height, x * 64, y * 64, 64, 64);
    }

    draw_random_sprite(x: number, y: number) {
        const info = this.sprites.get_random_sprite();
        this.internal_context.drawImage(this.sprite, info.top_left_x, info.top_left_y, info.width, info.height, x * 64, y * 64, 64, 64);
    }

    get_sprite_name(alias: string, actor: Actor): string {
        let alts = this.alternatives[alias];
        return alts[actor.random_num % alts.length]
    }

    get_floor_sprite(alias: string, cell: Cell): string {
        let alts = this.alternatives[alias];
        return alts[cell.random_num % alts.length]
    }

    private renderItems(cell: Cell, x: number, y: number) {
        iteritems(cell.actors, (key: string, actor: Actor) => {
            switch (actor.kind) {
                case "sword":
                    this.draw_sprite(x, y, actor.sprite);
                    break;
            }
        });
    }

    private renderCharacter(cell: Cell, x: number, y: number) {
        iteritems(cell.actors, (key: string, actor: Actor) => {
            switch (actor.kind) {
                case "character":
                    this.render_character(x, y, actor);
                    break;
            }
        });

    }
    private renderWall(cell: Cell, x: number, y: number) {
        iteritems(cell.actors, (key: string, actor: Actor) => {
            switch (actor.kind) {
                case "wall":
                    this.render_wall(x, y, actor);
                    break;
            }
        });

    }

    toggle_console() {
        this.overlay_visible = !this.overlay_visible;
        if (this.overlay_visible) {
            this.redraw_console();
        } else {
            this.clear_overlay();
        }
    }

    private clear_overlay() {
        this.overlay_context.clearRect(0, 0, this.overlay.width, this.overlay.height);
    }

    private draw_overlay() {
        this.overlay_context.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.overlay_context.fillRect(0, 0, this.overlay.width, this.overlay.height);
    }

    console_input(keydown: KeyboardEvent) {
        if (keydown.keyCode >= 48 && keydown.keyCode <= 90) {
            if (this.overlay_buffer.length < 16) {
                this.overlay_buffer = this.overlay_buffer + keydown.key;
                this.redraw_buffer();
            }
        } else if (keydown.keyCode == 13) {
            this.overlay_buffer = " > ";
            this.redraw_console();
        } else if (keydown.keyCode == 8) {
            this.overlay_buffer = this.overlay_buffer.substr(0, this.overlay_buffer.length - 1)
            this.redraw_console();
        } else if (keydown.keyCode == 9) {
            keydown.preventDefault();
            let current = this.overlay_buffer.substr(3).toLowerCase();
            for (let c in this.commands) {
                if (this.commands[c].indexOf(current) === 0) {
                    this.overlay_buffer = " > " + this.commands[c];
                    break;
                }
            }
            this.redraw_console();
        }
    }

    private redraw_console() {
        this.clear_overlay();
        this.draw_overlay();
        this.redraw_buffer();
    }

    private redraw_buffer() {
        this.overlay_context.font = "64px Source Code Pro";
        this.overlay_context.textBaseline = "hanging";
        this.overlay_context.fillStyle = "#ffffff";
        this.overlay_context.fillText(this.overlay_buffer, 0, 64 * 15, this.overlay.width)
    }
}
