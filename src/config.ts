export const DEFAULT_SERVER_URL = "ws://localhost:19167";

export const config = {
    serverUrl: DEFAULT_SERVER_URL,
};

export type GlobalSettings = { serverUrl?: string };