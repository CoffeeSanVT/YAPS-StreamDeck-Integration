type YAPSSuccess = { status: "ok" };

export type YAPSError = {
    status: "error";
    message: string;
};

export type GetEmotions = YAPSSuccess & { emotions: string[] };
export type GetItems = YAPSSuccess & { items: { name: string; enabled: boolean }[] };
export type GetPresets = YAPSSuccess & { presets: string[] };
export type ApplyPreset = YAPSSuccess & { preset: string };
