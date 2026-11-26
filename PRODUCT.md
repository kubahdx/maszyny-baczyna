# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Owners and operators of small band sawmills (traki taśmowe) and sawmill service workers, mostly men aged 40-60, in Poland and in neighbouring EU markets (Slovakia, Czechia, Lithuania, Latvia, Estonia, Romania, Bulgaria; English as a fallback). They need a specific replacement or upgrade wheel for their machine, want to see exactly what is included and what it costs, and then phone or WhatsApp the maker. Devices are mixed: phone and desktop in roughly equal measure.

## Product Purpose
A brochure and price-list site for Maszyny Baczyna (Robert Boba), a small maker of wheels for band sawmills. It is NOT an online shop: no cart, no online payment. Visitors read the offer, price a wheel or a set with a live calculator, and contact the maker; ordering, availability and lead time are settled only by phone, WhatsApp or e-mail. Success is a visitor who knows exactly which wheel or set fits and contacts the maker with a precise request.

## Positioning
A one-person workshop that makes the wheels itself: balanced free and drive wheels with a poly-V belt, ready to mount, with ready-made S355 axles available, priced openly instead of "ask for a quote".

## Operating Context
- Wheels are bought either singly or as a set (free wheel + drive wheel). A set is NOT a promotion: customers often need only one wheel, so no "cheaper in a set" messaging.
- The calculator output is sent to the owner as a Polish WhatsApp/e-mail message regardless of the site language.
- Contact priority: phone / WhatsApp first, e-mail last (rarest).
- The site is available in 9 languages (PL, EN, SK, CS, LT, LV, ET, RO, BG), switched in the menu bar with flags.

## Capabilities and Constraints
- Static site: HTML + CSS + vanilla JS, no build step. Translation lives in `i18n.js`, product prices in `script.js` and as `data-price` in `index.html`.
- Product data (single source of truth): free wheel 1150 zł (2x 6208 2RS C3 + W80, 6PK1500, balanced, for a Ø40 axle); drive wheel with keyway 1000 zł (Ø40.00 bore, 10 mm keyway, 6PK1500, balanced, no bearings, mounts on the sawmill's drive axle); combined drive wheel Ø165 1500 zł and Ø330 1600 zł (3x 6208 2RS C3 + W80, 6PK1500, pulley pressed in + 6 screws, 2x B-17 V-belts, blade up to 50 mm, 40 mm recommended); sets nr 1 2100 / nr 2 2500 / nr 3 2600 zł; S355 axles 45x45 mm, 285-305 mm, Z40 ring: 230 zł (free wheel) and 240 zł (combined wheels); no axle for the set-1 drive wheel.
- Only the free wheel and the keyway drive wheel are stated to be balanced ("wyważone"); do not claim it for the combined wheels.
- The client is on VAT 0 (told 2026-11-25): prices are final, no VAT is added. Do not write "brutto", "netto" or "z VAT"; exact legal wording (e.g. exemption basis) not confirmed.
- Regeneration and balancing of customers' wheels: Robert asked to rank for these phrases (2026-11-26), so `/regeneracja-kol-do-traka/` says the service exists, with no price, method or lead time. Process details, price and whether wheels can be shipped are not confirmed; add them only when the client gives them.
- Undecided, pending client confirmation: shipping terms for foreign customers, final e-mail (placeholder in the Contact section); phone is +48 725 509 600.
- Company: Maszyny Baczyna, Robert Boba, Baczyna 15A, 26-200 Końskie, Poland, NIP 6121216038.

## Brand Commitments
Binding, confirmed by the client: green colour scheme (never orange), a look that is not "too modern" and does not read as AI-generated, and an audience of men aged 40-60. Every product image slot must accept the client's own photo (files go to `zdjecia/`), and the design must hold without them.

## Evidence on Hand
No real photos yet (`zdjecia/` is empty; the client has photos of every item and will add them). Drawings in the page are illustrative SVGs. No testimonials, customer lists, certificates or benchmarks exist: do not invent any.

## Product Principles
1. The price and what is included are always visible; nothing is hidden behind "contact us".
2. Contact is a phone call or a WhatsApp message first; the site never pretends to be a shop.
3. Technical facts are stated exactly as the client gave them; never add a claim that was not confirmed.
4. Legibility for 40-60-year-old workshop users comes before decoration: large type, big tap targets, strong contrast.
5. Every language gets the same complete page; longer translations must never break the layout.

## Accessibility & Inclusion
Readable at arm's length on a phone in a workshop: large body text, contrast of at least 4.5:1, tap targets of at least 44 px, visible focus, keyboard-operable language menu and calculator. Texts expand 30-40% in some languages.
