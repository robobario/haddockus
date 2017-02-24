import { Engine } from "./engine.tsx";
import { PlaceFloor, SpawnPc, RequestMove, Direction, PlaceWall } from "./event.tsx"
import { View } from "./view.tsx"

var view = new View();
document.addEventListener("DOMContentLoaded", function(event) {
    view.load_sprite(function() {
        var engine = new Engine();
        var snap = engine.snapshot();
        for (var _x = 0; _x < snap.get_width(); _x++) {
            for (var _y = 0; _y < snap.get_height(); _y++) {
                engine.act(new PlaceFloor(_x, _y));
            }
        }
        for (var _x = 0; _x < snap.get_width(); _x++) {
            engine.act(new PlaceWall(_x, 0));
            engine.act(new PlaceWall(_x, snap.get_height() - 1));
        }
        for (var _y = 1; _y < snap.get_height() - 1; _y++) {
            engine.act(new PlaceWall(0, _y));
            engine.act(new PlaceWall(snap.get_width() - 1, _y));
        }
        var player_id = engine.get_unique_actor_id();
        engine.act(new SpawnPc(5, 5, player_id));
        engine.process_events();
        snap = engine.snapshot();
        view.render(snap);
        console.log("make a decision now!")
        document.addEventListener("keydown", function(e) {
            switch (e.keyCode) {
                case 38: engine.act(new RequestMove(player_id, Direction.Up)); break;
                case 40: engine.act(new RequestMove(player_id, Direction.Down)); break;
                case 37: engine.act(new RequestMove(player_id, Direction.Left)); break;
                case 39: engine.act(new RequestMove(player_id, Direction.Right)); break;
                default: return;
            }
            engine.run();
            snap = engine.snapshot();
            view.render(snap);
        })
    })
});
