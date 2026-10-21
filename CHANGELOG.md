# Changelog — Babunest Storefront

Newest first. Rules and entry format are in `CLAUDE.md`. Entries before
2026-10-20 belong to the Brownmoor project and are not carried over.

<!-- entries -->

### 2026-10-21 · config · Live on babunest.com; document the Cloudflare setup
- **What:** `DEPLOYMENT.md` now records the live setup: Cloudflare DNS (`@` and `www` proxied, `api` DNS only), the www→root redirect rule, the live URLs and the domain variables.
- **Why:** With `api` proxied, the storefront's `/api` forwarding hit Cloudflare Error 1000 (403), which broke the cart while pages still loaded. It was fixed by switching `api` to DNS only, and that must not be undone.
- **Files:** `DEPLOYMENT.md`
- **Status:** verified live: www → 301 to root (query kept), images and the feed served from the domain, CORS allows babunest.com, and add to cart on babunest.com works (count 1, no errors). No order placed on production yet.

### 2026-10-21 · config · Backend is live; storefront no longer blocked
- **What:** Deleted `CURRENT-BOTTLENECK.md` and the Open issue line in `CLAUDE.md`.
- **Why:** The backend's Railway deploy now works (its tables are created on start), so the storefront can load data.
- **Files:** `CURRENT-BOTTLENECK.md` (deleted), `CLAUDE.md`
- **Status:** the storefront returns 200. Products only show once they're added in the admin. Cart and checkout aren't tested on Railway yet; see DEPLOYMENT.md steps 6–7.

### 2026-10-21 · docs · Record that the storefront is waiting on the backend
- **What:** Added `CURRENT-BOTTLENECK.md` (the storefront is live on Railway but empty while the backend build fails), with the steps to take once the backend is up. `CLAUDE.md` now has an Open issue line pointing to it.
- **Why:** Keeps both repos' blocker files in step, so this repo's state doesn't look healthy when it isn't.
- **Files:** `CURRENT-BOTTLENECK.md`, `CLAUDE.md`
- **Status:** documentation only. Delete it once products load on the Railway URL.

### 2026-10-21 · docs · Rule for keeping CURRENT-BOTTLENECK.md current
- **What:** `CLAUDE.md` now says how to handle blockers: record them in `CURRENT-BOTTLENECK.md`, update it after every attempt, and delete it (and its pointer line) once resolved.
- **Why:** The brand owner wants that file to always reflect the real state, never a stale or already-fixed problem.
- **Files:** `CLAUDE.md`
- **Status:** documentation only.

### 2026-10-21 · deps · Force npm on Railway and pin Payload plugin versions
- **What:** `packageManager` is now `npm@10.8.2` and `@payloadcms/plugin-ecommerce` is pinned to exactly 3.88.0 (was ^3.88.0). Also pinned `payload` to 3.88.0.
- **Why:** The first Railway build picked pnpm (from `engines.pnpm`), ignored `package-lock.json` and installed plugin-ecommerce 3.91.0 against payload 3.88.0. The build failed with "Export uploadRequiresServerValidation doesn't exist".
- **Files:** `package.json`, `package-lock.json`, `CODEMAP.md`
- **Status:** the backend `npm run build` passes locally. Not yet confirmed on Railway.

### 2026-10-21 · layout · Replace the favicon and iPhone icon with BabuNest's
- **What:** `src/app/icon.svg` is now the BabuNest nest mark. `favicon.ico` (16/32/48px) and `apple-icon.png` (180px) were rendered from it with sharp, replacing the Brownmoor ones.
- **Why:** New brand icon. The old `.ico` and Apple icon would otherwise keep showing Brownmoor in browsers that prefer them over the SVG.
- **Files:** `src/app/icon.svg`, `src/app/favicon.ico`, `src/app/apple-icon.png`, `CODEMAP.md`
- **Status:** verified: all three are served (200) and linked in the page head, and the apple icon was checked visually. The Payload admin's own favicon is unchanged.

### 2026-10-21 · layout · Baby-care tagline in the footer, meta description and feed
- **What:** The footer tagline and the site meta description are now "আপনার ছোট্ট বাবুর যত্নের জন্য সবকিছু". The Meta feed channel description is now "Baby care products, delivered across Bangladesh."
- **Why:** BabuNest sells baby care products, not kitchenware.
- **Files:** `src/components/Footer.tsx`, `src/app/layout.tsx`, `src/lib/feed.ts`, `src/app/shipping/page.tsx`, `CODEMAP.md`
- **Status:** verified on / (footer text and meta description in the HTML). The shipping page sign-off also changed from kitchen to baby wording. The backend's demo seed data is still kitchenware.

