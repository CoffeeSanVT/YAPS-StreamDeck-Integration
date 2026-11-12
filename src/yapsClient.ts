import streamDeck from "@elgato/streamdeck";

import type { YAPSError } from "./yaps-types";
import { config } from "./config";

let ws: WebSocket | null = null;

function connect(): Promise<WebSocket> {
    if (ws && ws.readyState === WebSocket.OPEN) return Promise.resolve(ws);

    return new Promise((resolve, reject) => {
        ws = new WebSocket(config.serverUrl);
        ws.onopen = () => resolve(ws!);
        ws.onerror = (e) => reject(e);
    });
}

export async function sendMessage(command: string): Promise<void> {
    const socket = await connect();

    socket.send(command);
}

async function decodeData(data: unknown): Promise<string> {
    if (typeof data === "string") return data;
    if (data instanceof Blob) return await data.text();
    if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
    return String(data);
}

export async function sendRequest<T>(command: string): Promise<T | YAPSError> {
    const socket = await connect();

    return new Promise<T | YAPSError>((resolve) => {
        let settled = false;

        const finish = (result: T | YAPSError) => {
            if (settled) return;
            settled = true;
            socket.removeEventListener("message", onMessage);
            socket.removeEventListener("error", onError);
            socket.removeEventListener("close", onClose);
            resolve(result);
        };

        const fail = (message: string) => {
            streamDeck.logger.error(`sendRequest("${command}"): ${message}`);
            finish({ status: "error", message });
        };

        const onMessage = async (e: MessageEvent) => {
            try {
                const text = await decodeData(e.data);
                const msg = JSON.parse(text);

                if (msg === null || typeof msg !== "object") return;

                streamDeck.logger.debug(`sendRequest("${command}") <- ${text}`);
                finish(msg as T);
            } catch {
                streamDeck.logger.warn(`sendRequest("${command}"): ignoring non-JSON message`);
            }
        };

        const onError = () => fail("WebSocket error");
        const onClose = (ev: CloseEvent) => fail(`socket closed (code=${ev.code})`);

        socket.addEventListener("message", onMessage);
        socket.addEventListener("error", onError);
        socket.addEventListener("close", onClose);

        try {
            socket.send(command);
        } catch (err) {
            fail(`send failed: ${String(err)}`);
        }
    });
}

export function reconnect(): Promise<WebSocket> {
    ws?.close();
    ws = null;
    return connect();
}