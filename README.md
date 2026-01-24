<p align="center">
  <a href="https://etoile.dev">
    <img src="https://etoile.dev/assets/logo-black.svg" alt="Étoile" height="32" />
  </a>
</p>

<p align="center">
  <img src="https://etoile.dev/assets/hands-of-god.jpg" alt="Add search to your app in seconds" width="100%" />
</p>

<h1 align="center">@etoile/client</h1>

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

**Étoile** lets you add powerful search to your app or website in seconds.

Drop in your content—text, images, URLs—and your users can instantly find anything. No relevance tuning. No keyword configuration. It just works.

---

## Features

- **Fast.** Results in milliseconds, even at scale.
- **Easy.** Drop in your content. Étoile takes care of the rest.
- **Crafted.** An API you'll enjoy using.

---

## Install

```bash
npm install @etoile/client
```

---

## Quickstart

```ts
import { Etoile } from "@etoile/client";

const etoile = new Etoile({ apiKey: process.env.ETOILE_API_KEY! });

// Index a painting
await etoile.index({
  id: "starry-night",
  collection: "paintings",
  title: "The Starry Night",
  content: "A swirling night sky over a village, painted by Vincent van Gogh in 1889.",
  metadata: { artist: "Vincent van Gogh", year: 1889 },
});

// Index an artist
await etoile.index({
  id: "van-gogh",
  collection: "artists",
  title: "Vincent van Gogh",
  content: "Dutch Post-Impressionist painter known for bold colors and emotional honesty.",
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
|--------------|---------------------------|----------|
| `id`         | `string`                  | ✓        |
| `collection` | `string`                  | ✓        |
| `title`      | `string`                  | ✓        |
| `content`    | `string`                  | ✓        |
| `metadata`   | `Record<string, unknown>` |          |

### `etoile.search(input)`

Search indexed content.

| Field         | Type       | Required | Default |
|---------------|------------|----------|---------|
| `query`       | `string`   | ✓        |         |
| `collections` | `string[]` | ✓        |         |
| `limit`       | `number`   |          | `10`    |
| `offset`      | `number`   |          | `0`     |

Returns `{ query, results }` where each result includes `external_id`, `title`, `collection`, `score`, and `metadata`.

---

## Why Étoile?

> "If it contains information, Étoile can index it."

- **No configuration.** Relevance, keywords, and language are handled automatically.
- **Privacy-friendly.** We only store what's needed to power search. Your original content stays yours.
- **Free to start.** No credit card required.

---

<p align="center">
  <a href="https://etoile.dev/docs"><strong>Read the docs →</strong></a>
</p>
