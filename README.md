<p align="center">
  <a href="https://etoile.dev">
    <img src="https://etoile.dev/assets/logo-black.svg" alt="Etoile" height="32" />
  </a>
</p>

<p align="center">
  <img src="https://etoile.dev/assets/hands-of-god.jpg" alt="Add search to your app in seconds" width="100%" />
</p>

<h1 align="center">@etoile-dev/client</h1>

<p align="center">
  <strong>Add AI search to your app in seconds.</strong>
  <br />
  Zero configuration. Results in milliseconds.
</p>

<p align="center">
  <a href="https://etoile.dev">Website</a> · <a href="https://etoile.dev/docs">Documentation</a>
</p>

---

## About

**Etoile** lets you add powerful search to your app or website in seconds.

Drop in your content—text, images, URLs—and your users can instantly find anything. No relevance tuning. No keyword configuration. It just works.

---

## Features

- **Fast.** Results in milliseconds, even at scale.
- **Easy.** Drop in your content. Etoile takes care of the rest.
- **Filterable.** Narrow results with structured metadata filters.
- **Smart filters.** Let the AI extract filters from natural-language queries.
- **Crafted.** An API you'll enjoy using.

---

## Install

```bash
npm i @etoile-dev/client
```

---

## Quickstart

```ts
import { Etoile } from "@etoile-dev/client";

const etoile = new Etoile({ apiKey: process.env.ETOILE_API_KEY! });

// Index a painting
await etoile.index({
  id: "starry-night",
  collection: "paintings",
  title: "The Starry Night",
  content:
    "A swirling night sky over a village, painted by Vincent van Gogh in 1889.",
  metadata: { artist: "Vincent van Gogh", year: 1889 },
});

// Index an artist
await etoile.index({
  id: "van-gogh",
  collection: "artists",
  title: "Vincent van Gogh",
  content:
    "Dutch Post-Impressionist painter known for bold colors and emotional honesty.",
});

// Search across collections
const { results } = await etoile.search({
  query: "swirling sky painting",
  collections: ["paintings", "artists"],
});

console.log(results);
```

---

## API

### `new Etoile({ apiKey })`

Create a client. Get your API key at [etoile.dev](https://etoile.dev).

### `etoile.index(input)`

Index a document.

| Field        | Type                      | Required |
| ------------ | ------------------------- | -------- |
| `id`         | `string`                  | ✓        |
| `collection` | `string`                  | ✓        |
| `title`      | `string`                  | ✓        |
| `content`    | `string`                  | ✓        |
| `metadata`   | `Record<string, unknown>` |          |

### `etoile.search(input)`

Search indexed content.

| Field         | Type             | Required | Default |
| ------------- | ---------------- | -------- | ------- |
| `query`       | `string`         | ✓        |         |
| `collections` | `string[]`       | ✓        |         |
| `limit`       | `number`         |          | `10`    |
| `offset`      | `number`         |          | `0`     |
| `filters`     | `SearchFilter[]` |          |         |
| `autoFilters` | `boolean`        |          |         |

`filters` and `autoFilters` are mutually exclusive.

Returns `{ query, results, appliedFilters?, refinedQuery? }` where each result includes `external_id`, `title`, `collection`, `score`, and `metadata`.

#### Filter by metadata

Pass `filters` to narrow results to documents whose metadata matches your conditions:

```ts
const { results } = await etoile.search({
  query: "espresso machine",
  collections: ["products"],
  filters: [
    { key: "category", operator: "eq", value: "kitchen" },
    { key: "price", operator: "lte", value: 300 },
    { key: "inStock", operator: "eq", value: true },
  ],
});
```

Each filter is a `{ key, operator, value }` object. All filters are combined with AND logic.

| Operator        | Meaning                                          |
| --------------- | ------------------------------------------------ |
| `eq`            | Equal to                                         |
| `neq`           | Not equal to                                     |
| `gt`            | Greater than                                     |
| `gte`           | Greater than or equal                            |
| `lt`            | Less than                                        |
| `lte`           | Less than or equal                               |
| `in`            | Matches any value in the list                    |
| `not_in`        | Matches none of the values in the list           |
| `contains_all`  | Metadata array contains all of the given values  |
| `contains_any`  | Metadata array contains at least one given value |
| `contains_none` | Metadata array contains none of the given values |

#### Smart filters (AI-extracted)

Set `autoFilters: true` to let the AI extract structured filters directly from the natural-language query. The refined semantic query and the extracted filters are returned alongside your results:

```ts
const { results, refinedQuery, appliedFilters } = await etoile.search({
  query: "top-rated Adidas running shoes under $150",
  collections: ["products"],
  autoFilters: true,
});

console.log(refinedQuery); // "running shoes"
console.log(appliedFilters); // [{ key: "brand", operator: "eq", value: "Adidas" }, ...]
```

### `etoile.list({ limit?, offset? })`

List indexed documents, ordered by most recently updated.

| Field    | Type     | Required | Default |
| -------- | -------- | -------- | ------- |
| `limit`  | `number` |          | `20`    |
| `offset` | `number` |          | `0`     |

Returns `{ documents }` where each document includes `external_id`, `collection`, `title`, `type`, `metadata`, `created_at`, and `updated_at`.

```ts
const { documents } = await etoile.list({ limit: 50 });
documents.forEach((doc) => console.log(doc.external_id, doc.title));
```

### `etoile.get(id)`

Get a single indexed document by its external ID. Throws if not found.

```ts
const { document } = await etoile.get("starry-night");
console.log(document.title, document.metadata);
```

### `etoile.delete(id)`

Remove a document from the index by its ID.

### `etoile.update({ id, title?, metadata? })`

Update a document. You can update the `title`, the `metadata`, or both.

```ts
await etoile.update({
  id: "starry-night",
  title: "The Starry Night (1889)",
  metadata: { artist: "Vincent van Gogh", year: 1889, museum: "MoMA" },
});
```

---

## Why Etoile?

> "If it contains information, Etoile can index it."

- **No configuration.** Relevance, keywords, and language are handled automatically.
- **Privacy-friendly.** We only store what's needed to power search. Your original content stays yours.
- **Free to start.** No credit card required.

---

<p align="center">
  <a href="https://etoile.dev/docs"><strong>Read the docs →</strong></a>
</p>
