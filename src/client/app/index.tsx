import { Engine } from "./engine";
import { PlaceFloor, SpawnPc, RequestMove, Direction, PlaceWall, SpawnMonster, RequestWait } from "./event"
import { View } from "./view"

const view = new View();
document.addEventListener("DOMContentLoaded", function(event) {
    view.load_sprite(function() {
        const engine = new Engine();
        let snap = engine.snapshot();
        for (let _x = 0; _x < snap.width; _x++) {
            for (let _y = 0; _y < snap.height; _y++) {
                engine.act(new PlaceFloor(_x, _y));
            }
        }
        for (let _x = 0; _x < snap.width; _x++) {
            engine.act(new PlaceWall(_x, 0));
            engine.act(new PlaceWall(_x, snap.height - 1));
        }
        for (let _y = 1; _y < snap.height - 1; _y++) {
            engine.act(new PlaceWall(0, _y));
            engine.act(new PlaceWall(snap.width - 1, _y));
        }
        let player_id = engine.get_unique_actor_id();
        engine.act(new SpawnPc(5, 5, player_id));
        engine.act(new SpawnMonster(8, 3, engine.get_unique_actor_id()));
        engine.process_events();
        snap = engine.snapshot();
        view.render(snap);
        console.log("make a decision now!");
        document.addEventListener("keydown", function(e) {
            switch (e.keyCode) {
                case 38: engine.act(new RequestMove(player_id, Direction.Up)); break;
                case 40: engine.act(new RequestMove(player_id, Direction.Down)); break;
                case 37: engine.act(new RequestMove(player_id, Direction.Left)); break;
                case 39: engine.act(new RequestMove(player_id, Direction.Right)); break;
                case 190: engine.act(new RequestWait(player_id)); break;
                default: return;
            }
            engine.run();
            snap = engine.snapshot();
            view.render(snap);
        })
    })
});
