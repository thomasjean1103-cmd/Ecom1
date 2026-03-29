# Webhooks and Events

## Table of Contents
- [What You Can / Can't Do](#what-you-can--cant-do)
- [Webhook Subscription Setup](#webhook-subscription-setup)
- [Webhook Topics by Category](#webhook-topics-by-category)
- [Mandatory Compliance Webhooks](#mandatory-compliance-webhooks)
- [Payload Headers](#payload-headers)
- [Signature Verification](#signature-verification)
- [Delivery Methods](#delivery-methods)
- [Retry Behavior and Idempotency](#retry-behavior-and-idempotency)
- [Operational Playbook](#operational-playbook)
- [Gotchas](#gotchas)

## What You Can / Can't Do

### You can
- Subscribe to resource lifecycle events via Admin API.
- Deliver events to HTTPS, EventBridge, or Pub/Sub.
- Verify webhook signatures with HMAC before processing.
- Build reliable idempotent processors with retry handling.

### You can't
- Trust incoming payloads without signature verification.
- Assume at-most-once delivery semantics.
- Process webhook writes without idempotency guards.
- Skip mandatory privacy/compliance topics for public apps.

## Webhook Subscription Setup

Create subscriptions through Admin GraphQL:

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CreateWebhook($topic: WebhookSubscriptionTopic!, $input: WebhookSubscriptionInput!) { webhookSubscriptionCreate(topic: $topic, webhookSubscription: $input) { webhookSubscription { id topic endpoint { __typename ... on WebhookHttpEndpoint { callbackUrl } } format } userErrors { field message } } }",
    "variables": {
      "topic": "ORDERS_CREATE",
      "input": {
        "callbackUrl": "https://example.com/webhooks/shopify/orders-create",
        "format": "JSON"
      }
    }
  }'
```

List existing subscriptions:

```graphql
query WebhookSubscriptions($first: Int!) {
  webhookSubscriptions(first: $first) {
    edges {
      node {
        id
        topic
        format
        endpoint {
          __typename
        }
      }
    }
  }
}
```

## Webhook Topics by Category

Representative topic map (not exhaustive):

| Category | Example topics |
|---|---|
| Products | `PRODUCTS_CREATE`, `PRODUCTS_UPDATE`, `PRODUCTS_DELETE` |
| Orders | `ORDERS_CREATE`, `ORDERS_UPDATED`, `ORDERS_CANCELLED`, `ORDERS_PAID` |
| Customers | `CUSTOMERS_CREATE`, `CUSTOMERS_UPDATE`, `CUSTOMERS_DELETE` |
| Carts | `CARTS_CREATE`, `CARTS_UPDATE` |
| Checkout | `CHECKOUTS_CREATE`, `CHECKOUTS_UPDATE`, `CHECKOUTS_DELETE` |
| Inventory | `INVENTORY_LEVELS_UPDATE`, `INVENTORY_ITEMS_CREATE`, `INVENTORY_ITEMS_UPDATE` |
| Fulfillment | `FULFILLMENTS_CREATE`, `FULFILLMENTS_UPDATE` |
| Refund | `REFUNDS_CREATE` |
| Theme | `THEMES_CREATE`, `THEMES_PUBLISH`, `THEMES_DELETE` |
| App | `APP_UNINSTALLED`, app-scoped events |
| Shop | `SHOP_UPDATE` |

Use exact enum/topic names from current Admin API docs for implementation.

## Mandatory Compliance Webhooks

For public app compliance, include:
- `CUSTOMERS_DATA_REQUEST`
- `CUSTOMERS_REDACT`
- `SHOP_REDACT`

Handle these with strict privacy workflows and auditable response logs.

## Payload Headers

Read and validate webhook metadata from headers:

- `X-Shopify-Topic`
- `X-Shopify-Hmac-SHA256`
- `X-Shopify-Shop-Domain`
- `X-Shopify-API-Version`
- `X-Shopify-Webhook-Id`

Store `X-Shopify-Webhook-Id` for deduplication.

## Signature Verification

Node.js HMAC verification example:

```js
import crypto from 'crypto';

export function verifyShopifyHmac(rawBody, headerHmac, secret) {
  const digest = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  const safeA = Buffer.from(digest);
  const safeB = Buffer.from(headerHmac || '');

  if (safeA.length !== safeB.length) return false;
  return crypto.timingSafeEqual(safeA, safeB);
}
```

Processing rule:
1. Read raw body bytes exactly as received.
2. Compute HMAC with app secret.
3. Timing-safe compare against header.
4. Reject unauthorized requests before parsing payload.

## Delivery Methods

| Method | Best for |
|---|---|
| HTTPS | Standard app servers and low-latency handlers |
| Amazon EventBridge | Event-driven AWS pipelines |
| Google Pub/Sub | GCP event pipelines and fanout |

Choose delivery based on scaling and infra model.

## Retry Behavior and Idempotency

Operational expectation:
- Retries can occur repeatedly across a multi-hour window.
- Plan for up to 19 attempts over ~48 hours.

Idempotency pattern:
1. Use `X-Shopify-Webhook-Id` as idempotency key.
2. Insert key into durable store with unique constraint.
3. If duplicate key, return success without reprocessing.
4. Process downstream side effects only once.

## Operational Playbook

1. Verify signature.
2. Persist event envelope and idempotency key.
3. Ack quickly (`2xx`) and hand off to async worker.
4. Process business logic in retry-safe unit of work.
5. Monitor dead-letter and repeated failure metrics.

Observability fields to log:
- Topic
- Shop domain
- API version
- Webhook ID
- Delivery timestamp
- Processing result

## Gotchas

1. Parsing JSON before signature validation can introduce security risk.
2. Missing raw-body middleware setup breaks HMAC verification.
3. Duplicate deliveries are expected; idempotency is mandatory.
4. Slow synchronous processing increases retry volume.
5. Compliance webhook handling should be audited and tested regularly.
6. Topic names may vary by API version; pin and validate.
7. API version header can differ from your app default versioning assumptions.
