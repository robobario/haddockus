import { Engine } from "./engine";
import {
    PlaceFloor, SpawnPc, Direction, PlaceWall, SpawnMonster, PlaceSword,
    PickupAll, EnterLevel, StartMove, StartWait
} from "./event"
import { View } from "./view"
import { Coordinates } from "./grid";

const view = new View();

export enum Mode {
    GAME,
    CONSOLE
}

let game_input = function(e: KeyboardEvent, engine: Engine, current_tick: number, player_id: string, view: View) {
    switch (e.keyCode) {
        case 38:
            engine.act(new StartMove(current_tick, player_id, Direction.Up));
            break;
        case 40:
            engine.act(new StartMove(current_tick, player_id, Direction.Down));
            break;
        case 37:
            engine.act(new StartMove(current_tick, player_id, Direction.Left));
            break;
        case 39:
            engine.act(new StartMove(current_tick, player_id, Direction.Right));
            break;
        case 190:
            engine.act(new StartWait(current_tick, player_id));
            break;
        case 188:
            engine.act(new PickupAll(current_tick, player_id));
            break;
        default:
            return;
    }
    engine.run();
    let snapshot = engine.snapshot();
    view.render(snapshot);
};

let run_game = function() {
    const engine = new Engine();
    let current_tick = engine.current_tick();
    let player_id = engine.get_player_character_id();
    engine.act(new EnterLevel(current_tick, player_id));
    engine.run();
    let mode = Mode.GAME;
    let snapshot = engine.snapshot();
    view.render(snapshot);
    console.log("make a decision now!");
    document.addEventListener("keydown", function(e) {
        let current_tick = engine.current_tick();
        if (e.keyCode === 192 || (e.ctrlKey && e.keyCode === 90)) {
            console.log("toggle!");
            if (mode == Mode.CONSOLE) { mode = Mode.GAME } else { mode = Mode.CONSOLE }
            view.toggle_console();
        } else {
            switch (mode) {
                case Mode.GAME: game_input(e, engine, current_tick, player_id, view); break;
                case Mode.CONSOLE: view.console_input(e); break;
            }
        }
    })
};

document.addEventListener("DOMContentLoaded", function(event) {
    view.load_sprite(function() {
        let document2: any = document;
        document2.fonts.load('128pt "Source Code Pro"').then(run_game);
    })
});
