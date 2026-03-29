# Storefront API

## Table of Contents
- [What You Can / Can't Do](#what-you-can--cant-do)
- [Authentication and Token Modes](#authentication-and-token-modes)
- [Product Query Patterns](#product-query-patterns)
- [Collection Query Patterns](#collection-query-patterns)
- [Cart Operations](#cart-operations)
- [Customer Account API Patterns](#customer-account-api-patterns)
- [B2B Patterns](#b2b-patterns)
- [Markets and Localization](#markets-and-localization)
- [Cart AJAX API](#cart-ajax-api)
- [Rate Limit Guidance](#rate-limit-guidance)
- [Gotchas](#gotchas)

## What You Can / Can't Do

### You can
- Build product/collection discovery and merchandising with GraphQL.
- Create and mutate carts server-side or client-side.
- Query localized data with context directives.
- Pair Storefront API with Customer Account API for logged-in experiences.

### You can't
- Treat Storefront access tokens like Admin tokens.
- Assume every Admin-only field exists in Storefront schema.
- Ignore regional context and expect localized prices automatically.
- Skip buyer identity updates if tax/shipping accuracy is required.

## Authentication and Token Modes

Endpoint:

```bash
https://${SHOP}.myshopify.com/api/${API_VERSION}/graphql.json
```

Required header:

```bash
X-Shopify-Storefront-Access-Token: ${SHOPIFY_STOREFRONT_TOKEN}
Content-Type: application/json
```

Token patterns:
- Public token: Used in browser client flows where scope is constrained.
- Private token: Use from trusted server when stronger control is required.

CORS guidance:
- Browser calls must respect the shop origin policy.
- Prefer server-side proxy for secrets and sensitive enrichment.

## Product Query Patterns

### Product by handle with variants/images/metafields

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Storefront-Access-Token: ${SHOPIFY_STOREFRONT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query ProductByHandle($handle: String!, $identifiers: [HasMetafieldsIdentifier!]!) { product(handle: $handle) { id title handle descriptionHtml images(first: 10) { nodes { url altText width height } } variants(first: 20) { nodes { id title availableForSale quantityAvailable price { amount currencyCode } selectedOptions { name value } } } metafields(identifiers: $identifiers) { namespace key type value } } }",
    "variables": {
      "handle": "focus-journal",
      "identifiers": [
        { "namespace": "custom", "key": "subtitle" },
        { "namespace": "custom", "key": "highlights" }
      ]
    }
  }'
```

### Product recommendations

```graphql
query ProductRecommendations($productId: ID!) {
  productRecommendations(productId: $productId) {
    id
    handle
    title
  }
}
```

### Predictive search

```graphql
query PredictiveSearch($query: String!) {
  predictiveSearch(query: $query, limit: 10) {
    products {
      id
      title
      handle
    }
    collections {
      id
      title
      handle
    }
    pages {
      id
      title
      handle
    }
  }
}
```

## Collection Query Patterns

### Collection by handle with paginated products

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Storefront-Access-Token: ${SHOPIFY_STOREFRONT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query CollectionByHandle($handle: String!, $first: Int!, $after: String) { collection(handle: $handle) { id title handle products(first: $first, after: $after, sortKey: BEST_SELLING) { edges { cursor node { id title handle featuredImage { url altText } priceRange { minVariantPrice { amount currencyCode } } } } pageInfo { hasNextPage endCursor } } } }",
    "variables": {
      "handle": "journals",
      "first": 24,
      "after": null
    }
  }'
```

### List collections

```graphql
query Collections($first: Int!, $after: String) {
  collections(first: $first, after: $after) {
    edges {
      cursor
      node {
        id
        handle
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

## Cart Operations

### Create cart

```graphql
mutation CartCreate($input: CartInput) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
      totalQuantity
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
    "lines": [
      {
        "merchandiseId": "gid://shopify/ProductVariant/111111111",
        "quantity": 1
      }
    ]
  }
}
```

### Add lines

```graphql
mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
      totalQuantity
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

### Update lines

```graphql
mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) {
    cart {
      id
      totalQuantity
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

### Remove lines

```graphql
mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
    cart {
      id
      totalQuantity
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

### Apply discount code

```graphql
mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
  cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
    cart {
      id
      discountCodes {
        code
        applicable
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

### Set buyer identity

```graphql
mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
  cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
    cart {
      id
      buyerIdentity {
        email
        countryCode
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

### Query cart

```graphql
query Cart($id: ID!) {
  cart(id: $id) {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            product {
              title
              handle
            }
          }
        }
      }
    }
  }
}
```

## Customer Account API Patterns

Use customer-account-authenticated queries for profile/order/address flows.

Common flows:
1. Retrieve authenticated customer profile.
2. Fetch order history and pagination.
3. Create/update/delete customer addresses.
4. Reconcile identity data with cart buyer identity.

Treat account API tokens separately from Storefront tokens.

## B2B Patterns

Use B2B-specific logic for negotiated pricing and company purchasing behavior.

Typical implementation:
1. Detect company account context on sign-in.
2. Resolve customer-specific catalog or pricing.
3. Show volume pricing and purchasing rules.
4. Use draft order fallback for assisted ordering.

## Markets and Localization

Use `@inContext` to localize language/country/currency in queries.

```graphql
query LocalizedProduct($handle: String!) @inContext(country: US, language: EN) {
  product(handle: $handle) {
    id
    title
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
}
```

Localization checklist:
- Set market-aware country code.
- Keep currency formatting consistent across UI.
- Validate shipping/tax behavior after buyer identity updates.

## Cart AJAX API

When working in Online Store themes, cart endpoints are still useful for lightweight interactions.

### Add item

```javascript
await fetch('/cart/add.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items: [{ id: 111111111, quantity: 1 }] })
});
```

### Update cart

```javascript
await fetch('/cart/update.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ updates: { '111111111': 2 } })
});
```

### Change one line

```javascript
await fetch('/cart/change.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ line: 1, quantity: 0 })
});
```

### Fetch cart state

```javascript
const cart = await fetch('/cart.js').then((r) => r.json());
```

## Rate Limit Guidance

Do not duplicate rate constants here. Use `references/platform-limits.md` as the source of truth.

Practical guardrails:
- Limit field selection for collection pages.
- Defer non-critical data to lazy secondary requests.
- Cache market-aware product payloads where allowed.
- De-duplicate cart mutation calls in rapid UI interactions.

## Gotchas

1. Admin-only fields and mutations are not available in Storefront API.
2. Buyer identity must be set correctly for regional tax/shipping behavior.
3. Cart IDs are opaque and should be stored/retrieved safely.
4. Rapid cart mutations can race; serialize writes client-side.
5. Predictive search result shapes vary by configured content sources.
6. Localization errors often come from missing `@inContext` alignment with market config.
7. Customer account auth and storefront token auth are separate concerns.
