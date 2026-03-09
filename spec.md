# MyID Vault

## Current State
The Settings page has a "Background" section with:
1. **Static image presets** (6 options): Neon Rain (CSS), Galaxy, Waves, City Night, Nature, Aurora (all using generated JPG images)
2. **Live Video Wallpapers** (5 options): Rainy Window, Northern Lights, Ocean Waves, Starry Sky, City Lights — rendered via `VideoBackground` component using external CDN video URLs
3. **Upload from Gallery** — custom photo upload

`AppBackground.tsx` handles rendering by type: `neon`, `preset`, `custom`, `video`.

## Requested Changes (Diff)

### Add
- **5 new animated canvas/CSS backgrounds** under a new "Neon & Gradient Styles" category in Settings, replacing the "Live Video Wallpapers" section. Organized into distinct style categories:
  - **Category: Animated Gradient** — "Cyber Wave" (smooth cyan-to-violet shifting gradient wave)
  - **Category: Neon Particles** — "Particle Storm" (floating glowing dots and lines on dark background, canvas-based)
  - **Category: Aurora Blobs** — "Neon Aurora" (slow-moving blurred neon blobs, CSS keyframe animation)
  - **Category: Neon Grid** — "Grid Pulse" (glowing neon grid lines that pulse/breathe)
  - **Category: Plasma Wave** — "Plasma Flow" (flowing neon plasma effect, multi-layer animated gradient)
- New `BackgroundSetting` type value: `"animated"` with a `value` string identifying the animation key (e.g. `"cyber-wave"`, `"particle-storm"`, `"neon-aurora"`, `"grid-pulse"`, `"plasma-flow"`)
- New animated background components (inline or separate file) for each of the 5 styles using CSS animations or canvas
- Thumbnail previews for each animated option in the settings grid

### Modify
- `AppBackground.tsx`: add handling for `type: "animated"` — render the appropriate animated component based on `value`
- `SettingsPage.tsx`: replace the `VIDEO_PRESETS` / "Live Video Wallpapers" section with "Neon & Gradient Styles" section. Show category labels (Animated Gradient, Neon Particles, etc.) as small subheadings. Each option gets a mini animated preview thumbnail
- `BackgroundSetting` type in `AppBackground.tsx`: add `"animated"` to the union type

### Remove
- `VideoBackground` component from `AppBackground.tsx`
- `VIDEO_SOURCES` map from `AppBackground.tsx`
- `VIDEO_PRESETS` array and `VIDEO_COLORS` map from `SettingsPage.tsx`
- `isVideo` field usage from the settings logic

## Implementation Plan
1. Update `BackgroundSetting` type in `AppBackground.tsx` to include `"animated"`
2. Create 5 animated background components as CSS/canvas animations (no external dependencies):
   - `CyberWaveBackground` — animated gradient shifting between cyan, violet, blue
   - `ParticleStormBackground` — canvas with floating glowing particles/dots
   - `NeonAuroraBackground` — CSS animated blobs with blur and neon colors
   - `GridPulseBackground` — SVG/CSS neon grid with pulsing glow keyframes
   - `PlasmaFlowBackground` — layered CSS radial gradients with rotation animation
3. Update `AppBackground.tsx`: add `animated` type branch that switches on `value` to render the correct component; remove `VideoBackground` and `VIDEO_SOURCES`
4. Update `SettingsPage.tsx`: replace video presets section with "Neon & Gradient Styles" section. Group into 5 category rows with mini inline animated thumbnail previews. Update `BgPreset` type to include `animated` type. Remove `VIDEO_PRESETS` and `VIDEO_COLORS`
5. Ensure the `handleSelectPreset` function correctly handles `type: "animated"` with a value key
