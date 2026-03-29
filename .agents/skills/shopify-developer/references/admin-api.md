# Admin API (GraphQL)

## Table of Contents
- [What You Can / Can't Do](#what-you-can--cant-do)
- [Authentication and Endpoint](#authentication-and-endpoint)
- [Common Query and Mutation Conventions](#common-query-and-mutation-conventions)
- [Products](#products)
- [Orders and Fulfillment](#orders-and-fulfillment)
- [Customers and B2B Company Patterns](#customers-and-b2b-company-patterns)
- [Inventory](#inventory)
- [Metafield Mutations](#metafield-mutations)
- [Bulk Operations](#bulk-operations)
- [Rate Limit Approach](#rate-limit-approach)
- [Workflow: Export All Products](#workflow-export-all-products)
- [Workflow: Bulk Update Metafields](#workflow-bulk-update-metafields)
- [Workflow: Sync Inventory](#workflow-sync-inventory)
- [Gotchas](#gotchas)

## What You Can / Can't Do

### You can
- Read/write core commerce data (products, orders, customers, inventory).
- Use GraphQL mutations with explicit error handling (`userErrors`).
- Use asynchronous bulk operations for high-volume reads/writes.
- Attach structured data via metafields and metaobjects.

### You can't
- Assume REST-like page-number pagination in GraphQL.
- Ignore cost throttling and expect stable throughput.
- Treat HTTP 200 as operation success without parsing mutation errors.
- Use legacy checkout customization paths for new projects.

## Authentication and Endpoint

Admin GraphQL endpoint format:

```bash
https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json
```

Headers:

```bash
X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}
Content-Type: application/json
```

Baseline request template:

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { shop { id name } }"}'
```

## Common Query and Mutation Conventions

- Use variables instead of string interpolation for dynamic values.
- Use cursors (`first`, `after`) for pagination.
- Request only required fields to reduce cost.
- Parse these response locations:
  - `errors` (top-level GraphQL parsing/execution)
  - `data.<mutation>.userErrors` (business validation)
  - `extensions.cost` (throttle and cost budgeting)

Mutation response pattern:

```graphql
mutation SomeMutation($input: SomeInput!) {
  someMutation(input: $input) {
    resource {
      id
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

## Products

### Query products with pagination

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query Products($first: Int!, $after: String) { products(first: $first, after: $after, sortKey: UPDATED_AT) { edges { cursor node { id title handle status updatedAt } } pageInfo { hasNextPage endCursor } } }",
    "variables": { "first": 50, "after": null }
  }'
```

### Create product (`productCreate`)

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CreateProduct($input: ProductInput!) { productCreate(product: $input) { product { id title handle status } userErrors { field message code } } }",
    "variables": {
      "input": {
        "title": "Focus Journal",
        "handle": "focus-journal",
        "status": "ACTIVE",
        "productType": "Journal"
      }
    }
  }'
```

### Update product (`productUpdate`)

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation UpdateProduct($input: ProductInput!) { productUpdate(product: $input) { product { id title tags } userErrors { field message code } } }",
    "variables": {
      "input": {
        "id": "gid://shopify/Product/123456789",
        "title": "Focus Journal - Updated",
        "tags": ["journal", "productivity"]
      }
    }
  }'
```

### Delete product (`productDelete`)

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation DeleteProduct($input: ProductDeleteInput!) { productDelete(input: $input) { deletedProductId userErrors { field message code } } }",
    "variables": {
      "input": { "id": "gid://shopify/Product/123456789" }
    }
  }'
```

## Orders and Fulfillment

### Query orders by filter

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query Orders($first: Int!, $query: String!) { orders(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) { edges { node { id name displayFinancialStatus displayFulfillmentStatus createdAt totalPriceSet { shopMoney { amount currencyCode } } customer { id email } } } } }",
    "variables": {
      "first": 20,
      "query": "created_at:>=2026-01-01 financial_status:paid"
    }
  }'
```

### Create draft order

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation DraftOrderCreate($input: DraftOrderInput!) { draftOrderCreate(input: $input) { draftOrder { id name status invoiceUrl } userErrors { field message code } } }",
    "variables": {
      "input": {
        "lineItems": [
          { "variantId": "gid://shopify/ProductVariant/11111111", "quantity": 2 }
        ],
        "email": "buyer@example.com",
        "note": "Created by B2B sales workflow"
      }
    }
  }'
```

### Fulfill an order (fulfillment workflow)

Use fulfillment order queries first, then submit fulfillment mutation.

```graphql
query FulfillmentOrders($orderId: ID!) {
  order(id: $orderId) {
    id
    fulfillmentOrders(first: 20) {
      nodes {
        id
        status
        lineItems(first: 50) {
          nodes {
            id
            remainingQuantity
          }
        }
      }
    }
  }
}
```

```graphql
mutation FulfillmentCreate($input: FulfillmentInput!) {
  fulfillmentCreate(fulfillment: $input) {
    fulfillment {
      id
      status
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

## Customers and B2B Company Patterns

### Query customers

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query Customers($first: Int!, $query: String) { customers(first: $first, query: $query) { edges { node { id email firstName lastName tags amountSpent { amount currencyCode } numberOfOrders } } } }",
    "variables": { "first": 25, "query": "tag:B2B" }
  }'
```

### Create customer

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CustomerCreate($input: CustomerInput!) { customerCreate(input: $input) { customer { id email tags } userErrors { field message code } } }",
    "variables": {
      "input": {
        "email": "new.customer@example.com",
        "firstName": "New",
        "lastName": "Customer",
        "tags": ["B2B"]
      }
    }
  }'
```

### Update customer

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CustomerUpdate($input: CustomerInput!) { customerUpdate(input: $input) { customer { id email tags } userErrors { field message code } } }",
    "variables": {
      "input": {
        "id": "gid://shopify/Customer/999999999",
        "tags": ["VIP", "B2B"]
      }
    }
  }'
```

### B2B company account pattern (overview)

1. Query company entities and locations tied to the customer organization.
2. Attach catalog/pricing policy to company location.
3. Build draft orders for negotiated terms when needed.

Use this customer-company relationship pattern for contract pricing workflows.

## Inventory

### Adjust quantities (`inventoryAdjustQuantities`)

```graphql
mutation AdjustInventory($input: InventoryAdjustQuantitiesInput!) {
  inventoryAdjustQuantities(input: $input) {
    inventoryAdjustmentGroup {
      id
      reason
      changes {
        name
        delta
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

Variables example:

```json
{
  "input": {
    "reason": "correction",
    "name": "available",
    "changes": [
      {
        "inventoryItemId": "gid://shopify/InventoryItem/123",
        "locationId": "gid://shopify/Location/456",
        "delta": 10
      }
    ]
  }
}
```

### Set on-hand quantities (`inventorySetOnHandQuantities`)

Use set operations when your source-of-truth system provides absolute quantity.

## Metafield Mutations

Use canonical metafield reference patterns from `references/metafields-metaobjects.md`.

Primary operations:
- `metafieldsSet`
- `metafieldsDelete`

Always parse `userErrors` and verify returned `namespace/key/value`.

## Bulk Operations

Bulk operations are required for large export and batch mutation pipelines.

### Run bulk query export

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation RunBulkQuery($query: String!) { bulkOperationRunQuery(query: $query) { bulkOperation { id status } userErrors { field message } } }",
    "variables": {
      "query": "{ products { edges { node { id title handle updatedAt } } } }"
    }
  }'
```

### Poll status

```graphql
query CurrentBulkOperation {
  currentBulkOperation {
    id
    status
    errorCode
    createdAt
    completedAt
    objectCount
    fileSize
    url
  }
}
```

### Bulk mutation path

1. Use `stagedUploadsCreate` to get upload targets.
2. Upload JSONL payload.
3. Trigger `bulkOperationRunMutation` with staged path.
4. Poll until completion and inspect partial failures.

## Rate Limit Approach

Do not duplicate fixed numbers here. Use `references/platform-limits.md` for all official limits.

Operational guidance:
- Keep query selection minimal.
- Lower batch size when `requestedQueryCost` is high.
- Pause when available points approach floor.
- Prefer bulk operations to avoid continuous page crawling.

## Workflow: Export All Products

1. Build a bulk query selecting only required fields.
2. Run `bulkOperationRunQuery`.
3. Poll `currentBulkOperation` until `COMPLETED`.
4. Download JSONL and stream-parse records.
5. Persist checkpoint with operation ID and completion time.

## Workflow: Bulk Update Metafields

1. Ensure metafield definitions exist.
2. Generate JSONL payload keyed by owner IDs.
3. Create staged upload target and upload JSONL.
4. Run `bulkOperationRunMutation`.
5. Parse completion results and retry only failed rows.

## Workflow: Sync Inventory

1. Pull source-of-truth quantities from ERP/WMS.
2. Map SKUs to Shopify inventory item IDs.
3. Group changes by location.
4. Apply `inventorySetOnHandQuantities` or delta adjust mutation.
5. Record audit event with source batch ID.

## Gotchas

1. `userErrors` often contains actionable failures even when HTTP status is 200.
2. Query cost spikes quickly when selecting deep nested relationships.
3. Cursor pagination can miss updates without deterministic sort + checkpointing.
4. Bulk operations are async and single-operation constraints can block new runs.
5. Product and variant ID confusion is a common cause of mutation errors.
6. Metafield writes fail when type/value mismatch is subtle (for example list encoding).
7. Treat B2B account models as relational entities, not just customer tags.
