---
name: Linkcon Rent Narrative
colors:
  surface: '#fdf9f0'
  surface-dim: '#dddad1'
  surface-bright: '#fdf9f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ea'
  surface-container: '#f1eee5'
  surface-container-high: '#ece8df'
  surface-container-highest: '#e6e2d9'
  on-surface: '#1c1c16'
  on-surface-variant: '#3f4943'
  inverse-surface: '#31302b'
  inverse-on-surface: '#f4f0e7'
  outline: '#6f7a72'
  outline-variant: '#bec9c1'
  surface-tint: '#0c6c4a'
  primary: '#006041'
  on-primary: '#ffffff'
  primary-container: '#237a57'
  on-primary-container: '#b1ffd6'
  inverse-primary: '#84d7ae'
  secondary: '#416656'
  on-secondary: '#ffffff'
  secondary-container: '#c1e9d5'
  on-secondary-container: '#466a5b'
  tertiary: '#3f5d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#537707'
  on-tertiary-container: '#d2fe85'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a0f4c9'
  primary-fixed-dim: '#84d7ae'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#c3ebd8'
  secondary-fixed-dim: '#a8cfbd'
  on-secondary-fixed: '#002116'
  on-secondary-fixed-variant: '#2a4e3f'
  tertiary-fixed: '#c5f17a'
  tertiary-fixed-dim: '#aad461'
  on-tertiary-fixed: '#131f00'
  on-tertiary-fixed-variant: '#354e00'
  background: '#fdf9f0'
  on-background: '#1c1c16'
  surface-variant: '#e6e2d9'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  price-display:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '800'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is built on a foundation of **Modern Reliability**. It captures the essence of the Nigerian real estate market by balancing "Institutional Trust" with "Human Approachability." The style moves away from the cold, sterile aesthetics of fintech and the volatile energy of crypto, opting instead for a grounded, architectural feel.

The aesthetic utilizes **Modern Minimalism** with a focus on high-quality typography and a rich, nature-inspired palette. It emphasizes clarity and transparency through structured information hierarchy, ensuring that complex rental processes feel manageable and safe. The UI evokes a sense of permanence and growth, reflecting the significance of finding a home.

## Colors

The palette is anchored by **Deep Forest (#12372A)** and **Primary Green (#237A57)**, colors that symbolize stability and prosperity. To avoid a heavy institutional feel, **Warm Sand (#F6F2E9)** is used as the primary background surface, providing a softer, more organic canvas than pure white.

**Fresh Accent (#B8E36E)** is used sparingly for high-visibility highlights and interactive cues that signify progress or "newness." Text remains high-contrast for accessibility, using **Dark Text (#17201C)** for primary information and **Muted Text (#66736C)** for supporting metadata.

## Typography

This design system uses **Manrope** exclusively to maintain a cohesive, modern sans-serif identity. The type hierarchy is intentionally bold; headings use tight letter-spacing and heavy weights to command attention and convey authority.

Price labels are treated as a distinct "Price-Display" style, utilizing an extra-bold weight to ensure financial clarity. Body text is optimized for long-form reading during contract reviews, with generous line heights. Labels and captions use medium-to-semibold weights to remain legible even at smaller scales.

## Layout & Spacing

The layout is governed by a **strict 8pt grid system**. A 12-column fluid grid is used for desktop environments, transitioning to a single-column flow on mobile.

The philosophy focuses on **Vertical Rhythm** and "Stacking." Elements like property cards and input groups are separated by `stack-lg` (32px) to provide breathing room and prevent information overload. Internal component spacing (padding) consistently uses `stack-md` (16px) to maintain a sense of density and structure.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** rather than dramatic shadows. Surfaces primarily use **Warm Sand** or **White** to differentiate "the floor" from "the content."

- **Level 0 (Background):** Warm Sand (#F6F2E9).
- **Level 1 (Cards/Containers):** White (#FFFFFF) with a 1px border (#E2E8E5).
- **Level 2 (Active/Floating):** White (#FFFFFF) with a subtle, ultra-diffused shadow (0px 4px 20px rgba(18, 55, 42, 0.08)).

This approach ensures the UI feels tactile and layered without adopting the "floaty" look of modern SaaS or the heavy skeuomorphism of older apps.

## Shapes

The shape language is defined by a **consistent 16px corner radius** (`rounded-lg`) for all primary containers, property cards, and buttons. This "Rounded" approach softens the professional tone, making the platform feel welcoming. Smaller elements like tags, badges, and checkboxes use a `rounded-sm` (4px) or `rounded-md` (8px) to maintain a sharper, more precise feel for data-heavy elements.

## Components

### Verification Badges

Badges use a "pill" shape with a background tint of the Primary Green at 10% opacity. They include a small checkmark icon and the specific label (Identity, Property, or Landlord). For high-level trust, use a "Verified" badge with the **Fresh Accent** text to draw immediate attention.

### Total Move-in Cost Card

This card uses a subtle border-bottom for each line item (Caution Fee, Legal, Agency, Rent). The "Total" line should be highlighted using a background of **Deep Forest** with **White** text to signify finality and importance.

### Rent Toggle

A segmented control with a sliding background. The active state uses **Primary Green**, while the inactive text remains **Muted Text**. The toggle should clearly switch the "Price-Display" across all property cards instantly.

### Property Cards

Cards are White containers with 16px radii and a 1px border. Image carousels occupy the top half. The bottom half contains the Price-Display, Location, and a "Response Time" label (e.g., "Replies in < 2 hrs") in **Muted Text** to manage tenant expectations.

### Form Inputs

Custom inputs designed for the Nigerian market:

- **Phone Inputs:** Prefixed with the +234 flag and code as a non-editable prefix.
- **Currency Inputs:** Prefixed with the Naira (₦) symbol in a bold weight.
- **Focus States:** A 2px solid border in **Primary Green** with no outer glow.

### Timeline & Progress Steppers

Vertical steppers for rental applications. Completed steps use **Primary Green** with a check icon. The "Active" step uses a pulsed **Fresh Accent** dot. Connecting lines are 2px wide in **Deep Forest** (20% opacity).
