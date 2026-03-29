# Metafields and Metaobjects

## Table of Contents
- [What You Can / Can't Do](#what-you-can--cant-do)
- [Metafield Type Reference](#metafield-type-reference)
- [Definitions Workflow (Admin API)](#definitions-workflow-admin-api)
- [Metafield Value CRUD (Admin API)](#metafield-value-crud-admin-api)
- [Liquid Access Patterns](#liquid-access-patterns)
- [Storefront API Access Patterns](#storefront-api-access-patterns)
- [Metaobjects Overview](#metaobjects-overview)
- [Metaobject CRUD (Admin API)](#metaobject-crud-admin-api)
- [Metaobjects in Liquid and Storefront](#metaobjects-in-liquid-and-storefront)
- [Common Data Modeling Patterns](#common-data-modeling-patterns)
- [Constraints](#constraints)
- [Gotchas](#gotchas)

## What You Can / Can't Do

### You can
- Define reusable metafield definitions and enforce type consistency.
- Access metafields in Admin API, Storefront API, and Liquid.
- Model structured reusable content with metaobject definitions + entries.
- Pin and organize metafields for merchant-facing editing.

### You can't
- Assume raw Liquid metafield objects are always printable without `.value`.
- Rely on ad-hoc list metafields without definitions.
- Exceed namespace/key/value limits from `platform-limits.md`.
- Treat metaobjects as a drop-in replacement for every relational need.

## Metafield Type Reference

Use this as a practical quick map for implementation.

| Type | Stored as | Typical Liquid usage | Notes |
|---|---|---|---|
| `single_line_text_field` | string | `{{ mf.value }}` | General text |
| `multi_line_text_field` | string | `{{ mf.value }}` | Paragraph copy |
| `rich_text_field` | rich text JSON | `{{ mf.value | metafield_tag }}` | Prefer metafield rendering helpers |
| `number_integer` | number | `{{ mf.value }}` | Integer-only |
| `number_decimal` | decimal string | `{{ mf.value }}` | Currency/measure inputs |
| `boolean` | bool | `{% if mf.value %}` | Avoid string compares |
| `date` | date string | `{{ mf.value | date: '%Y-%m-%d' }}` | ISO input |
| `date_time` | datetime string | `{{ mf.value | date: '%b %d, %Y' }}` | Timezone awareness required |
| `url` | URL string | `<a href="{{ mf.value }}">` | Sanitize for output context |
| `json` | JSON string | `{{ mf.value | json }}` | Parse as needed in JS |
| `color` | hex string | `style="--swatch: {{ mf.value }}"` | Theme settings alternative |
| `weight` | structured | `{{ mf.value }}` | Use with localization |
| `volume` | structured | `{{ mf.value }}` | Unit-specific display |
| `dimension` | structured | `{{ mf.value }}` | Height/width/depth |
| `rating` | structured | `{{ mf.value }}` | Often app-defined |
| `money` | decimal + currency context | `{{ mf.value | money }}` | Currency context critical |
| `file_reference` | GID | `{{ mf.value | file_url }}` | Ensure file exists |
| `product_reference` | product GID | `{{ mf.value.title }}` | Null-check required |
| `variant_reference` | variant GID | `{{ mf.value.title }}` | Often for upsells |
| `collection_reference` | collection GID | `{{ mf.value.title }}` | Content linking |
| `page_reference` | page GID | `{{ mf.value.title }}` | CMS-like content links |
| `metaobject_reference` | metaobject GID | `{{ mf.value.some_field.value }}` | Structured content reuse |
| `list.*` variants | array | `{% for item in mf.value %}` | Definition required first |

## Definitions Workflow (Admin API)

Always create definitions before writing values at scale.

### 1) Create metafield definition

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CreateDefinition($definition: MetafieldDefinitionInput!) { metafieldDefinitionCreate(definition: $definition) { createdDefinition { id name namespace key type ownerType } userErrors { field message code } } }",
    "variables": {
      "definition": {
        "name": "Subtitle",
        "namespace": "custom",
        "key": "subtitle",
        "type": "single_line_text_field",
        "ownerType": "PRODUCT"
      }
    }
  }'
```

### 2) Query definitions

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query ProductDefinitions($first: Int!) { metafieldDefinitions(first: $first, ownerType: PRODUCT) { nodes { id name namespace key type pinnedPosition } } }",
    "variables": { "first": 50 }
  }'
```

### 3) Pin definition

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation PinDefinition($definitionId: ID!) { metafieldDefinitionPin(definitionId: $definitionId) { pinnedDefinition { id pinnedPosition } userErrors { field message } } }",
    "variables": { "definitionId": "gid://shopify/MetafieldDefinition/123456789" }
  }'
```

## Metafield Value CRUD (Admin API)

### Set values (`metafieldsSet`)

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation SetMetafields($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { metafields { id namespace key type value owner { ... on Product { id title } } } userErrors { field message code } } }",
    "variables": {
      "metafields": [
        {
          "ownerId": "gid://shopify/Product/123456789",
          "namespace": "custom",
          "key": "subtitle",
          "type": "single_line_text_field",
          "value": "Built for focused deep work"
        }
      ]
    }
  }'
```

### Delete values (`metafieldsDelete`)

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation DeleteMetafields($metafields: [MetafieldIdentifierInput!]!) { metafieldsDelete(metafields: $metafields) { deletedMetafields { key namespace ownerId } userErrors { field message code } } }",
    "variables": {
      "metafields": [
        {
          "ownerId": "gid://shopify/Product/123456789",
          "namespace": "custom",
          "key": "subtitle"
        }
      ]
    }
  }'
```

## Liquid Access Patterns

### Basic access

```liquid
{{ product.metafields.custom.subtitle.value }}
```

### Safe defaults

```liquid
{{ product.metafields.custom.subtitle.value | default: 'Default subtitle' }}
```

### List metafield iteration

```liquid
{% assign highlights = product.metafields.custom.highlights.value %}
{% if highlights and highlights.size > 0 %}
  <ul>
    {% for item in highlights limit: 6 %}
      <li>{{ item }}</li>
    {% endfor %}
  </ul>
{% endif %}
```

### JSON metafield

```liquid
{% assign spec_json = product.metafields.custom.spec_sheet.value %}
<script type="application/json" id="product-specs">{{ spec_json | json }}</script>
```

### File reference metafield

```liquid
{% assign guide = product.metafields.custom.size_guide.value %}
{% if guide %}
  <a href="{{ guide | file_url }}">Size guide</a>
{% endif %}
```

### Product reference metafield

```liquid
{% assign paired = product.metafields.custom.paired_product.value %}
{% if paired %}
  <a href="{{ paired.url }}">Pairs with {{ paired.title }}</a>
{% endif %}
```

### Metaobject reference from metafield

```liquid
{% assign author = article.metafields.custom.author.value %}
{% if author %}
  <h4>{{ author.name.value }}</h4>
  <p>{{ author.bio.value }}</p>
{% endif %}
```

## Storefront API Access Patterns

Use `identifiers` when querying by namespace/key.

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Storefront-Access-Token: ${SHOPIFY_STOREFRONT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query ProductWithMetafields($handle: String!, $identifiers: [HasMetafieldsIdentifier!]!) { product(handle: $handle) { id title metafields(identifiers: $identifiers) { namespace key type value } } }",
    "variables": {
      "handle": "daily-planner",
      "identifiers": [
        { "namespace": "custom", "key": "subtitle" },
        { "namespace": "custom", "key": "highlights" }
      ]
    }
  }'
```

Fragment pattern for reuse:

```graphql
fragment ProductMeta on Product {
  metafields(identifiers: $identifiers) {
    namespace
    key
    type
    value
  }
}
```

## Metaobjects Overview

Use metaobjects when content has reusable fields and editorial lifecycle.

Examples:
- Author profiles referenced across blog posts.
- Ingredient/spec entries referenced across many products.
- Badge systems with structured label/icon/priority fields.

## Metaobject CRUD (Admin API)

### Create definition

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) { metaobjectDefinitionCreate(definition: $definition) { metaobjectDefinition { id type name fieldDefinitions { key name type { name } } } userErrors { field message code } } }",
    "variables": {
      "definition": {
        "type": "author",
        "name": "Author",
        "fieldDefinitions": [
          { "name": "Name", "key": "name", "type": "single_line_text_field", "required": true },
          { "name": "Bio", "key": "bio", "type": "multi_line_text_field" },
          { "name": "Headshot", "key": "headshot", "type": "file_reference" }
        ]
      }
    }
  }'
```

### Create entry

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) { metaobjectCreate(metaobject: $metaobject) { metaobject { id handle type fields { key value } } userErrors { field message code } } }",
    "variables": {
      "metaobject": {
        "type": "author",
        "handle": "jane-doe",
        "fields": [
          { "key": "name", "value": "Jane Doe" },
          { "key": "bio", "value": "Writes about focus and planning systems." }
        ]
      }
    }
  }'
```

### Update entry

```bash
curl -sS -X POST \
  "https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation UpdateMetaobject($id: ID!, $metaobject: MetaobjectUpdateInput!) { metaobjectUpdate(id: $id, metaobject: $metaobject) { metaobject { id handle updatedAt } userErrors { field message code } } }",
    "variables": {
      "id": "gid://shopify/Metaobject/123456",
      "metaobject": {
        "fields": [
          { "key": "bio", "value": "Updated editorial bio text." }
        ]
      }
    }
  }'
```

## Metaobjects in Liquid and Storefront

### Liquid global access

```liquid
{% assign testimonials = shop.metaobjects.testimonial.values %}
{% for t in testimonials limit: 5 %}
  <blockquote>
    <p>{{ t.quote.value }}</p>
    <cite>{{ t.author.value }}</cite>
  </blockquote>
{% endfor %}
```

### Storefront query pattern

```graphql
query MetaobjectsByType($type: String!, $first: Int!) {
  metaobjects(type: $type, first: $first) {
    edges {
      node {
        id
        handle
        fields {
          key
          value
        }
      }
    }
  }
}
```

## Common Data Modeling Patterns

### Product specs pattern
1. Create `metaobject` type `spec_item` with `label`, `value`, `unit`.
2. Add product metafield `custom.spec_items` as `list.metaobject_reference`.
3. Render in Liquid with controlled iteration and fallbacks.

### Author bio pattern
1. Create `author` metaobject definition.
2. Add article metafield `custom.author` as `metaobject_reference`.
3. Render author card from `article.metafields.custom.author.value`.

### Badge pattern
1. Create `badge` metaobject with `label`, `tone`, `icon`.
2. Attach list badge references to products or collections.
3. Use Liquid mapping to classes for stable styling.

## Constraints

See `references/platform-limits.md` for canonical values.

Quick checklist:
- Keep namespace <= 20 characters.
- Keep key <= 30 characters.
- Keep value payload <= 512KB.
- Keep total metafields per resource <= 200.
- Create definitions before list metafields.

## Gotchas

1. Liquid metafields typically require `.value`; printing object wrappers can fail silently.
2. `metafieldsDelete` is plural; singular variants are a common migration mistake.
3. List metafields should be definition-backed to avoid editor/runtime mismatch.
4. `type` and `value` must agree in `metafieldsSet`, or `userErrors` returns validation failures.
5. Always parse `userErrors` in mutations; HTTP 200 can still contain operation failures.
6. Null-check reference values before reading nested fields.
7. Metaobject handle uniqueness matters for editorial workflows and lookup patterns.
