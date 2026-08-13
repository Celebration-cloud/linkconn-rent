# LinkConn Rent design and interaction rules

## Product character

LinkConn Rent is a Nigeria-first rental operating system, not a classifieds
board. The interface should feel calm, direct, accountable and human. Every
important property, verification, viewing, application, lease, payment and
maintenance action must leave a clear record.

## Visual system

- Deep forest `#12372A` anchors navigation, trust and high-contrast surfaces.
- Primary green `#237A57` marks active controls and verified actions.
- Lime `#B8E36E` is reserved for decisive actions and verified emphasis.
- Warm sand `#F6F2E9` and the sand scale form the primary background family.
- Ink `#1C1C16` is the default text colour; muted copy uses `#66736C`.
- Warning, error and success states always combine colour with an icon and text.
- Manrope is loaded through `next/font`; data uses tabular numerals.
- Spacing follows an 8-point rhythm. Primary cards use 16px corners; major
  editorial frames may use 24–32px corners.
- Meaningful controls are at least 44px tall and always expose a visible focus
  state.

## Admin operations console

The administrator experience is an operator workspace, not a marketing
dashboard. It uses a compact operations-ledger grammar: white data surfaces on
the cool sand canvas, one-pixel rules instead of decorative shadows, square
corners, tabular numerals, and split list/detail arrangements that keep context
beside the current action.

- Desktop navigation is a deep-forest rail: `16rem` expanded and `4.75rem`
  collapsed. The expanded rail shows grouped labels, live queue counts and the
  administrator identity; the compact rail retains icons, accessible names,
  count dots and hover titles. The active destination uses a white field and a
  narrow forest marker. Collapse preference persists locally.
- Navigation groups are Command, Trust & Safety, Operations and Governance.
  Destinations and controls remain permission-aware; unavailable workspaces
  must not be hinted at through disabled links.
- The sticky utility header identifies the active workspace, supplies the
  `Admin / Workspace` breadcrumb, exposes urgent reviews when present and keeps
  account/security controls available without competing with the work area.
- Page headings pair a compact explanation with an optional ruled record-count
  block. Filters sit in one bordered strip. Tables, record lists, timelines,
  empty states and action panels share the same rule colour and avoid nested
  card decoration.
- Operator labels use short, factual language. Data headings and actions use
  Manrope at bold or extra-bold weights; supporting metadata uses compact muted
  text, and IDs, counts, money and dates use tabular numerals where applicable.
- Status signals always print the status text in addition to colour. Forest is
  positive or completed, amber is pending or waiting, red is failed, overdue
  or high-risk, and sand is neutral. Lime is reserved for queue counts,
  decisive focus and verified emphasis rather than large backgrounds.
- At desktop widths, queues prefer a ruled list/detail split with an anchored
  action column. On mobile, tables become scannable record blocks where needed,
  content clears the bottom utility bar, and Overview, Queues and Menu remain
  reachable. Menu opens a full-height forest navigation sheet containing every
  permitted destination and the administrator identity controls.
- Navigation and consequential controls retain visible focus treatment and a
  minimum 44px target. Sheets and account menus close with Escape; the mobile
  sheet moves focus to its close control, prevents background scrolling and
  restores prior focus on dismissal. Rail movement is limited to the grid
  transition and is disabled under `prefers-reduced-motion`.

## Generated image system

Generated assets live in `public/images/generated/linkconn/`. The canonical
metadata is in `domain/constants/linkconn-assets.ts`.

The image world uses realistic Nigerian people, attainable contemporary homes,
natural tropical light, warm sand materials and deep forest details. Images
must not contain addresses, private documents, readable screens, logos,
watermarks or embedded marketing copy.

Each manifest entry includes its semantic alt text, focal point, dominant
colour, route, motion preset and reduced-motion fallback. Copy remains HTML so
it can reflow, translate and meet contrast requirements.

The inspected delivery contains 32 project-bound PNGs: 12 horizontal homepage
stories, 12 property interiors/exteriors, four neighborhood scenes and four
tenant/landlord/operator portraits. Horizontal editorial frames are 1672×941,
property frames are 1448×1086 and portraits are 1086×1448. The manifest is the
source of truth for aspect ratio and crop behavior.

Prompt direction: documentary Nigerian rental life photographed with 24–50mm
camera language, attainable homes, natural tropical light, tactile wood,
plaster, stone and woven materials, and one consistent forest-and-sand grade.
Negative constraints on every prompt excluded embedded copy, brands,
watermarks, readable screens, documents, private addresses, impossible
architecture and staged stock-photo gestures.

## Motion

- Framer Motion is the only animation runtime.
- Primary reveals use transform and opacity with the shared
  `[0.22, 1, 0.36, 1]` easing.
- Hero image and copy move at different rates to create depth without hijacking
  scrolling.
- Content enters once as it reaches the viewport. Repeated or continuous
  movement is avoided in data-heavy workspaces.
- Hover depth is desktop-only and never required to understand or activate a
  control.
- `prefers-reduced-motion` removes parallax and translation, leaving content
  visible with at most a short opacity change.

## Map behavior and privacy

- Leaflet and React Leaflet render the client-only interactive canvas; property
  results remain usable if tiles, scripts, directions, or building data fail.
- `NEXT_PUBLIC_LEAFLET_TILE_URL` and
  `NEXT_PUBLIC_LEAFLET_TILE_ATTRIBUTION` supply production raster tiles and
  attribution. Public OpenStreetMap tiles are for local development only.
- Labels come from the configured raster tile provider. Price markers and the
  selected-property label remain in higher Leaflet panes.
- The optional pure-Leaflet building view is intentionally described as 2.5D:
  nearby OpenStreetMap footprints are projected into roofs, facades, and
  shadows without claiming camera-pitched 3D extrusion. It appears around the
  selected property from zoom level 16.
- `OVERPASS_API_URL` supplies building geometry server-side. Public Overpass is
  a local-development fallback only; production shows an honest unavailable
  state until a provider is configured.
- Exact landlord coordinates stay in `latitude` and `longitude` and are never
  included in the public property mapper.
- Public map pins use stable approximate values from `publicLatitude` and
  `publicLongitude`.
- Properties without verified public coordinates appear in the results list
  with a clear unmapped explanation. They are never assigned invented pins.
- Bounds searches preserve all active query filters and support cancellation so
  older responses cannot overwrite newer searches.
- Desktop uses a split list/map view. Mobile has an explicit list/map switch and
  an accessible results bottom sheet.
- Every pin interaction has an equivalent list button and live status message.

## Content rules

- Use Nigerian locations, phone formats and NGN pricing.
- Always show total move-in cost next to rent.
- Every charge needs a specific label and explanation; never use
  “miscellaneous”.
- Say “Protected Payment”; do not claim escrow.
- Reviews require completed platform interactions.
- Public property locations remain approximate until the approved workflow
  releases an exact address.
- Errors explain what happened and offer one recovery action.

## Responsive handoff

- Mobile reference viewport: 390px, four-column mental grid.
- Tablet reference viewport: 1024px, eight-column mental grid.
- Desktop reference viewport: 1440px, twelve-column mental grid.
- Images use `next/image`, explicit aspect ratios and responsive `sizes`.
- Navigation, search, map, forms and primary actions remain reachable without
  hover.

## Acceptance

Run `npm run typecheck`, `npm test`, `npm run build` and Playwright journeys.
Verify the live map in a browser at 390px, 1024px and 1440px. A successful
compile alone does not prove map functionality.
