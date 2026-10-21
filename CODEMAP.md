# Frontend code map
_Last verified: 2026-10-21_

Read this instead of the code. Open only the files a task names. Update it when
a change makes a line untrue (see `CLAUDE.md`).

## Stack
- Next 16.3.1 (App Router, `src/app`), React 19.2.8, TS 5, ESLint 9 (next core-web-vitals + typescript).
- Tailwind v4 via `@tailwindcss/postcss`. There is no tailwind.config; tokens live in `@theme` in `src/app/globals.css`.
- Fonts: `next/font/google` Geist (`--font-geist-sans`) and Noto Sans Bengali (`--font-noto-bengali`), chained in `--font-sans` (layout.tsx:14-31).
- `@payloadcms/plugin-ecommerce` 3.88 supplies only the client `EcommerceProvider` / `useCart`. `payload` is listed but never imported.
- Types are hand-written in `lib/types.ts`, not imported from the backend.
- **Money is integer poisha.** Format it only through `formatBDT`.
- **All navigation is a full page load.** `components/Link.tsx` is a plain `<a>`, plus `window.location.assign`. There is no `next/link`.
- `next.config.ts`
  - Rewrites `/api/:path*` → `${NEXT_PUBLIC_PAYLOAD_URL}/api/:path*`. Browser cart, coupon and cash-on-delivery calls are same-origin through this proxy.
  - Images: remotePatterns allow only the Payload host `/api/media/**`. `dangerouslyAllowLocalIP` only outside production.
- Hosting: Railway, auto-detected (no config file). See DEPLOYMENT.md.

## Commands
- `npm run dev`: `next dev --port 3001`. Expects the backend on :3000. `.claude/launch.json` "storefront" runs the same.
- `npm run build`, `npm start` (`$PORT`, default 3001), `npm run lint`.

## Routes
All are server components. No route uses `revalidate`/`dynamic` segment config; caching is fetch-level `next.revalidate` only.

- **Root `layout.tsx`**
  - Calls `getCategoryTree()` once.
  - Renders `CartProvider` > Header / main / Footer, plus FloatingWhatsApp, FacebookPixel and GoogleAnalytics.
  - Title template `%s | BabuNest.com`.
- **`/`** (`app/page.tsx`)
  - `getHomePage()` (depth 2), then `getProducts({ids})` per section in parallel.
  - Renders Hero → TopCollections → ProductSection[]. Only the first section gets `priority`.
- **`/shop?page=`**: `getProductsPage({page})` → ProductListing. Has `loading.tsx` (ListingSkeleton).
- **`/category/[slug]?page=`**
  - `getCategoryBySlug` (404 if missing), then `getProductsPage({categorySlug})`.
  - `generateMetadata` refetches the category. Has `loading.tsx`.
- **`/product/[slug]`**
  - `getProductBySlug` (depth 2, no select; 404 if missing) and `getRelatedProducts`.
  - Renders Gallery, ProductBuyBox, TrackViewContent, a hard-coded info list, ProductTabs and a related-products grid. Has `loading.tsx`.
- **`/search?q=&page=`**: `searchProductsPage(term,20,page)` → ProductListing. noindex.
- **`/cart`**: CheckoutSteps + CartView (client). noindex.
- **`/checkout`**: CheckoutSteps + CheckoutView (client). noindex.
- **`/order/[id]`**: static thank-you showing `#id`.
  - Deliberately does **not** fetch the order: a guest would get a 403.
  - noindex/nofollow.
- **`/contact`, `/privacy`, `/returns`, `/shipping`**: static Bangla policy copy.
  - Contacts come from `lib/contact.ts`.
  - `/shipping` inlines the PolicyPage markup instead of using the wrapper.
- **`GET /api/search?q=`** (`app/api/search/route.ts`)
  - q under 2 chars → `[]`. Otherwise `searchProducts(term,6)`, trimmed to `{href,id,image,price,title}`.
  - Shadows the `/api/*` rewrite for this one path.
- **`GET /feed/meta.xml`**
  - Serves `buildMetaFeed()` with `Cache-Control: s-maxage=3600, stale-while-revalidate=86400` and `X-Item-Count`.
  - Any error → 503 no-store. It never serves a partial feed.

