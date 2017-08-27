import { BaseActor } from "./actor";
import { FinishMove, Negate, StateChangeEvent } from "./event";
import { extend } from "./lang";

const EMPTY: StateChangeEvent[] = [];
export class Wall extends BaseActor {
    readonly kind = "wall";

    react(event: StateChangeEvent, tick: number): StateChangeEvent[] {
        const reactions: StateChangeEvent[] = [];
        switch (event.kind) {
            case "finish-move": extend(reactions, negate_movement(event, this)); break;
        }
        return reactions;
    }

}

function negate_movement(event: FinishMove, actor: BaseActor) {
    if (actor.actor_id === event.actor_id) {
        return EMPTY;
    }
    if (actor.grid.locate(actor.actor_id) === actor.grid.locate(event.actor_id)) {
        return [new Negate(event)];
    } else {
        return EMPTY;
    }
}
