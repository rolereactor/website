---
name: tailwind-v4-refactor
description: Audit and refactor Tailwind CSS code to standard Tailwind v4 syntax. Search for legacy v3 utilities, non-idiomatic arbitrary bracket syntax, legacy gradients, opacity brackets, CSS variable bracket notations, arbitrary pixel dimension brackets (e.g. w-[336px], min-h-[450px], max-w-[200px]), and flexbox utilities, and replace them with standard Tailwind v4 utilities.
user-invocable: true
---

# Tailwind CSS v4 Refactoring & Syntax Upgrade Skill

This skill provides a comprehensive, automated audit workflow and transformation catalog to migrate, refactor, and clean up Tailwind CSS code to standard **Tailwind CSS v4** syntax across any web application codebase.

---

## AI Agent Audit Command Strategy

When invoked, AI assistants MUST perform a workspace-wide scan using the following ripgrep / regex patterns to detect all instances of non-idiomatic Tailwind v4 syntax or legacy v3 patterns.

### 1. Comprehensive Audit Regex Commands

Execute these search patterns in the shell or via code search tools:

```bash
# 1. Search for arbitrary pixel dimensions (e.g. w-[336px], min-h-[450px], max-w-[200px], h-[800px])
grep -rnE "(w|h|min-w|min-h|max-w|max-h|top|bottom|left|right|p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-x|space-y)-\[[0-9]+(\.[0-9]+)?px\]" apps/ src/ components/

# 2. Search for legacy break-words & overflow-ellipsis
grep -rn "break-words\|overflow-ellipsis" apps/ src/ components/

# 3. Search for legacy gradients (bg-gradient-to-*)
grep -rn "bg-gradient-to-" apps/ src/ components/

# 4. Search for legacy flexbox utilities (flex-shrink, flex-grow)
grep -rn "flex-shrink\|flex-grow" apps/ src/ components/

# 5. Search for arbitrary opacity brackets (e.g. /[0.02], /[0.05], /[0.12], /[0.5])
grep -rnE "/\[0\.[0-9]+\]" apps/ src/ components/

# 6. Search for arbitrary CSS variable brackets (e.g. [var(--...])
grep -rnE "(w|h|bg|text|border|inset|top|bottom|left|right|line-clamp)-\[var\(--" apps/ src/ components/

# 7. Search for arbitrary single-pixel and small pixel brackets (e.g. -[1px], -[2px], -[3px])
grep -rnE "-\[[123]px\]" apps/ src/ components/

# 8. Search for arbitrary bare integers (e.g. z-[9999], z-[50], opacity-[80])
grep -rnE "(z|order|opacity|line-clamp)-\[[0-9]+\]" apps/ src/ components/

# 9. Search for legacy arbitrary data selector brackets (e.g. [[data-...], [&[data-...])
grep -rnE "(\[\[data-|\[&\[data-)" apps/ src/ components/

# 10. Search for legacy background size arbitrary brackets (e.g. bg-[size:...])
grep -rn "bg-\[size:" apps/ src/ components/
```

---

## Comprehensive Tailwind v4 Transformation Catalog

