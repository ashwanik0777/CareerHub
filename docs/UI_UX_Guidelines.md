# UI/UX Style Guidelines

## 1. Visual Hierarchy and Brand Systems
The platform design leverages dark mode aesthetics with HSL-based color scales.
- **Backgrounds**: Dark zinc-950 values for high contrast.
- **Accents**: Subtle zinc-800 borders combined with clean white texts.
- **States**: High-contrast green labels for system-online status indicator badges.

## 2. Shared Component Design
Interactive elements use the `@platform/ui` package design guidelines:
- **Buttons**: Consistent hover scaling states.
- **Cards**: Clean borders without excessive shadow drops.
- **Tables**: Monospaced timestamp structures for auditable logging.

## 3. Responsive Breakpoints
Components use standard Tailwind responsive tags:
- **Mobile (`<768px`)**: Single-column form views.
- **Desktop (`>=768px`)**: Dynamic double-column layouts featuring sticky navigation sidebars.
- **Loading Indicators**: Pre-rendered skeletons prevent layouts from jumping during database hydration.
