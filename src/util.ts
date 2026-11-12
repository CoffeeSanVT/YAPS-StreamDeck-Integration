import streamDeck, { type Action, type KeyAction } from "@elgato/streamdeck";
import type { JsonObject } from "@elgato/utils";

export async function resetOtherKeys<T extends JsonObject>(
    clicked: Action<T>,
    settingKey: keyof T & string,
    state = 0
): Promise<void> {
    const clickedValue = (await clicked.getSettings())[settingKey];

    const others = [...streamDeck.actions].filter(
        (a) => a.manifestId === clicked.manifestId && a.id !== clicked.id
    );

    await Promise.all(
        others.map(async (a) => {
            if (!a.isKey()) return;

            const key = a as KeyAction<T>;
            const settings = await key.getSettings();

            if (settings[settingKey] !== clickedValue) {
                await key.setState(state);
            }
        })
    );
}