/**
 * Input for indexing a document.
 */
export type IndexInput = {
    /** Unique identifier for the document. */
    id: string;
    /** Collection name (e.g. "paintings", "artists"). */
    collection: string;
    /** Human-readable title. */
    title: string;
    /** The content to index (text, image URL, or website URL). */
    content: string;
    /** Optional metadata to store with the document. */
    metadata?: Record<string, unknown>;
};

/**
 * Comparison operator for metadata filters.
 */
export type FilterOperator =
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "in"
    | "not_in"
    | "contains_all"
    | "contains_any"
    | "contains_none";

/**
 * A metadata filter condition applied to search results.
 */
export type SearchFilter = {
    /** Metadata key to filter on. */
    key: string;
    /** Comparison operator. */
    operator: FilterOperator;
    /** Value to compare against. */
    value: string | number | boolean | string[];
};

/**
 * Input for searching indexed content.
 */
export type SearchInput = {
    /** The search query. */
    query: string;
    /** Collections to search in. */
    collections: string[];
    /** Maximum number of results to return. Defaults to 10. */
    limit?: number;
    /** Number of results to skip. Defaults to 0. */
    offset?: number;
    /** Metadata filters. Mutually exclusive with `autoFilters`. */
    filters?: SearchFilter[];
    /** Let the AI extract filters from the query. Mutually exclusive with `filters`. */
    autoFilters?: boolean;
};

/**
 * A single search result.
 */
export type SearchResult = {
    /** The document's unique identifier. */
    external_id: string;
    /** The document's title. */
    title: string;
    /** The collection this result belongs to. */
    collection: string;
    /** Relevance score (0–1). */
    score: number;
    /** Metadata stored with the document. */
    metadata: Record<string, unknown>;
};

/**
 * Response from a search query.
 */
export type SearchResponse = {
    /** The original query. */
    query: string;
    /** Matching results. */
    results: SearchResult[];
    /** Filters that were applied (present when filters or autoFilters were used). */
    appliedFilters?: SearchFilter[];
    /** Refined query rewritten by the AI (present when autoFilters was used). */
    refinedQuery?: string;
};

/**
 * Input for updating a document's metadata.
 */
export type PatchInput = {
    /** Unique identifier for the document. */
    id: string;
    /** Metadata to update. */
    metadata: Record<string, unknown>;
};
