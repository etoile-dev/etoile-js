import { createEtoileError } from "./errors";
import { fetchJson } from "./fetch";
import type { IndexInput, PatchInput, SearchInput, SearchResponse } from "./types";

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
        baseUrl: string;
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
    constructor(config: { apiKey: string; baseUrl?: string }) {
        if (!config || typeof config !== "object") {
            throw createEtoileError("INVALID_INPUT", "Config is required.");
        }

        assertNonEmptyString(config.apiKey, "apiKey");

        this.config = Object.freeze({
            apiKey: config.apiKey,
            baseUrl: config.baseUrl ?? API_URL,
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

        await fetchJson<unknown>(this.config, "/index", {
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
     * @param input.filters - Metadata filters. Mutually exclusive with `autoFilters`.
     * @param input.autoFilters - Let the AI extract filters from the query. Mutually exclusive with `filters`.
     * @returns Search results with scores and metadata.
     *
     * @example
     * ```ts
     * // Basic search
     * const { results } = await etoile.search({
     *   query: "swirling sky painting",
     *   collections: ["paintings", "artists"],
     *   limit: 5,
     * });
     *
     * // With explicit filters
     * const filtered = await etoile.search({
     *   query: "comfortable shoe",
     *   collections: ["products"],
     *   filters: [
     *     { key: "category", operator: "in", value: ["running", "training"] },
     *     { key: "price", operator: "lte", value: 150 },
     *   ],
     * });
     *
     * // With smart filters (AI-extracted)
     * const smart = await etoile.search({
     *   query: "top-rated Adidas running shoes under $150",
     *   collections: ["products"],
     *   autoFilters: true,
     * });
     * console.log(smart.refinedQuery);    // "running shoes"
     * console.log(smart.appliedFilters);  // [{ key: "brand", operator: "eq", value: "Adidas" }, ...]
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

        if (input.filters !== undefined && input.autoFilters !== undefined) {
            throw createEtoileError(
                "INVALID_INPUT",
                "filters and autoFilters are mutually exclusive.",
            );
        }

        if (input.filters !== undefined) {
            if (!Array.isArray(input.filters) || input.filters.length === 0) {
                throw createEtoileError(
                    "INVALID_INPUT",
                    "filters must be a non-empty array.",
                );
            }

            for (const filter of input.filters) {
                if (!filter || typeof filter !== "object") {
                    throw createEtoileError("INVALID_INPUT", "Each filter must be an object.");
                }
                assertNonEmptyString(filter.key, "filter.key");
                assertNonEmptyString(filter.operator, "filter.operator");
                if (filter.value === undefined || filter.value === null) {
                    throw createEtoileError("INVALID_INPUT", "filter.value is required.");
                }
            }
        }

        const body: Record<string, unknown> = {
            query: input.query,
            collections,
            limit: input.limit ?? 10,
            offset: input.offset ?? 0,
        };

        if (input.filters !== undefined) {
            body.filters = input.filters;
        }

        if (input.autoFilters !== undefined) {
            body.autoFilters = input.autoFilters;
        }

        return fetchJson<SearchResponse>(this.config, "/search", {
            method: "POST",
            body,
        });
    }

    /**
     * Delete an indexed document.
     *
     * @param id - Unique identifier for the document.
     *
     * @example
     * ```ts
     * await etoile.delete("starry-night");
     * ```
     */
    async delete(id: string): Promise<void> {
        assertNonEmptyString(id, "id");

        await fetchJson<unknown>(this.config, "/documents", {
            method: "DELETE",
            body: { id },
        });
    }

    /**
     * Update a document's metadata.
     *
     * @param input - The update parameters.
     * @param input.id - Unique identifier for the document.
     * @param input.metadata - Metadata to update.
     *
     * @example
     * ```ts
     * await etoile.patch({
     *   id: "starry-night",
     *   metadata: { artist: "Vincent van Gogh", year: 1889, museum: "MoMA" },
     * });
     * ```
     */
    async patch(input: PatchInput): Promise<void> {
        assertNonEmptyString(input.id, "id");
        if (!input.metadata || typeof input.metadata !== "object") {
            throw createEtoileError("INVALID_INPUT", "metadata is required.");
        }

        await fetchJson<unknown>(this.config, "/documents", {
            method: "PATCH",
            body: {
                id: input.id,
                metadata: input.metadata,
            },
        });
    }
}