### 2026-10-21 · layout · Enlarge the header cart icon and count badge to 24px
- **What:** The header cart icon went from the 20px default to 24px (`h-6 w-6`). The count badge went from 16px to a 24px circle (`h-6 min-w-6`) with 12px semibold text, nudged out to the corner (`-right-1 -top-1`) so it doesn't cover the icon.
- **Why:** The brand owner asked for a 24px cart icon and badge.
- **Files:** `src/components/Header.tsx`, `src/components/CartCount.tsx`
- **Status:** verified on /: both render 24×24 (computed), with a count of 1 showing. Not checked with a 2-digit count, where the badge grows wider via min-w.

### 2026-10-21 · search · Teal focus border on the search field
- **What:** The header search field's active (focus) border is now `border-primary` instead of dark ink.
- **Why:** The brand owner asked for the primary colour on its active state.
- **Files:** `src/components/SearchBar.tsx`, `CODEMAP.md`
- **Status:** verified on / by focusing the field: border rgb(1,172,159). Checkout form fields and the coupon input still focus dark.

### 2026-10-21 · layout · Use the new BabuNest main logo in the header
- **What:** The header now shows `public/logo.svg`, the yellow-and-teal BabuNest logo, cropped to the same 1567×392 box as the footer logo with its 2%-opacity stray shape dropped. It renders at 40px tall on mobile and 48px on desktop, up from 20–24px. The old `public/logo.png` is deleted.
- **Why:** New brand logo. The mark above the wordmark needs more height for the name to stay readable.
- **Files:** `public/logo.svg` (new), `public/logo.png` (deleted), `src/components/Header.tsx`, `CODEMAP.md`
- **Status:** verified on / at desktop (192×48) and 375px mobile, nothing clipped. Favicon and apple-icon are still Brownmoor's.

