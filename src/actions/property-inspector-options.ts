export type PropertyInspectorOption = {
    label: string;
    value: string;
};

export function createOptions(names: string[]): PropertyInspectorOption[] {
    return [{ label: "-", value: "" }, ...names.map((name) => ({ label: name, value: name }))];
}
