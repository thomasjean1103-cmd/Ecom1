# Shopify Functions

## Table of Contents
- [What You Can / Can't Do](#what-you-can--cant-do)
- [Function Types](#function-types)
- [Project Setup](#project-setup)
- [Input Query Pattern](#input-query-pattern)
- [Implementation Examples](#implementation-examples)
- [Testing and Tooling](#testing-and-tooling)
- [Performance Constraints](#performance-constraints)
- [Scripts to Functions Migration](#scripts-to-functions-migration)
- [Gotchas](#gotchas)

## What You Can / Can't Do

### You can
- Execute deterministic checkout/business logic in Shopify-managed runtime.
- Implement discount, delivery, payment, validation, and cart transform behavior.
- Use typed input queries and constrained output operations.
- Test functions locally before deployment.

### You can't
- Perform network calls or filesystem I/O inside function runtime.
- Assume unlimited compute/memory/runtime budget.
- Port Script Editor code directly without model changes.
- Use functions as generic app backend code.

## Function Types

| Function type | Typical use | Plus-only considerations |
|---|---|---|
| Product discount | Item-level discount logic | Often widely available |
| Order discount | Order subtotal promotions | Often widely available |
| Delivery customization | Hide/reorder shipping options | Plan/feature dependent |
| Payment customization | Hide/reorder payment methods | Plan/feature dependent |
| Cart transform | Bundles, merge/split line behavior | Advanced use cases |
| Validation | Enforce checkout constraints | Plan/target dependent |
| Fulfillment constraints | Fulfillment routing/limits | Advanced operations |

Check target/store eligibility before implementation.

## Project Setup

Scaffold function extension:

```bash
shopify app generate extension --type function
```

Common structure:

```text
extensions/
  discount-function/
    src/
      run.ts
    run.graphql
    shopify.extension.toml
```

`shopify.extension.toml` contains target selection and build metadata.

## Input Query Pattern

Functions receive only fields requested in `run.graphql`.

Example input query for product discounts:

```graphql
query RunInput {
  cart {
    lines {
      id
      quantity
      merchandise {
        __typename
        ... on ProductVariant {
          id
          product {
            id
            metafield(namespace: "custom", key: "discount_group") {
              value
            }
          }
        }
      }
      cost {
        subtotalAmount {
          amount
        }
      }
    }
    buyerIdentity {
      customer {
        id
        tags
      }
    }
  }
}
```

Keep this query minimal to control runtime overhead.

## Implementation Examples

### Product discount function example

```ts
import type {
  RunInput,
  FunctionRunResult,
  Target,
} from '../generated/api';

const EMPTY_DISCOUNT: FunctionRunResult = {
  operations: [],
};

export function run(input: RunInput): FunctionRunResult {
  const operations = input.cart.lines
    .filter((line) => {
      if (line.merchandise.__typename !== 'ProductVariant') return false;
      const group = line.merchandise.product.metafield?.value;
      return group === 'focus-collection';
    })
    .map((line) => ({
      productDiscountsAdd: {
        candidates: [
          {
            message: 'Focus bundle offer',
            targets: [{ cartLine: { id: line.id } } as Target],
            value: { percentage: { value: '10.0' } },
          },
        ],
        selectionStrategy: 'FIRST',
      },
    }));

  return operations.length ? { operations } : EMPTY_DISCOUNT;
}
```

### Order discount pattern

- Evaluate cart subtotal and customer segment.
- Return one order-level discount candidate.
- Use deterministic thresholds from metafields/config.

### Delivery customization pattern

- Read destination and cart attributes.
- Hide or reorder delivery options using allowed operations.
- Keep logic transparent and explainable for support teams.

### Payment customization pattern

- Read selected shipping/buyer context.
- Hide incompatible payment methods.
- Keep fail-open behavior to avoid blocking checkout unexpectedly.

### Cart transform pattern

- Detect qualifying line-item groups.
- Merge/split lines to represent bundles.
- Preserve tax and price integrity expectations.

### Validation pattern

- Inspect cart for forbidden combinations.
- Return clear validation messages.
- Keep rule logic minimal and deterministic.

## Testing and Tooling

Local run command:

```bash
shopify app function run
```

Type generation:

```bash
shopify app function typegen
```

Unit testing guidance:
1. Build fixtures for edge cart shapes.
2. Test happy path and no-op path.
3. Test plan feature gating conditions.
4. Test conflicting promotions and tie-breaking.

## Performance Constraints

Use `references/platform-limits.md` as authoritative source for limits.

Practical operating constraints:
- Keep runtime logic under strict latency budget.
- Keep memory usage bounded.
- No network access.
- No filesystem access.
- Keep input query small and targeted.

## Scripts to Functions Migration

### Key differences

| Scripts model | Functions model |
|---|---|
| Ruby runtime | WASM/typed function runtime |
| Implicit object graph | Explicit input query |
| Broader legacy checkout coupling | Explicit extension targets |
| Looser execution expectations | Tight runtime constraints |

### Migration sequence

1. Inventory existing script logic and business rules.
2. Map each rule to a specific function target.
3. Build function with equivalent deterministic behavior.
4. Run side-by-side validation in development store.
5. Roll out incrementally with monitoring.

### Timeline reminder

Scripts sunset planning should target completion before June 2026.

## Gotchas

1. Missing fields in `run.graphql` means they are unavailable at runtime.
2. Complex rule engines often exceed runtime expectations.
3. Function outputs must match allowed operation schemas exactly.
4. Silent no-op behavior can occur if target/type mismatches configuration.
5. Discount stacking behavior depends on broader shop discount configuration.
6. Scripts migration failures usually come from implicit assumptions not encoded in input query.
7. Unit tests should include empty and malformed cart fixtures.