## Components
**Layout**
- `Header` (server): sticky. Utility strip (WhatsApp, FB, hotline) / logo + SearchBar + MobileSearch + cart icon with CartCount / CategoryNav.
- `Footer` (server): category column, help links, contacts, ©.
- `CategoryNav` (server): desktop menu; dropdowns open on `group-hover` / `focus-within`.
- `MobileNav` (client): drawer; locks body scroll; Esc closes.
- `MobileSearch` (client): toggles a panel holding SearchBar.
- `SearchBar` (client): 250ms-debounced `/api/search` with AbortController. Submit → `location.assign('/search?q=')`.
- `FloatingWhatsApp` (server): fixed button, offset by `--sticky-action-height`.
- `Link`: plain `<a>`. Change it here to bring back `next/link` site-wide.

**Home**
- `Hero` (server): `heroSlides` → HeroSlider. Without slides, a legacy single banner; without that, an ink panel.
- `HeroSlider` (client)
  - Cross-fade, pointer swipe (45px), dots, desktop arrows.
  - Autoplay every `heroAutoplaySeconds`; respects reduced motion; pauses on hover/focus.
- `TopCollections` (server): tile grid, 3→7 per row.
- `CategoryTile` (client, only for its image skeleton).
- `ProductSection` (server): returns null with no products. View-all shows only when both URL and label are set.

**Listing**
- `ProductListing` (server): breadcrumb, title, count, 2/3/4-column grid, Pagination.
- `Pagination` (server): windowed page numbers; picks `?` or `&` from basePath.
- `ListingSkeleton`: placeholder grid.
- `ProductCard` (server)
  - Discount badge, sold-out badge, "From" for price ranges.
  - Variant or sold-out products link to the product page. Others render `CardAddToCart`.

**Product**
- `Gallery` (client): images stacked with opacity switching, thumbnail strip, spinner until loaded.
- `ProductBuyBox` (client)
  - Variant picker sorted by price ascending; defaults to the first in-stock variant.
  - Add button becomes a stepper once in the cart. Buy now = `add()` then `/cart`.
  - "Only N left" at ≤5 in stock. Mobile sticky bar via IntersectionObserver.
- `ProductTabs` (client): Description / Specifications (+ care) tabs on desktop; stacked on mobile.
- `RichText` (server): minimal Lexical renderer for text (bold/italic), linebreak, link, heading, list, quote, paragraph.

**Cart** (`components/cart/`)
- `CartProvider` (client): EcommerceProvider setup; see the flow below.
- `CartCount` (client): unit count. Falls back to `cartCountCache` until the cart loads.
- `CartView` (client): rows, subtotal, savings, a checkout link that fires `trackBeginCheckout`, StickyAction.
- `CardAddToCart` (client): grid add button that becomes a stepper.
- `QuantityStepper` (client): outline with a teal `border-primary` and teal −/+ icons; the count stays ink. Bin icon at qty 1; respects `max`. Used on cards, the product page, cart and checkout.
- `useCartLine`: finds the line for a product + variant; optimistic qty; per-control `isPending`; add / increment / decrement (qty 1 removes).
- `useCartHydrated`: shows the skeleton while localStorage has a cart id and items haven't loaded; gives up after 6s.
- `cartCountCache`: last count in localStorage. `CartSkeleton`: placeholder.

**Checkout** (`components/checkout/`)
- `CheckoutView` (client): form, zone radios, coupon, totals, place order.
- `CouponField` (client): POST `/api/coupons/validate`. Also exports `formatDiscount`.
- `CheckoutSteps` (server): cart → checkout → complete banner.
- `CheckoutSkeleton`: placeholder.

**Analytics**
- `FacebookPixel`, `GoogleAnalytics` (server): `next/script` afterInteractive. Each renders null without its id.
- `pixel/TrackViewContent` (client): fires `trackViewItem` on mount.

**UI**
- `Spinner` and `Skeleton` (both in `Spinner.tsx`).
- `StickyAction` (client): mobile-only fixed bottom bar.
- `useStickyActionHeight`: publishes `--sticky-action-height` on `<html>`.
- `PolicyPage.tsx`: PolicyPage, PolicyBody, PolicySection, PolicyList, PolicyCard, PolicyNotice, Strong.
- `icons.tsx`: Search, Cart, User, Menu, Close, Plus, Minus, Trash, Phone, WhatsApp, Instagram, Facebook, ChevronDown.

