---
name: Precision Radiance
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
  laboratory-white: '#F8FAFC'
  cobalt-deep: '#1E3A8A'
  safety-blue: '#3B82F6'
  neutral-ice: '#E2E8F0'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  technical-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
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
  gutter: 32px
  section-padding: 120px
  card-gap: 24px
---

## Brand & Style

This design system targets the intersection of rigorous scientific research and cutting-edge radiological safety. The brand personality is **authoritative, microscopic in its attention to detail, yet futuristic and accessible.** It aims to evoke a sense of absolute sterility and technical mastery.

The design style is a hybrid of **Minimalism** and **Glassmorphism**. It utilizes expansive white space to denote cleanliness, paired with translucent glass-like layers and blurred backdrops that suggest depth and high-tech instrumentation. The visual language moves away from standard "flat" corporate aesthetics into a layered, multi-dimensional environment that reflects the complexity of radioanalytical science.

**Key Visual Principles:**
- **Clinical Precision:** Every alignment must be mathematically exact, following a strict grid to represent scientific accuracy.
- **Micro-interactions:** Use subtle, smooth transitions that mimic the precision of laboratory equipment.
- **Atmospheric Depth:** Employ blurred photographic backgrounds (scientists, laboratory apparatus) with frosted glass overlays to keep content readable while maintaining a high-end environmental feel.

## Colors

The palette is anchored in a professional, medical-grade blue spectrum. The **Primary Blue** is derived from the brand’s core logo, representing trust and technological prowess. This is balanced by **Secondary Deep Navy**, which provides the grounding necessary for a high-end, authoritative brand.

- **Primary (#2563EB):** Used for primary CTAs, active states, and brand-identifying icons.
- **Secondary (#0F172A):** Used for deep backgrounds, heavy headings, and footer containers.
- **Neutral / Ice:** A series of cool-toned grays and near-whites used to maintain a "clean-room" aesthetic without the harshness of pure black or standard white.
- **Glass Accents:** Translucent variations of these blues are used for container backgrounds to create the glassmorphic depth effect.

## Typography

The typography strategy emphasizes **hierarchy and technical clarity.**

**Manrope** is used for headlines to provide a modern, balanced, and premium feel. Its geometric nature aligns with the themes of precision and structure. **Inter** is chosen for body text due to its exceptional legibility in dense informational contexts, such as test results or technical descriptions. 

A unique addition to this system is **JetBrains Mono**, used for labels, technical identifiers (e.g., Isotope names like Cs-134), and metadata. This monospaced font reinforces the "laboratory report" and "scientific instrument" aesthetic, signaling accuracy and data-driven results.

Use tight tracking for large headlines to create a sophisticated editorial look, and generous line-heights for body text to ensure readability of complex technical lists.

## Layout & Spacing

This design system utilizes a **12-column fixed-grid system** for desktop to maintain a highly structured, professional appearance. 

The spacing rhythm is generous, following an 8px base unit. Large section paddings (120px+) are used to separate major content areas, creating a sense of "premium room" that avoids the cluttered look of standard industrial websites.

**Responsive Behavior:**
- **Desktop:** 12 columns, 32px gutters, 80px margins.
- **Tablet:** 8 columns, 24px gutters, 40px margins.
- **Mobile:** 4 columns, 16px gutters, 20px margins.

Technical lists (e.g., "Our Scope") should be organized in multi-column layouts on desktop to reduce vertical scrolling, using subtle horizontal dividers to maintain row-level legibility.

## Elevation & Depth

Visual hierarchy is established through a **Glassmorphism** model combined with **Ambient Shadows**.

1.  **Base Layer:** The "Laboratory Floor" is a clean, solid background (usually `#F8FAFC`).
2.  **Surface Layer:** Cards and primary containers use a frosted-glass effect—semi-transparent white (`rgba(255, 255, 255, 0.7)`) with a 20px backdrop-blur. 
3.  **Depth Indicators:** Instead of heavy shadows, use extremely diffused, low-opacity blue-tinted shadows (`rgba(15, 23, 42, 0.08)`) to give the impression of elements floating above a surface.
4.  **Outlines:** Use 1px ultra-thin borders in `#E2E8F0` or semi-transparent white to define edges without adding visual weight.

## Shapes

The shape language is **"Rounded Precision."** Elements utilize a 0.5rem (8px) base radius. This is soft enough to feel modern and welcoming, yet sharp enough to maintain a professional, scientific edge. 

- **Primary Cards:** Use `rounded-lg` (16px) to emphasize the containerized nature of laboratory modules.
- **Action Elements:** Buttons and input fields follow the base 8px radius.
- **Technical Badges:** Chips and isotope labels may use the "Pill" style to differentiate them from standard structural blocks.

## Components

### Buttons
- **Primary:** Solid `#2563EB` with white text. High-contrast, bold weight. Features a subtle "glow" on hover using a primary-colored shadow.
- **Secondary:** Outlined with a 1px border. Background uses a subtle glass blur.
- **Icon-Link:** For technical downloads, use a primary blue icon with the technical-data font weight.

### Cards
- **Laboratory Module:** Features a frosted glass background, 16px border-radius, and a thin top-border in primary blue to denote category.
- **Service Grid:** High-resolution imagery with a text overlay at the bottom, using a gradient fade for legibility.

### Form Fields
- **Online Appointment:** Inputs are ultra-clean with no background (just a bottom border or 1px outline). They glow subtly blue when focused.
- **Labels:** Always use the monospaced `label-caps` font style sitting above the field.

### Technical Data Lists
- **Scope Tables:** Alternate row backgrounds with `neutral-ice` at 20% opacity. Use primary blue for the scientific nomenclature to draw the eye to the specific isotopes or materials being tested.

### Glass Navigation
- A "sticky" top bar using a 40px backdrop blur. This ensures the site feels modern as the user scrolls through professional clinical imagery.
