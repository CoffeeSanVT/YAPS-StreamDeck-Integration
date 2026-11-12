import streamDeck, {
    action,
    SingletonAction,
    type DidReceiveSettingsEvent,
    type KeyDownEvent,
    type SendToPluginEvent,
} from "@elgato/streamdeck";
import type { JsonValue } from "@elgato/utils";

import { sendMessage, sendRequest } from "../yapsClient";
import type { GetItems } from "../yaps-types";
import { createOptions, type PropertyInspectorOption } from "./property-inspector-options";

type ToggleAssetSettings = {
    selectedAsset?: string;
};

@action({ UUID: "com.coffeesanvt.yaps-streamdeck-integration.toggle-asset" })
export class ToggleAsset extends SingletonAction<ToggleAssetSettings> {
    override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, ToggleAssetSettings>): Promise<void> {
        const event = "getAssets";
        const { payload } = ev;

        if (payload instanceof Object && "event" in payload && payload.event === event) {
            streamDeck.ui.sendToPropertyInspector({
                event,
                items: await this.#getAssets(),
            });
        }
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ToggleAssetSettings>): Promise<void> {
        if (ev.action.isKey() || ev.action.isDial()) {
            await ev.action.setTitle(ev.payload.settings.selectedAsset ?? "");
        }
    }

    override async onKeyDown(ev: KeyDownEvent<ToggleAssetSettings>): Promise<void> {
        const asset = ev.payload.settings.selectedAsset;
        if (!asset) return;

        sendMessage(`set_item:${asset}:${!ev.payload.state}`);
    }

    async #getAssets(): Promise<PropertyInspectorOption[]> {
        const response = await sendRequest<GetItems>("get_items");
        if (response.status === "error") return createOptions([]);

        const options = createOptions(response.items.map((asset) => asset.name));
        streamDeck.logger.debug(options);
        return options;
    }
}
