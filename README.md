# NACE Lookup API

This API serves NACE codes from the `naceCodes` JSON files using Hono.

## Running the app

Install dependencies and start the server:

```bash
bun install
bun run dev
```

Then open:

```text
http://localhost:3000
```

## Endpoints

### `GET /nace/:lang`

Returns the entire NACE JSON dataset for the requested language.

- `:lang` — language code, e.g. `en`, `da`, `fi`, `no`, `se`

**Example**

```http
GET /nace/en HTTP/1.1
```

**Response**

```json
{
  "nodes": {
    "A": {
      "code": "A",
      "fullCode": "A",
      "section": "A",
      "parent": null,
      "text": "AGRICULTURE, FORESTRY AND FISHING",
      "children": ["01", "02", "03"]
    },
    ...
  }
}
```

### `GET /nace/:lang/:code`

Returns the NACE node for a specific code.

- `:lang` — language code.
- `:code` — NACE code to look up, e.g. `01.11`, `01.2`, `B`.

**Example**

```http
GET /nace/en/01.11 HTTP/1.1
```

**Response**

```json
{
  "code": "01.11",
  "fullCode": "A 01.11",
  "section": "A",
  "parent": "01.1",
  "text": "Growing of cereals, other than rice, leguminous crops and oil seeds",
  "children": []
}
```

### `GET /nace/:lang/:code/parents`

Returns the requested NACE code and its ancestors (parent chain), not including the code itself in the `parents` list.

**Example**

```http
GET /nace/en/01.11/parents HTTP/1.1
```

**Response**

```json
{
  "code": {
    "code": "01.11",
    "fullCode": "A 01.11",
    "section": "A",
    "parent": "01.1",
    "text": "Growing of cereals, other than rice, leguminous crops and oil seeds",
    "children": []
  },
  "parents": [
    { "code": "A", ... },
    { "code": "01", ... },
    { "code": "01.1", ... }
  ]
}
```

### `GET /nace/:lang/:code/siblings`

Returns the requested NACE code and its sibling codes (other nodes sharing the same parent), excluding the code itself.

**Example**

```http
GET /nace/en/01.1/siblings HTTP/1.1
```

**Response**

```json
{
  "code": { "code": "01.1", ... },
  "siblings": [
    { "code": "01.2", ... },
    { "code": "01.3", ... },
    ...
  ]
}
```

## Notes

- The data is loaded from `naceCodes/<lang>.json`.
- Supported languages are currently only the Nordic countries plus the European/English dataset: `en`, `da`, `fi`, `no`, `se`.
- If a code is not found, the API returns a JSON error object with HTTP status `404`.
- If a file or language cannot be loaded, the API returns a JSON error with HTTP status `500`.
