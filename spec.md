# MyID Vault

## Current State
New project with a fresh ICP canister backend supporting:
- Authorization with roles (admin/user/guest)
- Blob storage for document photos
- IDCard storage (collegeStudent + other types) per Principal
- User profile management

Backend uses Principal-based auth (Internet Identity).

## Requested Changes (Diff)

### Add
- Full neon dark-themed UI with animated backgrounds (curtain-style neon beams pouring top-to-bottom)
- Internet Identity login (passwordless, cross-device)
- Login/signup flow with animated welcome splash on login success
- Home screen: search bar, grid of ID cards, FAB to add new ID
- Add/Edit ID modal with category dropdown (Aadhaar, PAN, Passport, Driving Licence, Voter ID, College ID, School ID)
- Each category has its own fields + document photo upload
- Full-screen ID card viewer modal
- Settings page: security question management (stored in localStorage per principal), theme preferences, auto-lock, background selector (5 animated neon styles + upload), Contact Us section
- Amber reminder banner if security question not set
- Admin panel via #admin URL hash with password admin@myid2026: view all users, IDs, ban/unban, delete, reset profiles, stats
- Branding footer: "Made with ♥️ by Ankush Singh | Caffeine For Students" and "© 2026 All Rights Reserved"
- Orbitron font (headings), Exo 2 (body), 3D layered neon text on key headers
- Glowing effects ONLY on hover/touch - never auto-glow
- Animated page transitions, bouncy card entrances
- Top padding using env(safe-area-inset-top) for notch/camera

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Install Google Fonts (Orbitron, Exo 2) in index.html
2. Build App.tsx with Internet Identity auth flow, route management (home/settings/viewer/addEdit/admin)
3. Build AnimatedBackground component (5 neon canvas/CSS animated styles + photo upload)
4. Build LoginPage with 3D neon title, Internet Identity login button, branding footer
5. Build HomePage with search, ID card grid, FAB, recovery question reminder banner
6. Build IDCard components (grid item, full-screen viewer)
7. Build AddEditIDModal with category dropdown and per-category fields + photo upload
8. Build SettingsPage (security question, background picker, contact us)
9. Build AdminPage (accessed via #admin hash, password gate, user/ID management)
10. Wire all backend calls (getAllCards, createCollegeID, createOtherID, updateCard, deleteCard, saveCallerUserProfile, getCallerUserProfile, assignCallerUserRole)
11. Apply data-ocid markers throughout
