export type EtoileError = {
    name: "EtoileError";
    code: string;
    message: string;
};

export const createEtoileError = (code: string, message: string): EtoileError => ({
    name: "EtoileError",
    code,
    message,
});

export const isEtoileError = (value: unknown): value is EtoileError =>
    Boolean(
        value &&
        typeof value === "object" &&
        (value as EtoileError).name === "EtoileError" &&
        typeof (value as EtoileError).code === "string" &&
        typeof (value as EtoileError).message === "string",
    );
