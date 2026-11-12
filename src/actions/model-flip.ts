import { action, SingletonAction, type KeyDownEvent, type WillAppearEvent } from "@elgato/streamdeck";
import type { JsonObject } from "@elgato/utils";

import { sendMessage } from "../yapsClient";

@action({ UUID: "com.coffeesanvt.yaps-streamdeck-integration.model-flip" })
export class ModelFlip extends SingletonAction {
    override async onWillAppear(ev: WillAppearEvent<JsonObject>): Promise<void> {
        if (ev.action.isKey() || ev.action.isDial()) {
            await ev.action.setTitle("Model Flip");
        }
    }

    override onKeyDown(ev: KeyDownEvent<JsonObject>): void {
        sendMessage(`set_flip:${!ev.payload.state}`);
    }
}
