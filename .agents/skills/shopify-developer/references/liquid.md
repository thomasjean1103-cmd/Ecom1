# Liquid Reference

## Table of Contents
- [What You Can / Can't Do](#what-you-can--cant-do)
- [Core Objects](#core-objects)
- [Essential Filters](#essential-filters)
- [Tags Reference](#tags-reference)
- [Render vs Include](#render-vs-include)
- [Performance Patterns](#performance-patterns)
- [Metafields and Metaobjects Access](#metafields-and-metaobjects-access)
- [Translation and Localization](#translation-and-localization)
- [Pagination](#pagination)
- [B2B Liquid Patterns](#b2b-liquid-patterns)
- [Gotchas](#gotchas)

## What You Can / Can't Do

### You can
- Build fully dynamic themes with sections, blocks, and global objects.
- Render metafields/metaobjects in templates with robust fallbacks.
- Optimize rendering through bounded loops and filtered collections.
- Localize content using translation keys and locale-aware patterns.

### You can't
- Treat Liquid as an unrestricted programming runtime.
- Depend on direct object mutation across `render` boundaries.
- Ignore loop complexity and expect stable performance.
- Assume all metafields can be printed directly without `.value`.

## Core Objects

| Object | Typical use |
|---|---|
| `product` | Product page details, variants, media, metafields |
| `collection` | Category landing, merchandising and sorting |
| `cart` | Cart summary, line items, totals |
| `customer` | Signed-in state, account behavior, B2B checks |
| `shop` | Global shop metadata and metaobject access |
| `page` | CMS-style static page content |
| `article` | Blog template content and metadata |
| `section` | Section-specific settings and blocks |
| `block` | Block-specific settings within section loops |
| `request` | Request path and locale context |
| `content_for_header` | Inject required Shopify scripts/tags |
| `content_for_layout` | Layout content placeholder |

Basic usage:

```liquid
<h1>{{ product.title }}</h1>
{% if customer %}
  <p>Welcome back, {{ customer.first_name }}</p>
{% endif %}
```

## Essential Filters

### String filters

```liquid
{{ product.title | upcase }}
{{ product.vendor | downcase }}
{{ product.description | strip_html | truncate: 120 }}
```

### Number and money filters

```liquid
{{ product.price | money }}
{{ cart.total_price | money_with_currency }}
{{ 9.876 | round: 2 }}
```

### Array filters

```liquid
{% assign available = collection.products | where: 'available', true %}
{% assign tags = product.tags | uniq | sort %}
```

### URL and media filters

```liquid
{{ product.url | within: collection }}
{{ product.featured_image | image_url: width: 800 }}
{{ product.featured_image | image_tag: loading: 'lazy', alt: product.title }}
```

### Date filters

```liquid
{{ article.published_at | date: '%B %d, %Y' }}
```

### Color/style helpers

```liquid
<div style="--badge-color: {{ product.metafields.custom.badge_color.value }};"></div>
```

## Tags Reference

### Control flow

```liquid
{% if product.available %}
  <span>In stock</span>
{% elsif product.coming_soon %}
  <span>Coming soon</span>
{% else %}
  <span>Out of stock</span>
{% endif %}
```

### Iteration

```liquid
{% for variant in product.variants limit: 10 %}
  <option value="{{ variant.id }}">{{ variant.title }}</option>
{% endfor %}
```

### Variables and capture

```liquid
{% assign subtitle = product.metafields.custom.subtitle.value | default: product.title %}
{% capture heading %}{{ subtitle | escape }}{% endcapture %}
```

### Theme composition tags

```liquid
{% render 'price', product: product %}
{% section 'featured-collection' %}
{% layout none %}
```

## Render vs Include

Prefer `render` for modern themes.

Key difference:
- `render` uses isolated scope and explicit variable passing.
- Legacy `include` leaked scope and made templates harder to reason about.

Example:

```liquid
{% assign badge = product.metafields.custom.badge.value %}
{% render 'product-badge', badge: badge, product: product %}
```

Inside `snippets/product-badge.liquid`:

```liquid
{% if badge %}
  <span class="badge">{{ badge }}</span>
{% endif %}
```

## Performance Patterns

### Bound loops

```liquid
{% for product in collection.products limit: 12 %}
  {% render 'product-card', product: product %}
{% endfor %}
```

### Pre-filter and cache

```liquid
{% assign featured = collection.products | where: 'available', true %}
{% for item in featured limit: 8 %}
  {% render 'product-card', product: item %}
{% endfor %}
```

### Avoid nested expensive loops

Instead of nested loops across all products and all tags, pre-compute tags and compare small arrays.

### Use native filters over manual string manipulation

Prefer built-in filters (`split`, `join`, `replace`, `remove`, `escape`) for readability and speed.

## Metafields and Metaobjects Access

Use full type patterns from `references/metafields-metaobjects.md`.

### Product metafield

```liquid
{{ product.metafields.custom.subtitle.value }}
```

### List metafield

```liquid
{% for item in product.metafields.custom.highlights.value %}
  <li>{{ item }}</li>
{% endfor %}
```

### Metaobject access

```liquid
{% assign author = article.metafields.custom.author.value %}
{% if author %}
  <h4>{{ author.name.value }}</h4>
  <p>{{ author.bio.value }}</p>
{% endif %}
```

### Safe null guards

```liquid
{% assign details = product.metafields.custom.details.value %}
{% if details %}
  {{ details }}
{% endif %}
```

## Translation and Localization

Use locale keys in theme locale files.

```liquid
<h2>{{ 'products.product.description' | t }}</h2>
```

Parameterized translation:

```liquid
{{ 'cart.general.item_count' | t: count: cart.item_count }}
```

Locale-aware rendering checklist:
- Use translation keys for shopper-facing strings.
- Keep money and date formatting filter-based.
- Verify locale JSON contains required keys.

## Pagination

Use `paginate` for collection/blog/search pages.

```liquid
{% paginate collection.products by 24 %}
  <div class="grid">
    {% for product in collection.products %}
      {% render 'product-card', product: product %}
    {% endfor %}
  </div>

  {% if paginate.pages > 1 %}
    <nav class="pagination">
      {% if paginate.previous %}
        <a href="{{ paginate.previous.url }}">Previous</a>
      {% endif %}

      <span>Page {{ paginate.current_page }} of {{ paginate.pages }}</span>

      {% if paginate.next %}
        <a href="{{ paginate.next.url }}">Next</a>
      {% endif %}
    </nav>
  {% endif %}
{% endpaginate %}
```

## B2B Liquid Patterns

Use customer context to branch UI.

```liquid
{% if customer and customer.b2b? %}
  <p>Business account pricing available.</p>
{% endif %}
```

Volume pricing pattern:

```liquid
{% if customer and customer.b2b? and product.selected_or_first_available_variant.volume_pricing_tiers %}
  {% for tier in product.selected_or_first_available_variant.volume_pricing_tiers %}
    <p>{{ tier.minimum_quantity }}+: {{ tier.price | money }}</p>
  {% endfor %}
{% endif %}
```

Company-aware message:

```liquid
{% if customer and customer.b2b? %}
  <p>Need a quote for a larger order? Contact your account manager.</p>
{% endif %}
```

## Gotchas

1. Always use `.value` for metafields in Liquid rendering paths.
2. Missing null checks on reference metafields can break section rendering.
3. Overusing nested loops causes severe render cost on large catalogs.
4. `render` scope isolation means parent assigns are not implicitly writable.
5. Do not hardcode translatable copy directly in templates.
6. `settings_data.json` manual edits are fragile and frequently overwritten.
7. Pagination and filtering order can produce unexpected product counts if misapplied.
