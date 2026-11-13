import streamDeck, {
    action,
    SingletonAction,
    type DidReceiveSettingsEvent,
    type KeyDownEvent,
    type SendToPluginEvent,
} from "@elgato/streamdeck";
import type { JsonValue } from "@elgato/utils";

import { sendRequest } from "../yapsClient";
import type { ApplyPreset, GetPresets } from "../yaps-types";
import { createOptions, type PropertyInspectorOption } from "./property-inspector-options";

type PositionSettings = {
    selectedPreset?: string;
};

@action({ UUID: "com.coffeesanvt.yaps-streamdeck-integration.position-preset" })
export class PositionPreset extends SingletonAction<PositionSettings> {
    override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, PositionSettings>): Promise<void> {
        const event = "getPresets";
        const { payload } = ev;

        if (payload instanceof Object && "event" in payload && payload.event === event) {
            streamDeck.ui.sendToPropertyInspector({
                event,
                items: await this.#getPresets(),
            });
        }
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<PositionSettings>): Promise<void> {
        if (ev.action.isKey() || ev.action.isDial()) {
            await ev.action.setTitle(ev.payload.settings.selectedPreset ?? "");
        }
    }

    override async onKeyDown(ev: KeyDownEvent<PositionSettings>): Promise<void> {
        const preset = ev.payload.settings.selectedPreset;
        if (!preset) return;

        const response = await sendRequest<ApplyPreset>(`apply_preset:${preset}`);
        if (response.status === "error") return;

        streamDeck.logger.debug(preset);
    }

    async #getPresets(): Promise<PropertyInspectorOption[]> {
        const response = await sendRequest<GetPresets>("get_presets");
        if (response.status === "error") return createOptions([]);

        const options = createOptions(response.presets);
        streamDeck.logger.debug(options);
        return options;
    }
}
