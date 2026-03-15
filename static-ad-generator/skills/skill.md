# SKILL.md — Static Ad Generator Pipeline

## Overview

This skill orchestrates a three-phase automated pipeline that takes a brand name + URL and produces 40 production-ready static ad images using Nano Banana 2 (Gemini 3.1 Flash Image) via the FAL AI API.

**Input:** Brand name + brand URL + product images
**Output:** 40 ad images (4 variants each = 160 total), organized in folders

-----

## Folder Structure

```
/static-ad-generator
├── skills/
│   ├── skill.md                    ← This file
│   └── references/
│       └── template-prompts.md     ← The 40 ad templates with placeholders
├── brands/
│   └── {brand-name}/
│       ├── product-images/         ← User drops product photos here (PNG/JPG)
│       ├── brand-dna.md            ← Generated in Phase 1
│       ├── prompts.json            ← Generated in Phase 2
│       ├── generate.py             ← FAL AI generation script
│       └── outputs/                ← Generated images organized by template
│           ├── 01-hero-statement/
│           ├── 02-split-headline/
│           └── ...
└── .env                            ← FAL_KEY stored here
```

-----

## Prerequisites

Before running, the user must have:

1. **FAL AI account** — Sign up at https://fal.ai and get an API key from the dashboard
1. **Product images** — 2-4 clean product photos (PNG or JPG, not AVIF) saved in the brand's `product-images/` folder
1. **Python 3.8+** with `requests` installed (`pip install requests`)
1. **API key stored** — Create a `.env` file at the project root with: `FAL_KEY=your_api_key_here`

-----

## Phase 1 — Brand Research & DNA Generation

### Trigger

User says: "Run Phase 1 for {brand}. The brand URL is {url}. The product is {product description}."

### What to do

