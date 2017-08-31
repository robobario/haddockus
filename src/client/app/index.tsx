import { Engine } from "./engine";
import {
    PlaceFloor, SpawnPc, RequestMove, Direction, PlaceWall, SpawnMonster, RequestWait, PlaceSword,
    PickupAll
} from "./event"
import { View } from "./view"
import { Coordinates } from "./grid";

const view = new View();

let run_game = function() {
    const engine = new Engine();
    let snap = engine.snapshot().grid;
    let current_tick = engine.current_tick();
    for (let _x = 0; _x < snap.width; _x++) {
        for (let _y = 0; _y < snap.height; _y++) {
            engine.act(new PlaceFloor(current_tick, new Coordinates(_x, _y)));
        }
    }
    for (let _x = 0; _x < snap.width; _x++) {
        engine.act(new PlaceWall(current_tick, new Coordinates(_x, 0)));
        engine.act(new PlaceWall(current_tick, new Coordinates(_x, snap.height - 1)));
    }
    for (let _y = 1; _y < snap.height - 1; _y++) {
        engine.act(new PlaceWall(current_tick, new Coordinates(0, _y)));
        engine.act(new PlaceWall(current_tick, new Coordinates(snap.width - 1, _y)));
    }
    let player_id = engine.get_player_character_id();
    engine.act(new SpawnPc(current_tick, player_id, new Coordinates(5, 5)));
    engine.act(new SpawnMonster(current_tick, engine.get_unique_actor_id(), new Coordinates(8, 3)));
    engine.act(new PlaceSword(current_tick, engine.get_unique_actor_id(), new Coordinates(12, 8)));
    engine.process_events();
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