| Category | Legacy / Anti-Pattern (v3 or Non-Idiomatic) | Modern Tailwind v4 Standard | Description & Conversion Formula |
| :--- | :--- | :--- | :--- |
| **Pixel Dimensions ($N/4$)** | `xl:w-[336px]` | `xl:w-84` | $336 / 4 = 84$. Divide pixel value by 4 for numeric step scale. |
| | `min-h-[450px]` | `min-h-112.5` | $450 / 4 = 112.5$. Decimal scale steps supported natively in v4. |
| | `max-w-[200px]` | `max-w-50` | $200 / 4 = 50$. Applies to `w-`, `h-`, `min-w-`, `max-w-`, `min-h-`, `max-h-`. |
| | `sm:max-w-[425px]` | `sm:max-w-106.25` | $425 / 4 = 106.25$. Fractional step scale. |
| | `h-[58px]` | `h-14.5` | $58 / 4 = 14.5$. Fractional step scale. |
| | `w-[500px]` / `h-[500px]` | `w-125` / `h-125` | $500 / 4 = 125$. Large dimension step scale. |
| **Single & Small Pixels** | `w-[1px]` / `h-[1px]` | `w-px` / `h-px` | 1px dimensions use default `px` scale key. |
| | `h-[2px]` / `w-[2px]` | `h-0.5` / `w-0.5` | 2px dimensions map to `0.5` scale step ($2/4 = 0.5$). |
| | `h-[3px]` / `w-[3px]` | `h-0.75` / `w-0.75` | 3px dimensions map to `0.75` scale step ($3/4 = 0.75$). |
| | `-top-[1px]` | `-top-px` | Single pixel offsets use `-px`. |
| **CSS Variables** | `w-[var(--sidebar-width)]` | `w-(--sidebar-width)` | Use parentheses syntax `utility-(--var)` for CSS variables. |
| | `text-[var(--color)]` | `text-(--color)` | Applies to `text-`, `hover:text-`, `bg-`, `border-`, `max-w-`, etc. |
| **Opacity Modifiers** | `bg-white/[0.02]` | `bg-white/2` | Direct percentage numbers replace arbitrary decimal brackets. |
| | `bg-black/[0.05]` | `bg-black/5` | `2` = 2%, `5` = 5%, `12` = 12%, `80` = 80%. |
| | `border-white/[0.12]` | `border-white/12` | Works on all color utility opacity modifiers. |
| | `opacity-[0.02]` | `opacity-2` | Direct percentage opacity modifier. |
| **Bare Integers** | `z-[9999]` | `z-9999` | Bare integers do not require arbitrary brackets in v4. |
| | `z-[50]` | `z-50` | Applies to `z-`, `order-`, `opacity-`, `line-clamp-`, etc. |
| **Word Wrapping & Text** | `break-words` | `wrap-break-word` | Standardized word breaking in Tailwind v4. |
| | `overflow-ellipsis` | `truncate` or `text-ellipsis` | Standard text truncation utilities. |
| **Gradients** | `bg-gradient-to-r` | `bg-linear-to-r` | Linear gradient directions use `bg-linear-to-*`. |
| | `bg-gradient-to-b` | `bg-linear-to-b` | Includes `-t`, `-b`, `-l`, `-r`, `-tl`, `-tr`, `-bl`, `-br`. |
| **Flexbox** | `flex-shrink-0` | `shrink-0` | Shortened flexbox utilities. |
| | `flex-shrink` | `shrink` | Shortened flexbox utilities. |
| | `flex-grow` | `grow` | Shortened flexbox utilities. |
| | `flex-grow-0` | `grow-0` | Shortened flexbox utilities. |
| **Background Size** | `bg-[size:24px_24px]` | `bg-size-6` or `bg-size-[24px_24px]` | Use `bg-size-*` prefix instead of legacy `bg-[size:]`. |
| **Data Attributes** | `[[data-side=left]_&]:cursor-w-resize` | `data-[side=left]:cursor-w-resize` | Native Tailwind v4 `data-*` variant selectors. |
| | `[&[data-state=open]]:` | `data-[state=open]:` or `data-state=open:` | Native data state variant modifiers. |

---

## Step-by-Step Refactoring Workflow for AI Agents

1. **Run Full Audit Scan**: Execute all 10 grep/ripgrep commands across the codebase to locate every non-idiomatic utility.
2. **Batch Refactor**: Systematically update files replacing:
   - Pixel brackets `-[Npx]` with numeric scale `-(N/4)`
   - CSS variables `-[var(--x)]` with `-(--x)`
   - Decimal opacity `/[0.XX]` with `/XX`
   - Legacy flexbox `flex-shrink-*` / `flex-grow-*` with `shrink-*` / `grow-*`
   - Legacy gradients `bg-gradient-to-*` with `bg-linear-to-*`
   - Legacy data selectors `[[data-*]` with `data-[*]:`
3. **Run Type Check & Verification**:
   ```bash
   pnpm type-check
   ```
4. **Summary Report**: List all files modified, pattern counts refactored, and confirm zero remaining non-idiomatic warnings.
