import streamDeck from "@elgato/streamdeck";

import { ChangeExpression } from "./actions/change-expression";
import { ModelFlip } from "./actions/model-flip";
import { PositionPreset } from "./actions/position-preset";
import { ToggleAsset } from "./actions/toggle-asset";
import { config, DEFAULT_SERVER_URL, type GlobalSettings } from "./config";
import { reconnect } from "./yapsClient";

streamDeck.settings.getGlobalSettings<GlobalSettings>().then((settings) => {
    config.serverUrl = settings.serverUrl || DEFAULT_SERVER_URL;
});

streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>((ev) => {
    const newServerUrl = ev.settings.serverUrl || DEFAULT_SERVER_URL;

    if (newServerUrl !== config.serverUrl) {
        config.serverUrl = newServerUrl;
        reconnect();
    }
});

streamDeck.logger.setLevel("debug");

streamDeck.actions.registerAction(new ModelFlip());
streamDeck.actions.registerAction(new ChangeExpression());
streamDeck.actions.registerAction(new ToggleAsset());
streamDeck.actions.registerAction(new PositionPreset());

streamDeck.connect();