## Data layer (src/lib)
- **`payload.ts`**
  - Server fetches go straight to `NEXT_PUBLIC_PAYLOAD_URL`, not through the proxy.
  - `api()` returns null on error or non-OK, and logs it. Default `revalidate: 60`.
  - `CARD_FIELDS` / `selectCardFields(params)`: `select[x]=true` for compareAtPriceInBDT, enableVariants, gallery, inventory, priceInBDT, slug, title, variants. Keeps listings small; a 14MB response once broke the data cache.
  - `mediaURL(media,size?)`: absolute URL of `sizes[size].url`, else `url`. Sizes: `thumbnail`, `card`, `feature`.
  - `firstImage(product)`.
  - `getHomePage()`: `/api/globals/home-page?depth=2`.
  - `getCategoryTree()`
    - `/api/categories?depth=1&limit=100&sort=title` and `/api/globals/navigation?depth=0`, in parallel.
    - Ordered by `navigation.menu`; categories not in the menu go last, alphabetically.
  - `getProducts({categorySlug,featured,ids,limit=8})`
    - `/api/products` depth 1, `sort=-createdAt`, card select.
    - Filters: `where[featured]`, `where[categories.slug]`, `where[id][in]`.
    - Results keep the order of `ids`. `ids:[]` → `[]`.
  - `getProductsPage({categorySlug,page})`: `PAGE_SIZE=20`. Returns `{page,products,totalDocs,totalPages}`.
  - `getCategoryBySlug(slug)` (depth 0). `getProductBySlug(slug)` (depth 2, full doc).
  - `getRelatedProducts(product,4)`: curated `relatedProducts`, else same-category products (self removed).
  - `toIds()`.
- **`search.ts`**: `searchProducts(term,limit,page)` and `searchProductsPage(...)`.
  - Match: `where[or][0][title][like]` / `where[or][1][shortDescription][like]`. Card select, revalidate 60.
  - Empty result on failure. The two function bodies are duplicated.
- **`price.ts`**
  - `formatBDT(poisha)`: `৳` with en-BD grouping.
  - `variantLabel(v)`: label → options[0].label → title.
  - `summarisePrice(product)`: `{amount (min), compareAt, discountPercent, isRange, maxAmount}`.
  - `stockLevel(product)`: sums variant stock when variants are on.
- **`shipping.ts`**: **hard-coded** `SHIPPING_ZONES` (inside-dhaka 8000, outside-dhaka 15000), plus `DEFAULT_ZONE`, `ZONE_STORAGE_KEY` and `zoneById`. Does not read the backend's `shipping-settings` global.
- **`contact.ts`**: `CONTACT` {facebook, email, hotline, instagram, whatsapp}, all built from one `PHONE` constant.
- **`feed.ts`**, **`analytics.ts`**, **`pixel.ts`**, **`gtag.ts`**: see Analytics & feeds.
- **`types.ts`**: Media, Category, CategoryTree, Variant, Product, HomeSection, HeroSlide, HomePageGlobal, Paginated.

## Cart & checkout flow
1. **State: plugin `EcommerceProvider`** (`CartProvider.tsx`, client)
   - Config: `apiRoute:'/api'` (proxied), `enableVariants`, `syncLocalStorage {key:'brownmoor-cart'}`, BDT.
   - The guest cart id is stored in `brownmoor-cart` and the secret in `brownmoor-cart_secret`.
   - `cartsFetchQuery` (depth 2) populates product and variant fields. Without it, rows render blank.
   - The provider ignores `serverURL`, which is why the `/api` rewrite exists.
2. **Add** (`useCartLine`): `addItem({product, variant?})`, shown with an optimistic qty, then `trackAddToCart` on success. `incrementItem`/`decrementItem`/`removeItem` work by line id.
3. **/cart** (`CartView`)
   - Totals the lines on the client from the populated prices (variant price if present).
   - Shows subtotal and compare-at savings. No delivery charge yet.
4. **/checkout** (`CheckoutView`)
   - Fields: name (required), email (optional, regex), phone (`^01\d{9}$` after stripping), address (≥12 chars), note.
   - Zone is picked by radio on this page. It starts from localStorage `ZONE_STORAGE_KEY`, else `DEFAULT_ZONE`, and is written back on change.
   - Displayed total = subtotal − min(discount, subtotal) + zone.rate. Display only.
5. **Coupon** (`CouponField`)
   - POST `/api/coupons/validate {code, subtotal}` → `{valid, code, discount, reason}`.
   - Only `couponCode` is sent with the order; the server re-prices.
