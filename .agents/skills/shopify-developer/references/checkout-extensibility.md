# Checkout Extensibility

## Table of Contents
- [What You Can / Can't Do](#what-you-can--cant-do)
- [Migration Timeline](#migration-timeline)
- [Checkout UI Extensions](#checkout-ui-extensions)
- [Setup Workflow](#setup-workflow)
- [UI Components](#ui-components)
- [Hooks and APIs](#hooks-and-apis)
- [Example: Custom Field Extension](#example-custom-field-extension)
- [Example: Order Status Extension](#example-order-status-extension)
- [Web Pixels](#web-pixels)
- [Post-Purchase Extensions](#post-purchase-extensions)
- [Relationship to Shopify Functions](#relationship-to-shopify-functions)
- [Gotchas](#gotchas)

## What You Can / Can't Do

### You can
- Build checkout UI with extension targets and approved components/hooks.
- Add custom interactions and validations in buyer journey flow.
- Instrument checkout events through Web Pixels.
- Extend post-purchase and order status surfaces.

### You can't
- Use legacy `checkout.liquid` as a long-term customization strategy.
- Use arbitrary DOM injection patterns outside extension APIs.
- Depend on Script Editor for new discount/payment logic.
- Ignore migration timelines and still expect stable behavior.

## Migration Timeline

| Date | Milestone | Action |
|---|---|---|
| August 2025 | Plus checkout migration pressure window | Complete Plus migration to extensions/functions |
| April 2026 | Idempotency and retry expectations mature | Implement idempotent write-side integrations |
| June 2026 | Scripts sunset | Migrate Script Editor logic to Shopify Functions |
| August 2026 | Legacy checkout customization retirement (all stores) | Remove remaining `checkout.liquid` customizations |

## Checkout UI Extensions

Use extension targets to place UI at specific checkout surfaces.

### Common targets

| Target | Typical use case |
|---|---|
| `purchase.checkout.block.render` | Generic block in checkout flow |
| `purchase.checkout.delivery-address.render-before` | Pre-address helper content |
| `purchase.checkout.delivery-address.render-after` | Post-address notes/validation messages |
| `purchase.checkout.shipping-option-list.render-after` | Shipping option hints |
| `purchase.checkout.payment-method-list.render-after` | Payment explanation and trust elements |
| `purchase.checkout.contact.render-after` | Contact field context |
| `purchase.checkout.cart-line-item.render-after` | Per-item metadata messaging |
| `purchase.checkout.actions.render-before` | Pre-submit reminders |
| `purchase.checkout.actions.render-after` | Action-adjacent guidance |
| `purchase.thank-you.block.render` | Thank-you page modules |
| `customer-account.order-status.block.render` | Order status page blocks |
| `customer-account.profile.block.render` | Account profile enhancements |
| `customer-account.addresses.block.render` | Account address helpers |
| `customer-account.orders.block.render` | Order history info |
| `customer-account.order-index.block.render` | Order listing augmentations |

## Setup Workflow

1. Scaffold extension:

```bash
shopify app generate extension --type checkout_ui_extension
```

2. Configure `shopify.extension.toml` with target and capabilities.
3. Build local preview and test checkout flow in development store.
4. Ship through app deployment pipeline.

Minimal config sketch:

```toml
name = "checkout-custom-field"
type = "checkout_ui_extension"

[[extensions.targeting]]
module = "./src/Checkout.jsx"
target = "purchase.checkout.block.render"
```

## UI Components

Common components you can compose:
- `BlockStack`
- `InlineStack`
- `Text`
- `Button`
- `Banner`
- `Divider`
- `Image`
- `TextField`
- `Select`
- `Checkbox`

Pattern:
- Keep UI minimal and contextual.
- Prefer concise copy with clear recovery actions.

## Hooks and APIs

Frequently used hooks:
- `useApplyDiscountCodeChange`
- `useCartLines`
- `useShippingAddress`
- `useBuyerJourneyIntercept`

Use hooks to read checkout state and apply constrained updates.

## Example: Custom Field Extension

```tsx
import {
  reactExtension,
  BlockStack,
  Text,
  TextField,
  useBuyerJourneyIntercept,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension('purchase.checkout.block.render', () => <Extension />);

function Extension() {
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    if (!canBlockProgress) return { behavior: 'allow' };
    return { behavior: 'allow' };
  });

  return (
    <BlockStack spacing="loose">
      <Text emphasis="bold">Order notes for fulfillment</Text>
      <TextField label="Delivery instructions" name="delivery_instructions" />
    </BlockStack>
  );
}
```

## Example: Order Status Extension

```tsx
import {
  reactExtension,
  Banner,
  Text,
} from '@shopify/ui-extensions-react/customer-account';

export default reactExtension('customer-account.order-status.block.render', () => (
  <Banner status="info">
    <Text>Need to modify your order? Contact support within 2 hours.</Text>
  </Banner>
));
```

## Web Pixels

Web Pixels provide event-based instrumentation.

Types:
- Standard events
- Custom events

Common event usage:
- Track checkout step progression.
- Track payment attempt and completion.
- Track post-purchase upsell interactions.

GA4 mapping example outline:
1. Listen for checkout-related pixel events.
2. Normalize payload into GA4 schema (`begin_checkout`, `add_shipping_info`, `purchase`).
3. Send through your analytics transport layer with consent handling.

## Post-Purchase Extensions

Use `ShouldRender` + `Render` pattern for controlled post-purchase experiences.

Flow:
1. Evaluate eligibility in `ShouldRender`.
2. If eligible, render offer UI in `Render` target.
3. Handle acceptance/rejection with idempotent backend actions.

Keep post-purchase actions deterministic and safe for retries.

## Relationship to Shopify Functions

Use checkout extensions for UI/interaction.
Use Shopify Functions for pricing, discount, shipping, and payment logic.

Reference: `references/shopify-functions.md`

## Gotchas

1. Extension targets differ by surface; target mismatch silently prevents render.
2. Keep hook usage compatible with target capabilities.
3. Scripts logic cannot be copied 1:1 into extension UI code.
4. Buyer-journey blocking should be minimal and justified.
5. Analytics events must respect consent and regional compliance.
6. Post-purchase offers require idempotent backend handling.
7. Migration plans often fail when UI and logic migration are not separated.
