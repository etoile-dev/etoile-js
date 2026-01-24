import { createEtoileError } from "./errors";
import { fetchJson } from "./fetch";
import type { IndexInput, SearchInput, SearchResponse } from "./types";

const API_URL = "https://etoile.dev/api/v1";

const assertNonEmptyString = (value: unknown, field: string): void => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw createEtoileError("INVALID_INPUT", `${field} is required.`);
    }
};

const assertContent = (value: unknown): void => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw createEtoileError("INVALID_INPUT", "content is required.");
    }
};

const validateCollections = (collections: unknown): string[] => {
    if (!Array.isArray(collections) || collections.length === 0) {
        throw createEtoileError(
            "INVALID_INPUT",
            "collections must be a non-empty array of strings.",
        );
    }

    if (!collections.every((item) => typeof item === "string" && item.trim().length > 0)) {
        throw createEtoileError(
            "INVALID_INPUT",
            "collections must be a non-empty array of strings.",
        );
    }

    return collections;
};

/**
 * Étoile client for indexing and searching content.
 *
 * @example
 * ```ts
 * const etoile = new Etoile({ apiKey: "your-api-key" });
 *
 * await etoile.index({
 *   id: "starry-night",
 *   collection: "paintings",
 *   title: "The Starry Night",
 *   content: "A swirling night sky over a village.",
 * });
 *
 * const { results } = await etoile.search({
 *   query: "night sky",
 *   collections: ["paintings"],
 * });
 * ```
 */
export class Etoile {
    private readonly config: {
        apiKey: string;
    };

    /**
     * Create a new Étoile client.
     *
     * @param config - Configuration options.
     * @param config.apiKey - Your Étoile API key. Get one at https://etoile.dev
     *
     * @example
     * ```ts
     * const etoile = new Etoile({ apiKey: process.env.ETOILE_API_KEY! });
     * ```
     */
    constructor(config: { apiKey: string }) {
        if (!config || typeof config !== "object") {
            throw createEtoileError("INVALID_INPUT", "Config is required.");
        }

        assertNonEmptyString(config.apiKey, "apiKey");

        this.config = Object.freeze({
            apiKey: config.apiKey,
        });
    }

    /**
     * Index a document for search.
     *
     * @param input - The document to index.
     * @param input.id - Unique identifier for the document.
     * @param input.collection - Collection name (e.g. "paintings", "artists").
     * @param input.title - Human-readable title.
     * @param input.content - The content to index (text, image URL, or website URL).
     * @param input.metadata - Optional metadata to store with the document.
     *
     * @example
     * ```ts
     * await etoile.index({
     *   id: "starry-night",
     *   collection: "paintings",
     *   title: "The Starry Night",
     *   content: "A swirling night sky over a village, painted by Van Gogh.",
     *   metadata: { artist: "Vincent van Gogh", year: 1889 },
     * });
     * ```
     */
    async index(input: IndexInput): Promise<void> {
        assertNonEmptyString(input.id, "id");
        assertNonEmptyString(input.collection, "collection");
        assertNonEmptyString(input.title, "title");
        assertContent(input.content);

        await fetchJson<unknown>({ apiKey: this.config.apiKey, baseUrl: API_URL }, "/index", {
            method: "POST",
            body: {
                id: input.id,
                collection: input.collection,
                title: input.title,
                content: input.content,
                metadata: input.metadata,
            },
        });
    }

    /**
     * Search indexed content.
     *
     * @param input - Search parameters.
     * @param input.query - The search query.
     * @param input.collections - Collections to search in.
     * @param input.limit - Maximum number of results (default: 10).
     * @param input.offset - Number of results to skip (default: 0).
     * @returns Search results with scores and metadata.
     *
     * @example
     * ```ts
     * const { results } = await etoile.search({
     *   query: "swirling sky painting",
     *   collections: ["paintings", "artists"],
     *   limit: 5,
     * });
     *
     * results.forEach((result) => {
     *   console.log(result.title, result.score);
     * });
     * ```
     */
    async search(input: SearchInput): Promise<SearchResponse> {
        assertNonEmptyString(input.query, "query");
        const collections = validateCollections(input.collections);

        if (input.limit !== undefined && (!Number.isFinite(input.limit) || input.limit <= 0)) {
            throw createEtoileError("INVALID_INPUT", "limit must be a positive number.");
        }

        if (input.offset !== undefined && (!Number.isFinite(input.offset) || input.offset < 0)) {
            throw createEtoileError("INVALID_INPUT", "offset must be a non-negative number.");
        }

        const body: Record<string, unknown> = {
            query: input.query,
            collections,
            limit: input.limit ?? 10,
            offset: input.offset ?? 0,
        };

        return fetchJson<SearchResponse>({ apiKey: this.config.apiKey, baseUrl: API_URL }, "/search", {
            method: "POST",
            body,
        });
    }
}
