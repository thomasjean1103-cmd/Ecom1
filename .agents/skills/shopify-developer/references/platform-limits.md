# Shopify Platform Limits

## Table of Contents
- [What You Can / Can't Do](#what-you-can--cant-do)
- [API Versioning](#api-versioning)
- [Rate Limits](#rate-limits)
- [GraphQL Cost and Headers](#graphql-cost-and-headers)
- [Resource Limits](#resource-limits)
- [Plan-Specific Features](#plan-specific-features)
- [Deprecation Timeline (2025-2026)](#deprecation-timeline-2025-2026)
- [REST to GraphQL Migration](#rest-to-graphql-migration)
- [Operational Checklist](#operational-checklist)
- [Gotchas](#gotchas)

## What You Can / Can't Do

### You can
- Use Admin GraphQL and Storefront GraphQL as primary APIs for new features.
- Use bulk operations for high-volume exports/import-like mutation workflows.
- Use checkout extensibility and Shopify Functions for modern checkout customization.
- Use API version pinning to control rollout and test quarterly upgrades.

### You can't
- Depend on unsupported API versions after support ends.
- Assume identical limits across plans (especially Plus vs non-Plus).
- Keep using legacy checkout customization (`checkout.liquid`) long-term.
- Use network or filesystem APIs in Shopify Functions runtime.

## API Versioning

Shopify Admin and Storefront APIs use quarterly versioning (`YYYY-MM`), for example `2026-01`.

| Item | Rule |
|---|---|
| Release cadence | Quarterly |
| Version format | `YYYY-MM` |
| Support window | 12 months |
| Upgrade cadence (recommended) | Once per quarter or at least every 2 quarters |

Practical policy:
1. Pin API version explicitly in all endpoints.
2. Run contract tests against the next version before cutover.
3. Remove deprecated fields proactively each quarter.

Endpoint examples:

```bash
# Admin GraphQL
https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json

# Storefront GraphQL
https://${SHOP}.myshopify.com/api/${API_VERSION}/graphql.json
```

## Rate Limits

Use this file as authoritative limit guidance. Other references should link here.

### Admin GraphQL (cost-based)

| Plan tier | Bucket size | Restore rate |
|---|---:|---:|
| Standard | 1000 points | 50 points/sec |
| Plus | 2000 points | 100 points/sec |

### Admin REST (legacy/maintenance)

| Plan tier | Approx steady rate |
|---|---:|
| Standard | 2 requests/sec |
| Plus | 4 requests/sec |

### Storefront API

| API | Nominal rate guidance |
|---|---:|
| Storefront GraphQL | 60 requests/sec |

### Bulk operations

Bulk operations are the preferred path for large datasets. They reduce rate pressure and avoid paging bottlenecks.

## GraphQL Cost and Headers

Admin GraphQL responses expose cost data. Use it for adaptive throttling.

Query pattern:

```graphql
query Products($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    edges {
      cursor
      node {
        id
        title
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

Response extensions to read:

- `extensions.cost.requestedQueryCost`
- `extensions.cost.actualQueryCost`
- `extensions.cost.throttleStatus.maximumAvailable`
- `extensions.cost.throttleStatus.currentlyAvailable`
- `extensions.cost.throttleStatus.restoreRate`

Legacy REST header you may still encounter:

- `X-Shopify-Shop-Api-Call-Limit`

Recommended throttling strategy:
1. Compute a safe budget per request.
2. Pause when `currentlyAvailable` falls below your floor.
3. Use exponential backoff on throttle errors.
4. Lower `first:` values when cost spikes.

## Resource Limits

Numbers below are commonly used operational ceilings for planning and validation.

### Catalog and products

| Limit | Value |
|---|---:|
| Variants per product | 100 |
| Product options per product | 3 |
| Product images | 250 |

### Theme and template limits

| Limit | Value |
|---|---:|
| Theme total size | 50 MB |
| Single file size | 2 MB |
| Sections per template | 100 |
| Blocks per section | 50 |
| Settings per section | 25 |

### Metafields and metaobjects

| Limit | Value |
|---|---:|
| Metafields per resource | 200 |
| Metafield value max size | 512 KB |
| Namespace length | 20 chars |
| Key length | 30 chars |
| Metafield definitions | 200 |
| Metaobject entries per definition | 50,000 |

### Cart and checkout related

| Limit | Value |
|---|---:|
| Cart line items | 500 |
| Discount codes per order | 1 (stacking varies by setup/plan) |

### Shopify Functions runtime

| Constraint | Guidance |
|---|---|
| Runtime budget | Keep logic under ~5ms target |
| Memory | ~10 MB budget |
| I/O payload | ~64 KB practical budget |
| Network access | Not available |
| Filesystem access | Not available |

## Plan-Specific Features

| Capability | Basic/Shopify/Advanced | Plus |
|---|---|---|
| Online Store 2.0 themes | Yes | Yes |
| Admin/Storefront APIs | Yes | Yes |
| Shopify Functions (full checkout use cases) | Limited by target | Broad support |
| Advanced checkout extensibility | Limited | Yes |
| Launchpad and advanced B2B controls | No | Yes |

Treat plan availability as a preflight check for any implementation.

## Deprecation Timeline (2025-2026)

| Date | Change | Action |
|---|---|---|
| August 2025 | `checkout.liquid` migration pressure increases for Plus implementations | Complete extension migration in staged rollouts |
| August 2026 | Legacy checkout customization retirement for all stores | Remove legacy checkout custom code |
| April 2026 | Idempotency expectations tighten for retries on write paths | Adopt idempotency keys and duplicate write guards |
| June 2026 | Shopify Scripts sunset window | Migrate Scripts to Shopify Functions |

Use this table as migration planning input and dependency-risk tracking.

## REST to GraphQL Migration

Use this sequence to migrate without outages:

1. Inventory REST endpoints currently in use.
2. Map each endpoint to GraphQL query/mutation equivalents.
3. Implement GraphQL in shadow mode and compare outputs.
4. Add feature flags for cutover.
5. Cut traffic gradually and monitor parity.
6. Remove REST-only code and re-run regression tests.

Example mapping:

| REST Pattern | GraphQL Replacement |
|---|---|
| Product reads by page | `products(first:, after:)` cursor pagination |
| Product update endpoints | `productUpdate` mutation |
| Metafield endpoint CRUD | `metafieldsSet` + `metafieldsDelete` |
| Batch export jobs | `bulkOperationRunQuery` |

## Operational Checklist

- Pin current API version in all clients.
- Monitor throttle and error rates by shop.
- Keep schema contract tests on next API version.
- Validate plan-specific capability before rollout.
- Centralize limit constants to avoid hardcoded drift.

## Gotchas

1. Do not copy limits into multiple files; this file is the source of truth.
2. Treat request and cost throttling as distinct concepts.
3. Plus and non-Plus throughput assumptions differ materially.
4. Bulk operations are asynchronous; design status polling.
5. Deprecated fields may exist for one version and disappear in the next.
6. Version mismatch in URL is a common source of unexpected missing fields.