6. **Place the order** (`credentials:'include'`)
   1. `POST /api/payments/cod/initiate`
      - Body: `{billingAddress, shippingAddress, cartID, couponCode?, customerEmail, note?, secret}`. Must return `reference`.
      - Address: `{addressLine1, city:'Dhaka'|'Outside Dhaka', country:'BD', firstName, phone}`. The backend derives the zone from `city`.
      - Email fallback: `${phone}@cod.babunest.invalid`.
   2. `POST /api/payments/cod/confirm-order`
      - Body: `{cartID, customerEmail, reference, secret}`. Must return `orderID`.
   3. On success:
      - `trackPurchase(items, total, orderID)`.
      - `clearCart()`, then remove the 3 `brownmoor-cart*` localStorage keys.
      - `location.assign('/order/'+orderID)`.
   - Any failure shows an inline error and re-enables the button.
7. **Payment:** cash on delivery only.

## Analytics & feeds
- **`analytics.ts`** defines every event and sends each to both Meta and GA4. Values are poisha→taka (`toTaka`), currency BDT.
  - `trackViewItem` → ViewContent / view_item.
  - `trackAddToCart` → AddToCart / add_to_cart.
  - `trackBeginCheckout` → InitiateCheckout / begin_checkout.
  - `trackPurchase` → Purchase / purchase (with `transaction_id`).
- **`pixel.ts`** `trackPixel` and **`gtag.ts`** `trackGtag` do nothing when the global is missing.
- PageView / page_view come from the base snippets; every navigation is a full page load.
- **Meta feed** (`lib/feed.ts`)
  - Walks `/api/products` depth 1, 100 per page, max 100 pages, with the `FEED_FIELDS` select. Revalidate 3600. Throws if any page fails.
  - Variant products produce one item per variant: id `${productId}-${variantId}`, `item_group_id`=productId, title "Product - Label".
  - Skips items with no image, slug or price.
  - On sale: `price`=compare-at, `sale_price`=live price.
  - `g:product_type`: one per category, max 5.
  - Description: shortDescription, else the Lexical text, else the title.
  - Brand is the constant `'BabuNest'`. Links use `NEXT_PUBLIC_SITE_URL`.