1. **Web search** the brand URL and research the following:
- Brand name (exact casing and spelling)
- Brand colors (extract exact hex codes from the website — primary, secondary, accent)
- Typography style (serif, sans-serif, modern, bold — observe the website's font choices)
- Photography style (studio/lifestyle/flat-lay/macro — observe product images on their site)
- Packaging design (colors, shapes, materials, label style)
- Product details (name, key ingredients/features, price, sizes/variants)
- Key claims and benefits (what the brand says about the product)
- Target audience (who the brand targets based on messaging, imagery, tone)
- Brand voice/tone (premium, casual, scientific, playful, etc.)
- Competitor positioning (how they differentiate)
1. **Search for customer reviews** on Trustpilot, Amazon, Reddit to extract:
- 3 real or realistic customer quotes (verbatim language)
- Key stats (rating, number of reviews, satisfaction percentage)
- Common pain points the product solves
- Common objections
1. **Compile everything** into a Brand DNA document with this exact structure:

```markdown
# Brand DNA — {BRAND_NAME}

## Brand Identity
- **Brand Name:** {exact name}
- **Primary Color:** #{hex}
- **Secondary Color:** #{hex}
- **Accent Color:** #{hex}
- **Font Style:** {serif/sans-serif/modern/bold}
- **Photography Style:** {studio/lifestyle/flat-lay/editorial}
- **Brand Voice:** {premium/casual/scientific/playful/authoritative}

## Product Details
- **Product Name:** {exact product name}
- **Price:** {price with currency}
- **Price Barré:** {higher comparison price or original price}
- **Key Ingredient/Component:** {main ingredient or technology}
- **Mechanism:** {how the product works in one sentence}
- **Guarantee:** {guarantee text, e.g. "30-day money-back guarantee"}
- **Time to Result:** {e.g. "in 7 days", "in 2 weeks"}

## Benefits (top 3)
1. {BENEFIT_1 — concrete, specific}
2. {BENEFIT_2 — concrete, specific}
3. {BENEFIT_3 — concrete, specific}

## Headlines & Copy
- **Headline:** {main benefit-driven headline}
- **Subheadline:** {supporting line}
- **CTA:** {call to action text, e.g. "Shop Now", "Try It Risk-Free"}
- **Pain Point:** {the #1 problem the product solves}

## Social Proof
- **Review 1:** "{quote}" — {First Name}
- **Review 2:** "{quote}" — {First Name}
- **Review 3:** "{quote}" — {First Name}
- **Stat Number:** {e.g. "4.9", "97%"}
- **Stat Label:** {e.g. "average rating from 12,000+ reviews"}
- **Stat Number 2:** {second key stat}
- **Stat Label 2:** {second stat label}

## Image Generation Modifier
{A one-paragraph prompt modifier describing the brand's visual identity for consistent image generation. Example: "All images should use a clean, minimal aesthetic with deep navy blue (#1B2A4A) as the primary color and warm gold (#D4A84B) accents. Typography should be bold sans-serif. Product photography should be studio-lit with soft shadows on white or light gray backgrounds. The overall tone is premium but accessible, scientific but not clinical."}
```

1. **Save** the file as `brands/{brand-name}/brand-dna.md`

### Validation checklist before moving to Phase 2

- [ ] All hex codes are real (extracted from the actual website, not guessed)
- [ ] Product name matches what's on the website exactly
- [ ] Price is current and accurate
- [ ] Benefits are specific (not generic filler)
- [ ] Reviews sound realistic and use customer language
- [ ] Image Generation Modifier paragraph is detailed enough to guide consistent visual output

-----

## Phase 2 — Prompt Generation

### Trigger

User says: "Run Phase 2 for {brand}."

### What to do

1. **Read** the Brand DNA file at `brands/{brand-name}/brand-dna.md`
1. **Read** the template prompts file at `skills/references/template-prompts.md`
1. **For each of the 40 templates**, replace ALL placeholders with the brand-specific values from the Brand DNA:

| Placeholder         | Source in Brand DNA                        |
|---------------------|--------------------------------------------|
| `{BRAND_NAME}`      | Brand Identity → Brand Name                |
| `{PRODUCT_NAME}`    | Product Details → Product Name             |
| `{HEADLINE}`        | Headlines & Copy → Headline                |
| `{SUBHEADLINE}`     | Headlines & Copy → Subheadline             |
| `{CTA}`             | Headlines & Copy → CTA                     |
| `{BENEFIT_1}`       | Benefits → 1                               |
| `{BENEFIT_2}`       | Benefits → 2                               |
| `{BENEFIT_3}`       | Benefits → 3                               |
| `{PRICE}`           | Product Details → Price                    |
| `{PRICE_BARRÉ}`     | Product Details → Price Barré              |
| `{REVIEW_TEXT}`     | Social Proof → Review 1 quote              |
| `{REVIEW_NAME}`     | Social Proof → Review 1 name               |
| `{REVIEW_TEXT_2}`   | Social Proof → Review 2 quote              |
| `{REVIEW_NAME_2}`   | Social Proof → Review 2 name               |
| `{REVIEW_TEXT_3}`   | Social Proof → Review 3 quote              |
| `{REVIEW_NAME_3}`   | Social Proof → Review 3 name               |
| `{STAT_NUMBER}`     | Social Proof → Stat Number                 |
| `{STAT_LABEL}`      | Social Proof → Stat Label                  |
| `{STAT_NUMBER_2}`   | Social Proof → Stat Number 2               |
| `{STAT_LABEL_2}`    | Social Proof → Stat Label 2                |
| `{PRIMARY_COLOR}`   | Brand Identity → Primary Color             |
| `{SECONDARY_COLOR}` | Brand Identity → Secondary Color           |
| `{FONT_STYLE}`      | Brand Identity → Font Style                |
| `{PAIN_POINT}`      | Headlines & Copy → Pain Point              |
| `{MECHANISM}`       | Product Details → Mechanism                |
| `{GUARANTEE}`       | Product Details → Guarantee                |
| `{INGREDIENT}`      | Product Details → Key Ingredient/Component |
| `{TIME_RESULT}`     | Product Details → Time to Result           |

1. **Append the Image Generation Modifier** to the end of EVERY prompt. This ensures visual consistency across all 40 outputs.
1. **Output** a JSON file with this structure:

```json
{
  "brand": "Brand Name",
  "generated_at": "2026-03-15",
  "templates": [
    {
      "id": 1,
      "name": "hero-statement",
      "category": "headline-bold",
      "ratio": "1:1",
      "prompt": "The fully filled-in prompt text with brand details and the image generation modifier appended..."
    },
    {
      "id": 2,
      "name": "split-headline",
      "category": "headline-bold",
      "ratio": "1:1",
      "prompt": "..."
    }
  ]
}
```

1. **Save** as `brands/{brand-name}/prompts.json`

### Validation checklist before moving to Phase 3

- [ ] All 40 templates are present in the JSON
- [ ] No remaining `{PLACEHOLDER}` text in any prompt (search for `{` to verify)
- [ ] Image Generation Modifier is appended to every prompt
- [ ] JSON is valid (no syntax errors)
- [ ] Ratios are correctly assigned per template

-----

## Phase 3 — Image Generation

### Trigger

User says: "Run Phase 3 for {brand}." or "Run Phase 3 for {brand}, only templates {list}."

### What to do

1. **Check prerequisites:**
- `.env` file exists with `FAL_KEY`
- `brands/{brand-name}/prompts.json` exists and is valid
- `brands/{brand-name}/product-images/` has at least 1 image (PNG or JPG)
- If images are `.avif`, convert them to PNG first: `ffmpeg -i image.avif image.png`
1. **Copy the Python generation script** to `brands/{brand-name}/generate.py` (see Phase 3 Script section below)
1. **Run the script:**

```bash
cd brands/{brand-name}
python generate.py
```

1. **If the script errors**, read the error message, diagnose the issue, and fix the script. Common issues:
- Quotation marks in prompt strings breaking JSON parsing → escape them
- FAL API format changes → check https://fal.ai/models/fal-ai/nano-banana-2/api for current docs
- Rate limiting → add a delay between requests (2-3 seconds)
- AVIF images → convert to PNG first
- API key not found → check `.env` file path
1. **Verify outputs** — Check that images are generated in `brands/{brand-name}/outputs/` with one subfolder per template.

### Phase 3 Script

```python
import os
import json
import time
import requests
from pathlib import Path
from dotenv import load_dotenv
import base64

# Load API key
load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")
FAL_KEY = os.getenv("FAL_KEY")

if not FAL_KEY:
    raise ValueError("FAL_KEY not found in .env file")

BRAND_DIR = Path(__file__).resolve().parent
PROMPTS_FILE = BRAND_DIR / "prompts.json"
PRODUCT_IMAGES_DIR = BRAND_DIR / "product-images"
OUTPUT_DIR = BRAND_DIR / "outputs"

FAL_API_URL = "https://queue.fal.run/fal-ai/nano-banana-2"
VARIANTS_PER_TEMPLATE = 4
DELAY_BETWEEN_REQUESTS = 3  # seconds

def get_product_image_urls():
    """Upload product images to FAL and return URLs, or use base64."""
    images = []
    for f in PRODUCT_IMAGES_DIR.iterdir():
        if f.suffix.lower() in [".png", ".jpg", ".jpeg", ".webp"]:
            with open(f, "rb") as img_file:
                b64 = base64.b64encode(img_file.read()).decode("utf-8")
                mime = "image/png" if f.suffix.lower() == ".png" else "image/jpeg"
                images.append(f"data:{mime};base64,{b64}")
    return images

def submit_request(prompt, aspect_ratio="1:1"):
    """Submit an image generation request to FAL AI."""
    headers = {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json"
    }

    product_images = get_product_image_urls()

    full_prompt = prompt
    if product_images:
        full_prompt += " Use the provided product reference images to match the real product appearance and packaging accurately."

    payload = {
        "prompt": full_prompt,
        "image_size": aspect_ratio,
        "num_images": 1
    }

    if product_images:
        payload["image_url"] = product_images[0]

    response = requests.post(FAL_API_URL, json=payload, headers=headers)

    if response.status_code == 200:
        return response.json()
    elif response.status_code == 202:
        result = response.json()
        request_id = result.get("request_id")
        return poll_result(request_id, headers)
    else:
        print(f"Error {response.status_code}: {response.text}")
        return None

def poll_result(request_id, headers, max_attempts=60):
    """Poll FAL AI for the result of a queued request."""
    status_url = f"https://queue.fal.run/fal-ai/nano-banana-2/requests/{request_id}/status"
    result_url = f"https://queue.fal.run/fal-ai/nano-banana-2/requests/{request_id}"

    for attempt in range(max_attempts):
        time.sleep(5)
        status_response = requests.get(status_url, headers=headers)
        if status_response.status_code == 200:
            status = status_response.json()
            if status.get("status") == "COMPLETED":
                result_response = requests.get(result_url, headers=headers)
                if result_response.status_code == 200:
                    return result_response.json()
            elif status.get("status") == "FAILED":
                print(f"Request {request_id} failed")
                return None
    print(f"Request {request_id} timed out")
    return None

def download_image(url, filepath):
    """Download an image from URL to local file."""
    response = requests.get(url)
    if response.status_code == 200:
        with open(filepath, "wb") as f:
            f.write(response.content)
        return True
    return False

def aspect_ratio_to_fal(ratio_str):
    """Convert ratio string to FAL-compatible format."""
    ratio_map = {
        "1:1": "square",
        "4:5": "portrait_4_3",
        "9:16": "portrait_16_9",
        "16:9": "landscape_16_9"
    }
    return ratio_map.get(ratio_str, "square")

def main():
    with open(PROMPTS_FILE, "r") as f:
        data = json.load(f)

    templates = data.get("templates", [])
    print(f"Loaded {len(templates)} templates for brand: {data.get('brand')}")

    only = os.getenv("ONLY_TEMPLATES")
    if only:
        ids = [int(x.strip()) for x in only.split(",")]
        templates = [t for t in templates if t["id"] in ids]
        print(f"Filtered to {len(templates)} templates: {ids}")

    OUTPUT_DIR.mkdir(exist_ok=True)

    total_generated = 0
    total_errors = 0

    for template in templates:
        tid = template["id"]
        tname = template["name"]
        ratio = template.get("ratio", "1:1")
        prompt = template["prompt"]

        folder_name = f"{tid:02d}-{tname}"
        template_dir = OUTPUT_DIR / folder_name
        template_dir.mkdir(exist_ok=True)

        print(f"\n--- Template {tid}: {tname} ({ratio}) ---")

        for variant in range(1, VARIANTS_PER_TEMPLATE + 1):
            output_path = template_dir / f"{tname}-v{variant}.png"

            if output_path.exists():
                print(f"  v{variant}: already exists, skipping")
                continue

            print(f"  v{variant}: generating...", end=" ")

            try:
                result = submit_request(prompt, aspect_ratio_to_fal(ratio))

                if result and "images" in result:
                    image_url = result["images"][0]["url"]
                    if download_image(image_url, output_path):
                        print(f"OK -> {output_path.name}")
                        total_generated += 1
                    else:
                        print("FAILED (download)")
                        total_errors += 1
                elif result and "image" in result:
                    image_url = result["image"]["url"]
                    if download_image(image_url, output_path):
                        print(f"OK -> {output_path.name}")
                        total_generated += 1
                    else:
                        print("FAILED (download)")
                        total_errors += 1
                else:
                    print("FAILED (no image in response)")
                    total_errors += 1

            except Exception as e:
                print(f"ERROR: {e}")
                total_errors += 1

            time.sleep(DELAY_BETWEEN_REQUESTS)

    print(f"\n=== DONE ===")
    print(f"Generated: {total_generated}")
    print(f"Errors: {total_errors}")
    print(f"Output: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
```

### Running a subset of templates

```bash
ONLY_TEMPLATES="1,7,9,13,25" python generate.py
```

-----

## Phase 3b — HTML Gallery (Optional)

### Trigger

User says: "Create a gallery for {brand}."

### What to do

Generate an `index.html` file in `brands/{brand-name}/outputs/` that:

- Lists all generated images organized by category
- Shows template name, category, and ratio for each
- Displays images in a responsive grid
- Allows clicking to view full-size
- Highlights which variants are strongest (user can mark favorites)

-----

## Quick Reference Commands

| User says                                                   | Action                                             |
|-------------------------------------------------------------|----------------------------------------------------|
| "Run Phase 1 for {brand}. URL is {url}. Product is {desc}." | Research brand → generate Brand DNA               |
| "Run Phase 2 for {brand}."                                  | Read Brand DNA + templates → generate prompts.json |
| "Run Phase 3 for {brand}."                                  | Run Python script → generate all 160 images        |
| "Run Phase 3 for {brand}, only templates 1,7,13."           | Generate only specified templates                  |
| "Create a gallery for {brand}."                             | Generate HTML gallery of outputs                   |
| "Convert images for {brand}."                               | Convert AVIF images to PNG in product-images/      |
| "Update Brand DNA for {brand}."                             | Re-research and regenerate brand-dna.md            |
| "Add templates 41-50 for {brand}."                          | Extend prompts.json with new custom templates      |

-----

## Troubleshooting

| Issue                               | Fix                                                                                          |
|-------------------------------------|----------------------------------------------------------------------------------------------|
| `FAL_KEY not found`                 | Check `.env` file exists at project root with `FAL_KEY=your_key`                             |
| `No images in product-images/`      | Add at least 1 PNG/JPG product photo                                                         |
| AVIF images not supported           | Run `ffmpeg -i image.avif image.png` to convert                                              |
| Quotation marks breaking JSON       | Escape all `"` inside prompt strings as `\"`                                                 |
| Rate limited by FAL                 | Increase `DELAY_BETWEEN_REQUESTS` to 5-10 seconds                                            |
| Images look off-brand               | Review Brand DNA — check hex codes and Image Generation Modifier are accurate                |
| Script errors on FAL API format     | Check https://fal.ai/models/fal-ai/nano-banana-2/api for current endpoint and payload format |
| Nano Banana not rendering text well | Add "with perfectly readable, crisp text" to the end of text-heavy prompts                   |
| Product not matching reference      | Ensure product images are high-quality, well-lit, on clean backgrounds                       |

-----

## Cost Estimate

| Volume                                 | FAL AI Cost (approx) |
|----------------------------------------|----------------------|
| 40 templates × 1 variant               | ~$2-4                |
| 40 templates × 4 variants (160 images) | ~$8-16               |
| Full run + iterations (250 images)     | ~$12-25              |

Costs vary based on resolution. Default is 1K. For higher quality, modify the script to request 2K or 4K (costs 2-3x more).

-----

*Skill file — Static Ad Generator Pipeline — Version 1.0*