### 2026-10-21 · product · Teal selected state for variant options
- **What:** The selected variant option on the product page now has a teal border on a light-teal background (`primary-wash` #e6f7f5, a new token) instead of a dark border on grey. Unselected options hover to a teal border.
- **Why:** The brand owner asked for the primary colour on selected states.
- **Files:** `src/components/product/ProductBuyBox.tsx`, `src/app/globals.css`, `CODEMAP.md`
- **Status:** verified on a product with variants (computed styles). `tsc` passes.

### 2026-10-21 · layout · Bold button text and a teal card hover border
- **What:** Button text went from `font-semibold` to `font-bold` everywhere. Product cards and category tiles now show a teal `border-primary` on hover instead of a dark one.
- **Why:** The brand owner asked for bold buttons and brand-coloured hover borders.
- **Files:** the same button files as the semibold entry, `src/components/ProductCard.tsx`, `src/components/CategoryTile.tsx`, `CODEMAP.md`
- **Status:** verified on /shop: button weight 700 and a teal card border on hover (computed). `tsc` passes.

### 2026-10-21 · layout · Make all button text semibold
- **What:** Added `font-semibold` to every button's text: primary, secondary outline, card add-to-cart, pagination arrows, the hero CTA and the contact page's WhatsApp button.
- **Why:** The brand owner asked for semibold button text.
- **Files:** `src/app/{contact,order/[id]}/page.tsx`, `src/components/{Hero,Pagination,ProductCard,ProductSection}.tsx`, `src/components/cart/{CardAddToCart,CartView}.tsx`, `src/components/checkout/{CheckoutView,CouponField}.tsx`, `src/components/product/ProductBuyBox.tsx`, `CODEMAP.md`
- **Status:** verified on a product page: Add to cart and Buy now compute to weight 600. `tsc` passes.

### 2026-10-21 · layout · Make secondary buttons teal outlines
- **What:** Outline buttons now have a teal border and teal text instead of dark ones; they still fill teal with white text on hover. Covers the order page, the home-section "view all", coupon Apply and the product page's Buy now.
- **Why:** The brand owner wants secondary buttons to match the teal quantity-stepper outline.
- **Files:** `src/app/order/[id]/page.tsx`, `src/components/ProductSection.tsx`, `src/components/checkout/CouponField.tsx`, `src/components/product/ProductBuyBox.tsx`, `CODEMAP.md`
- **Status:** `tsc` passes, and the Buy now computed styles were checked on a product page.

### 2026-10-21 · cart · Make the quantity stepper outline teal
- **What:** `QuantityStepper` (the −/count/+ control that replaces Add to cart) stays an outline, now with a teal border and teal −/+ icons instead of dark ones. The count stays dark text.
- **Why:** Brand colour on the control, kept as an outline (not a filled primary button), as the brand owner asked.
- **Files:** `src/components/cart/QuantityStepper.tsx`, `CODEMAP.md`
- **Status:** verified on /shop after adding an item (border and icons rgb(1,172,159)). It also changes the stepper on the product page, cart and checkout, which share this component.

### 2026-10-21 · layout · Use the new BabuNest footer logo
- **What:** Replaced `public/logo-light.svg` with the white BabuNest logo. Its viewBox is cropped from 1672×940 to the artwork (1567×392), and a 2%-opacity duplicate shape is dropped. The footer now shows it at 44–48px tall, up from 28px.
- **Why:** New brand logo. The mark sits above the wordmark, so the old 28px height would have made the text too small to read.
- **Files:** `public/logo-light.svg`, `src/components/Footer.tsx`, `CODEMAP.md`
- **Status:** verified on /contact: it renders 192×48 with nothing clipped. The header logo is still the old one.

### 2026-10-21 · layout · Make the top bar and footer teal
- **What:** The desktop top bar in the header and the footer now use `bg-primary` (#01ac9f) instead of near-black. Footer faded-white text was lifted (/50→/80, /60→/85, /80→/90) and top-bar link hovers now go to paper/70 instead of grey, so both stay readable on teal.
- **Why:** The brand owner asked for the primary colour on the top bar and footer.
- **Files:** `src/components/Header.tsx`, `src/components/Footer.tsx`, `CODEMAP.md`
- **Status:** verified with computed styles: both are rgb(1,172,159). `tsc` passes. Not visually reviewed in a screenshot, because the preview pane would not render the footer.

### 2026-10-21 · layout · Make teal #01AC9F the button colour
- **What:** Added `primary` (#01ac9f) and `primary-hover` (#01968b) tokens. Every primary button and the active pagination page now use a teal fill with white text, and outline buttons fill teal on hover. Titles, text and the dark header, footer and banners are unchanged.
- **Why:** #01AC9F is BabuNest's primary brand colour, for buttons only.
- **Files:** `src/app/globals.css`, `src/app/order/[id]/page.tsx`, `src/components/{Pagination,ProductCard,ProductSection}.tsx`, `src/components/product/ProductBuyBox.tsx`, `src/components/cart/{CartView,CardAddToCart}.tsx`, `src/components/checkout/{CouponField,CheckoutView}.tsx`, `CODEMAP.md`
- **Status:** verified on /shop: computed fill rgb(1,172,159), white text, h1 still #111. White on teal is 2.8:1 (below WCAG AA); kept as the brand owner asked.

### 2026-10-21 · layout · Point Instagram to @babunest
- **What:** The Instagram link and label in `lib/contact.ts` are now `https://www.instagram.com/babunest/` / `@babunest`.
- **Why:** BabuNest's own Instagram account replaces Brownmoor's.
- **Files:** `src/lib/contact.ts`, `CODEMAP.md`
- **Status:** verified: the /contact page renders only the new Instagram link.

### 2026-10-21 · docs · Rename the brand from Brownmoor.com to BabuNest.com
- **What:** Every visible "Brownmoor.com" / "Brownmoor" is now "BabuNest.com" / "BabuNest". The Facebook link now points to `facebook.com/babunestbangladesh` (label BabuNest.com), and the placeholder order email is `@cod.babunest.invalid`.
- **Why:** The shop is relaunching as BabuNest.
- **Files:** `src/lib/contact.ts`, `src/app/layout.tsx`, `src/app/{contact,privacy,returns,shipping}/page.tsx`, `src/components/{Header,Footer,Hero}.tsx`, `src/components/checkout/CheckoutView.tsx`, `src/lib/feed.ts`, `src/app/globals.css`, `CODEMAP.md`
- **Status:** verified: `tsc` passes and the home and four policy pages render with 0 "Brownmoor" and the new Facebook link. Phone, email, Instagram, logo, the 'kitchenware' copy and the `brownmoor-*` localStorage keys are unchanged.

### 2026-10-20 · config · Prepare the storefront for Railway hosting
- **What:** `npm start` now listens on `$PORT` (default 3001). Removed the Vercel Blob image host from `next.config.ts`. `DEPLOYMENT.md` now covers Railway.
- **Why:** Railway hosts both apps; images are served by the backend from its volume.
- **Files:** `package.json`, `next.config.ts`, `src/lib/pixel.ts` (comment), `DEPLOYMENT.md`, `CODEMAP.md`
- **Status:** `tsc` and `npm run build` pass, and `PORT=4123 npm start` listened on 4123. Not yet deployed.

### 2026-10-20 · docs · Set up guidelines, code map and changelog for the fresh start
- **What:** Rewrote `CLAUDE.md` as short rules (read the map, log every change, keep replies to the user short) and added `CODEMAP.md`, a map of the current code. Restarted this changelog in a compact format.
- **Why:** So AI sessions read one map and the latest entries instead of re-reading the source each time, which saves tokens.
- **Files:** `CLAUDE.md`, `CODEMAP.md`, `CHANGELOG.md`
- **Status:** The map was written from a full read of the code on 2026-10-20. It is not checked by any tool and stays correct only if each change updates it.