## Styling & UI conventions
- **Tokens** (`globals.css` @theme), with no dark mode on purpose:
  - `ink #111`, `paper #fff`, `muted #6b6b6b`, `faint #9a9a9a`, `line #e5e5e5`, `wash #f6f6f6`.
  - `sale #c0392b`: sale badges, errors and PolicyNotice only.
  - `notify #fa3e3f`: the cart badge.
  - `primary #01ac9f` / `primary-hover #01968b`: fills for buttons, the header top strip and the footer, with white text. Never use them for titles or body text (brand owner's rule). White on primary is 2.8:1, below AA; chosen deliberately.
- **Utilities:** `tracked` (0.08em uppercase, used on `text-[11px]` labels) and `line-clamp-2-fixed`.
- **Recurring classes**
  - Container: `mx-auto max-w-[1280px] px-4`. Radius: `rounded-lg`.
  - **All buttons** use `text-[11px] tracked font-bold`.
  - Product cards and category tiles get `border-primary` on hover.
  - Selected state (ProductBuyBox variant option): `border-primary bg-primary-wash` (#e6f7f5). Unselected options hover to `border-primary`.
  - Primary button: `h-11/h-12 rounded-lg bg-primary text-[11px] tracked font-bold text-paper hover:bg-primary-hover`. The active Pagination page uses `bg-primary` too.
  - Secondary (outline) button: `border border-primary text-primary hover:bg-primary hover:text-paper`. Used on the order page, ProductSection view-all, Coupon Apply and ProductBuyBox Buy now.
  - The header utility strip and the footer are `bg-primary` too (footer text uses paper/80–90 so it stays legible on teal). The CheckoutSteps banner, hero fallback panel and ProductCard badge stay `bg-ink`.
  - Input: `bg-wash border-transparent focus:border-ink` (the `FIELD` const in CheckoutView).
  - Product grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4`. `md` is the mobile/desktop split.
- **Hard-coded colours:** WhatsApp `#25D366`; CartView savings pill `#eef7f0` / `#2f6b43`.
- **Reuse these:** Link, Spinner/Skeleton, QuantityStepper + useCartLine, StickyAction + useStickyActionHeight, ProductCard/ProductListing, PolicyPage family, icons.
- Bangla blocks set `lang="bn"` on their wrapper.

## Env vars
- `NEXT_PUBLIC_PAYLOAD_URL`: effectively required. Default `http://localhost:3000`.
  - Used for server fetches, the `/api` rewrite, image remotePatterns and media URLs.
  - Read at build time. Must be the backend's **public** URL, because browsers load images from it.
  - Pages built while the backend is down render empty until the 60s revalidate.
- `NEXT_PUBLIC_SITE_URL`: used by the feed only. Default `http://localhost:3001`; trailing slash stripped.
- `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`: optional. Unset disables them. Build-time, so a change needs a rebuild.

## Gotchas
- **`/api/*` is proxied to Payload.** A new `src/app/api/<x>` route shadows the backend endpoint at the same path, as `api/search` already does.
- **Shipping charge can differ from what the server charges.** The client shows the flat rates in `lib/shipping.ts`.
  - The backend charges from its `shipping-settings` global: base rate + per-kg surcharge over the included weight, with a free-shipping threshold.
  - So any order over the included weight, or over the threshold, shows the wrong delivery charge at checkout.
- **Rates repeated as hard-coded copy:** `/shipping` (shipping/page.tsx:100-107) and the "৳80 / ৳150" line on the product page (product/[slug]/page.tsx:101) restate them. `/shipping` also promises a ৳20/kg surcharge over 2 kg.
- The outside-Dhaka zone sends `city:'Outside Dhaka'` (CheckoutView.tsx:209). It works only because the backend falls through to its default zone.
- **localStorage keys:** renaming them empties every existing cart. Keep them in sync:
  - `brownmoor-cart`: CartProvider.tsx:62, useCartHydrated.ts:7, CheckoutView.tsx:295.
  - `brownmoor-cart_secret`: CheckoutView.tsx:219, 296. The provider derives it as `<key>_secret`. A mismatch makes cash-on-delivery return 403.
  - `brownmoor-cart_count`: cartCountCache.ts:17, CheckoutView.tsx:297.
  - `brownmoor-shipping-zone`: shipping.ts:26.
- **Meta content_ids don't match the feed for variant products.**
  - The feed uses `${productId}-${variantId}` (feed.ts:272).
  - AddToCart sends the bare variant id (useCartLine.ts:102).
  - ViewContent, BeginCheckout and Purchase send the product id.
- `trackPurchase` reports the client-computed total, not the server's.
- `getProductBySlug` is depth 2 with no select (payload.ts:268), so it is heavy. Listings must keep `selectCardFields`.
- Media sizes `thumbnail` / `card` / `feature` must exist on the backend, or images fall back to the original.
- **Cart totals come from populated prices** (CartView.tsx:34, CheckoutView.tsx:32). If `cartsFetchQuery` loses fields, prices show 0.
- Full-page `window.location.assign` is deliberate: CheckoutView.tsx:306, ProductBuyBox.tsx:199, SearchBar.tsx:104.
- **Stale comments**
  - ProductBuyBox.tsx:184-186 and CheckoutView.tsx:116 say the zone is picked on the cart page; it is picked at checkout.
  - MobileNav.tsx:13 says it is the only client component in the header; SearchBar, MobileSearch and CartCount are client components too.
- **Brand:** site name is `BabuNest.com` everywhere (titles, policy pages, footer ©, logo alt, Hero alt fallbacks, feed). Facebook: `facebook.com/babunestbangladesh` (lib/contact.ts). Still left from Brownmoor:
  - `lib/contact.ts`: phone 8801621193887 (WhatsApp and hotline share it), email `hellobrownmoor@gmail.com`. Instagram is `@babunest`.
  - Header logo `/logo.png` (395×72) is still Brownmoor's. The footer logo `/logo-light.svg` is BabuNest's: white, viewBox cropped to 1567×392, shown at h-11/md:h-12 in Footer.tsx.
  - "Kitchenware" positioning: layout.tsx:35 description, Footer.tsx:34 tagline, feed.ts:380, shipping/page.tsx:226.
  - Policy pages give a street address (Arshinagar, Bosila, Mohammadpur): contact, privacy, returns, shipping `page.tsx`.
  - localStorage keys `brownmoor-*` (above): internal only, never shown.
  - Support hours are repeated inline on the policy pages. Effective dates: privacy/page.tsx:20, returns/page.tsx:20.
