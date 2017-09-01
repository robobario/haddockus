import { Engine } from "./engine";
import {
    PlaceFloor, SpawnPc, RequestMove, Direction, PlaceWall, SpawnMonster, RequestWait, PlaceSword,
    PickupAll, EnterLevel
} from "./event"
import { View } from "./view"
import { Coordinates } from "./grid";

const view = new View();

let run_game = function() {
    const engine = new Engine();
    let current_tick = engine.current_tick();
    let player_id = engine.get_player_character_id();
    engine.act(new EnterLevel(current_tick, player_id));
    engine.run();
    let snapshot = engine.snapshot();
    view.render(snapshot);
    console.log("make a decision now!");
    document.addEventListener("keydown", function(e) {
        let current_tick = engine.current_tick();
        switch (e.keyCode) {
            case 38:
                engine.act(new RequestMove(current_tick, player_id, Direction.Up));
                break;
            case 40:
                engine.act(new RequestMove(current_tick, player_id, Direction.Down));
                break;
            case 37:
                engine.act(new RequestMove(current_tick, player_id, Direction.Left));
                break;
            case 39:
                engine.act(new RequestMove(current_tick, player_id, Direction.Right));
                break;
            case 190:
                engine.act(new RequestWait(current_tick, player_id));
                break;
            case 188:
                engine.act(new PickupAll(current_tick, player_id));
                break;
            default:
                return;
        }
        engine.run();
        snapshot = engine.snapshot();
        view.render(snapshot);
    })
};

document.addEventListener("DOMContentLoaded", function(event) {
    view.load_sprite(function() {
        let document2: any = document;
        document2.fonts.load('128pt "Source Code Pro"').then(run_game);
    })
});
