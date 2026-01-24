type FetchConfig = {
    apiKey: string;
    baseUrl: string;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const parseErrorPayload = async (response: Response): Promise<unknown> => {
    try {
        const data = (await response.json()) as unknown;
        return isObject(data) ? data : { error: "Request failed." };
    } catch {
        return { error: "Request failed." };
    }
};

export const fetchJson = async <T>(
    config: FetchConfig,
    path: string,
    options: { method: "GET" | "POST"; body?: unknown },
): Promise<T> => {
    try {
        const response = await fetch(`${config.baseUrl}${path}`, {
            method: options.method,
            headers: {
                Authorization: `Bearer ${config.apiKey}`,
                "Content-Type": "application/json",
            },
            body: options.body === undefined ? undefined : JSON.stringify(options.body),
        });

        if (!response.ok) {
            const payload = await parseErrorPayload(response);
            throw payload;
        }

        return (await response.json()) as T;
    } catch (error) {
        if (isObject(error)) {
            throw error;
        }
        throw { error: "Network request failed." };
    }
};
