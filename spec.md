# MyID Vault

## Current State
- Full-stack ID vault app with multi-user local auth (username + password)
- Background is `NeonRainBackground` -- a hardcoded CSS animated neon rain beams component used in all screens (login, loading, and authenticated pages)
- `UserSettings` in `usePasswordAuth.ts` stores `theme` and `autoLock` per user
- `SettingsPage` has Account Security, Preferences (theme + auto-lock), and Contact Us sections
- App.tsx renders `NeonRainBackground` in all states (loading, login, authenticated)

## Requested Changes (Diff)

### Add
- **5 preset background images** (already generated):
  - Galaxy (`/assets/generated/bg-galaxy.dim_1080x1920.jpg`)
  - Abstract Waves (`/assets/generated/bg-waves.dim_1080x1920.jpg`)
  - City Night (`/assets/generated/bg-city.dim_1080x1920.jpg`)
  - Nature (`/assets/generated/bg-nature.dim_1080x1920.jpg`)
  - Aurora (`/assets/generated/bg-aurora.dim_1080x1920.jpg`)
- **"Background" section in SettingsPage** with:
  - A grid of preset thumbnail cards (5 presets + "Custom" option)
  - A "Upload from Gallery" button to pick an image from the device (stored as base64 in localStorage per user)
  - Currently active background highlighted with a checkmark
- **`AppBackground` component** replacing `NeonRainBackground` everywhere:
  - Reads current user's background setting
  - If `type: "neon"` (default) → renders existing `NeonRainBackground`
  - If `type: "preset"` with a preset key → renders that preset image as a fixed full-screen background with `object-fit: cover`
  - If `type: "custom"` → renders the user's uploaded base64 image as a fixed full-screen background
- **`background` field in `UserSettings`** to persist per-user choice

### Modify
- `usePasswordAuth.ts` -- extend `UserSettings` to include `background: { type: 'neon' | 'preset' | 'custom'; value?: string }` and default to `{ type: 'neon' }`
- `App.tsx` -- replace `NeonRainBackground` with `AppBackground` component, pass current user username so it can read background setting; on login screen use a neutral default since there's no user yet
- `SettingsPage.tsx` -- add a new "Background" section (between Preferences and Contact Us) with preset grid and upload button

### Remove
- Nothing removed (NeonRainBackground component kept as it is still used for the default)

## Implementation Plan
1. Extend `UserSettings` in `usePasswordAuth.ts` to include background field with default `{ type: 'neon' }`
2. Create `AppBackground.tsx` component that reads background from localStorage for the current user and renders accordingly
3. Update `App.tsx` to use `AppBackground` instead of `NeonRainBackground`, passing the username
4. Add "Background" section to `SettingsPage.tsx`:
   - Preset grid (5 presets with thumbnail images + "Default Neon" option)
   - Upload from gallery button (file input, stores base64 in localStorage)
   - Active state indicator on selected background
   - Calls `updateSettings` when changed
5. Validate and build
