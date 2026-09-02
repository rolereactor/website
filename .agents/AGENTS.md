# Project Rules & Guidelines for Role Reactor Website

## Tailwind CSS v4 Utility Rules

Always use standard Tailwind CSS v4 syntax in this codebase:

1. **Word Break & Wrapping**:
   - Use `wrap-break-word` instead of legacy `break-words`.
   - Use `break-all` for forced word breaking.

2. **Gradients**:
   - Use `bg-linear-to-*` instead of legacy `bg-gradient-to-*` (e.g. `bg-linear-to-r`, `bg-linear-to-b`, `bg-linear-to-br`, `bg-linear-to-t`).

3. **Opacity Modifiers**:
   - Use percentage numbers directly for opacities instead of arbitrary decimal brackets (e.g. `bg-white/2` instead of `bg-white/[0.02]`, `bg-white/3` instead of `bg-white/[0.03]`, `bg-white/6` instead of `bg-white/[0.06]`, `border-white/12` instead of `border-white/[0.12]`).

4. **Flexbox Utilities**:
   - Use `shrink-0` instead of `flex-shrink-0`.
   - Use `grow` / `grow-0` instead of `flex-grow` / `flex-grow-0`.

5. **Text & Overflow**:
   - Use `truncate` or `text-ellipsis` instead of `overflow-ellipsis`.

6. **CSS Variables**:
   - Use `w-(--variable-name)` instead of `w-[var(--variable-name)]`.
   - Use `h-(--variable-name)` instead of `h-[var(--variable-name)]`.
   - Use `bg-(--variable-name)` instead of `bg-[var(--variable-name)]`.

7. **Pixel Scales & Small Pixels**:
   - Use `w-px`, `h-px`, `-top-px` instead of `w-[1px]`, `h-[1px]`, `-top-[1px]`.
   - Use `h-0.5`, `w-0.5` for 2px and `h-0.75`, `w-0.75` for 3px instead of `h-[2px]`, `h-[3px]`.
   - Prefer numeric step scales (e.g., `h-87.5` for 350px, `w-79.5` for 318px, `min-h-80` for 320px, `max-w-50` for 200px).

8. **Data Variant Selectors**:
   - Use `data-[side=left]:` or `data-side=left:` instead of arbitrary selectors like `[[data-side=left]_&]:`.

9. **Bare Integer Values**:
   - Use bare integers without brackets for arbitrary z-index, order, flex-grow, etc. (e.g. `z-9999` instead of `z-[9999]`).

10. **Background Size Utilities**:
   - Use `bg-size-*` (e.g., `bg-size-6` or `bg-size-[24px_24px]`) instead of legacy `bg-[size:]`.

11. **Arbitrary Pixel Dimensions to Numeric Scale**:
    - Convert arbitrary pixel bracket dimensions `-[Npx]` to standard Tailwind v4 numeric scale `N/4` for sizing and spacing (`w-`, `h-`, `min-w-`, `max-w-`, `min-h-`, `max-h-`, `top-`, `bottom-`, `left-`, `right-`, `p-`, `m-`, `gap-`, etc.).
    - Examples: `xl:w-[336px]` -> `xl:w-84`, `min-h-[450px]` -> `min-h-112.5`, `max-w-[200px]` -> `max-w-50`, `sm:max-w-[425px]` -> `sm:max-w-106.25`, `h-[58px]` -> `h-14.5`, `w-[500px]` -> `w-125`.

## API & Data Fetching Rules

1. **Defensive Response Parsing**:
   - Always read `response.text()` before `JSON.parse()` when consuming API responses in stores or proxy routes. Never call `.json()` directly on raw response objects without try/catch protection to prevent crashes when backend error responses return HTML.

2. **Upstream Microservice Unreachability**:
   - In Next.js API proxy handlers (e.g. `streamProxy`), intercept Node `ECONNREFUSED` / `fetch failed` errors and return HTTP 503 with `"Bot service unreachable"` instead of leaking unhandled exceptions.

3. **Use Backend Messages**:
   - Always use messages from the backend instead of hardcoded strings for toast notifications.
   - Use fallback messages for cases where backend message is unavailable.
   - Example:
     ```js
     // ❌ Bad
     toast.success("Bundle created successfully");
     
     // ✅ Good
     toast.success(result.message || "Bundle created successfully");
     ```
   - This allows the backend to customize messages and ensures consistency.

## Mobile Navigation Rules

1. **Page Sub-Section Navigation on Mobile**:
   - For feature pages with 5+ sub-sections (e.g. Live Reactor), use a compact **Cyberpunk Select Dropdown** on mobile screens (`lg:hidden`).
   - The dropdown button displays the active section icon, title, status badge, and rotating chevron arrow.
   - The menu overlay uses glassmorphism (`bg-zinc-950/95 backdrop-blur-2xl border border-cyan-500/30`), status badges, and outside-click dismiss logic.


