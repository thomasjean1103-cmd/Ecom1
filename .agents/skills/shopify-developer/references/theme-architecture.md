# Theme Architecture (Online Store 2.0)

## Table of Contents
- [What You Can / Can't Do](#what-you-can--cant-do)
- [Directory Structure](#directory-structure)
- [JSON Templates](#json-templates)
- [Section Anatomy](#section-anatomy)
- [Section Setting Types](#section-setting-types)
- [Blocks](#blocks)
- [Presets](#presets)
- [Section Groups](#section-groups)
- [App Blocks and Theme App Embeds](#app-blocks-and-theme-app-embeds)
- [Theme Settings Files](#theme-settings-files)
- [CLI Workflow](#cli-workflow)
- [Gotchas](#gotchas)

## What You Can / Can't Do

### You can
- Build modular themes with JSON templates + dynamic sections.
- Configure merchant-editable settings and blocks with schema.
- Add app extension points via app blocks and theme app embeds.
- Use CLI flows for safe draft-first deployment.

### You can't
- Depend on legacy section-per-template assumptions from older themes.
- Exceed schema limits without editor instability.
- Treat `settings_data.json` as a stable manually-edited source file.
- Skip `shopify_attributes` on blocks and still expect editor controls.

## Directory Structure

Typical OS 2.0 theme layout:

| Folder | Purpose |
|---|---|
| `layout/` | Global layout files (`theme.liquid`) |
| `templates/` | JSON or Liquid templates by resource |
| `sections/` | Reusable sections with schema |
| `snippets/` | Reusable partial templates |
| `assets/` | CSS/JS/images/static assets |
| `config/` | Theme settings schema and data |
| `locales/` | Translation files (`*.json`) |

## JSON Templates

Templates define which sections render and in what order.

Example `templates/product.json`:

```json
{
  "sections": {
    "main": {
      "type": "main-product",
      "settings": {
        "show_vendor": true
      }
    },
    "related": {
      "type": "related-products",
      "settings": {
        "heading": "You may also like"
      }
    }
  },
  "order": ["main", "related"]
}
```

Common template types:
- `index`
- `product`
- `collection`
- `page`
- `article`
- `blog`
- `search`
- `cart`

Alternate template example:
- `templates/product.wholesale.json`

## Section Anatomy

A section includes markup plus a `{% schema %}` block.

```liquid
<section class="feature-grid">
  {% if section.settings.heading != blank %}
    <h2>{{ section.settings.heading }}</h2>
  {% endif %}

  <div class="feature-grid__items">
    {% for block in section.blocks %}
      <article {{ block.shopify_attributes }}>
        <h3>{{ block.settings.title }}</h3>
        <p>{{ block.settings.body }}</p>
      </article>
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Feature grid",
  "tag": "section",
  "class": "section-feature-grid",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading" }
  ],
  "blocks": [
    {
      "type": "feature",
      "name": "Feature",
      "settings": [
        { "type": "text", "id": "title", "label": "Title" },
        { "type": "textarea", "id": "body", "label": "Body" }
      ]
    }
  ],
  "max_blocks": 8,
  "presets": [{ "name": "Feature grid" }]
}
{% endschema %}
```

Schema keys most frequently used:
- `name`
- `tag`
- `class`
- `settings`
- `blocks`
- `presets`
- `enabled_on`
- `disabled_on`

## Section Setting Types

Compact type table for common settings.

| Type | Usage | Access in Liquid |
|---|---|---|
| `text` | Single-line text | `section.settings.id` |
| `textarea` | Multi-line text | `section.settings.id` |
| `richtext` | Formatted text | `section.settings.id` |
| `inline_richtext` | Compact rich text | `section.settings.id` |
| `number` | Numeric setting | `section.settings.id` |
| `range` | Slider numeric value | `section.settings.id` |
| `checkbox` | Boolean toggle | `section.settings.id` |
| `select` | Single option | `section.settings.id` |
| `radio` | Single choice | `section.settings.id` |
| `color` | Color picker | `section.settings.id` |
| `color_background` | Background color token | `section.settings.id` |
| `color_scheme` | Theme color scheme | `section.settings.id` |
| `font_picker` | Font setting | `section.settings.id` |
| `image_picker` | Image asset | `section.settings.id` |
| `video` | Hosted video resource | `section.settings.id` |
| `video_url` | External video link | `section.settings.id` |
| `product` | Product reference | `section.settings.id` |
| `product_list` | Product references array | `section.settings.id` |
| `collection` | Collection reference | `section.settings.id` |
| `collection_list` | Collection references array | `section.settings.id` |
| `page` | Page reference | `section.settings.id` |
| `blog` | Blog reference | `section.settings.id` |
| `article` | Article reference | `section.settings.id` |
| `url` | URL input | `section.settings.id` |
| `link_list` | Navigation menu | `section.settings.id` |
| `liquid` | Merchant-authored Liquid | `section.settings.id` |
| `header` | Editor grouping label | no value |
| `paragraph` | Editor helper text | no value |

## Blocks

Blocks provide repeatable content units inside a section.

Implementation rules:
- Use `{{ block.shopify_attributes }}` on the top-level block wrapper.
- Keep block schema minimal and specific.
- Respect `max_blocks` for predictable layout.

Block loop pattern:

```liquid
{% for block in section.blocks %}
  <div class="item" {{ block.shopify_attributes }}>
    {{ block.settings.title }}
  </div>
{% endfor %}
```

## Presets

Presets make sections discoverable in Theme Editor and can pre-seed block structure.

Preset with default blocks:

```json
"presets": [
  {
    "name": "Testimonials",
    "blocks": [
      { "type": "quote" },
      { "type": "quote" }
    ]
  }
]
```

Use presets when sections are intended for merchant insertion.

## Section Groups

Section groups package global areas like header and footer.

Common groups:
- `header-group`
- `footer-group`
- custom groups for specialized layouts

Use groups to keep global layout regions consistent across templates.

## App Blocks and Theme App Embeds

### App blocks

Add app extension points in section schema:

```json
"blocks": [
  { "type": "@app" }
]
```

### Theme app embeds

Use app embed toggles for global scripts/widgets that should be merchant-controlled.

Guidance:
- Keep embed code idempotent.
- Avoid duplicate script injection.
- Verify app block rendering in editor and storefront.

## Theme Settings Files

`config/settings_schema.json`:
- Defines global theme settings structure.

`config/settings_data.json`:
- Stores merchant-selected values.
- Do not hand-edit unless absolutely required for recovery workflows.

## CLI Workflow

Use draft-first, incremental pushes.

```bash
# Pull live theme to local
shopify theme pull --theme ${LIVE_THEME_ID}

# Start local dev server
shopify theme dev --theme ${DRAFT_THEME_ID}

# Push all changes to draft
shopify theme push --theme ${DRAFT_THEME_ID}

# Push selected files
shopify theme push --theme ${DRAFT_THEME_ID} --only sections/hero.liquid --only assets/theme.css

# Publish live only after QA
shopify theme push --theme ${LIVE_THEME_ID} --allow-live
```

Environment guidance:
- Use separate theme IDs for dev/stage/live.
- Never test risky structural changes directly on live theme.

## Gotchas

1. Missing `shopify_attributes` breaks section/block editor interactions.
2. Preset omissions make valid sections hard to add from editor UI.
3. Overly broad section schema settings make merchant UX noisy.
4. `settings_data.json` conflicts are frequent when multiple people edit the theme.
5. Large section loops without limits create slow collection/product pages.
6. App blocks need graceful fallback if app is uninstalled.
7. Alternate template naming mismatches can silently fall back to default templates.
