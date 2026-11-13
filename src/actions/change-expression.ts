import streamDeck, {
    action,
    SingletonAction,
    type DidReceiveSettingsEvent,
    type KeyDownEvent,
    type SendToPluginEvent,
} from "@elgato/streamdeck";
import type { JsonValue } from "@elgato/utils";

import { sendMessage, sendRequest } from "../yapsClient";
import type { GetEmotions } from "../yaps-types";
import { createOptions, type PropertyInspectorOption } from "./property-inspector-options";
import { resetOtherKeys } from "../util";

type ExpressionSettings = {
    selectedExpression?: string;
};

@action({ UUID: "com.coffeesanvt.yaps-streamdeck-integration.change-expression" })
export class ChangeExpression extends SingletonAction<ExpressionSettings> {
    override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, ExpressionSettings>): Promise<void> {
        const event = "getExpressions";
        const { payload } = ev;

        if (payload instanceof Object && "event" in payload && payload.event === event) {
            streamDeck.ui.sendToPropertyInspector({
                event,
                items: await this.#getExpressions(),
            });
        }
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ExpressionSettings>): Promise<void> {
        if (ev.action.isKey() || ev.action.isDial()) {
            await ev.action.setTitle(ev.payload.settings.selectedExpression ?? "");
        }
    }

    override async onKeyDown(ev: KeyDownEvent<ExpressionSettings>): Promise<void> {
        const expression = ev.payload.settings.selectedExpression;
        if (!expression) return;

        sendMessage(`set_emotion:${expression}:${!ev.payload.state}`);
        
        await resetOtherKeys(ev.action, "selectedExpression");
        streamDeck.logger.debug(expression);
    }

    async #getExpressions(): Promise<PropertyInspectorOption[]> {
        const response = await sendRequest<GetEmotions>("get_emotions");
        if (response.status === "error") return createOptions([]);

        const options = createOptions(response.emotions);
        streamDeck.logger.debug(options);
        return options;
    }
}
