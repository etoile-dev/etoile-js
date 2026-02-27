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
 * A full document as returned by the list and get endpoints.
 */
export type Document = {
    /** Internal numeric ID. */
    id: number;
    /** The document's external (user-provided) identifier. */
    external_id: string;
    /** Collection the document belongs to. */
    collection: string;
    /** Human-readable title. */
    title: string;
    /** Content type (e.g. "text", "image", "url"). */
    type: string;
    /** Metadata stored with the document. */
    metadata: Record<string, unknown>;
    /** ISO timestamp of when the document was indexed. */
    created_at: string;
    /** ISO timestamp of the last document update. */
    updated_at: string;
};

/**
 * Input for listing indexed documents.
 */
export type ListInput = {
    /** Maximum number of documents to return. Defaults to 20, capped at 100. */
    limit?: number;
    /** Number of documents to skip. Defaults to 0. */
    offset?: number;
};

/**
 * Input for updating a document.
 */
export type UpdateInput = {
    /** Unique identifier for the document. */
    id: string;
    /** Optional human-readable title to update. */
    title?: string;
    /** Optional metadata to replace on the document. */
    metadata?: Record<string, unknown>;
};
