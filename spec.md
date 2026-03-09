# MyID Vault

## Current State
The app uses ICP's Internet Identity (passwordless biometric login) via `useInternetIdentity` hook. `App.tsx` imports and uses `useInternetIdentity`, and `LoginPage.tsx` shows a "Login with Internet Identity" button. The `usePasswordAuth` hook already exists with full username/password logic including signup, security questions, forgot password, settings, and admin helpers.

## Requested Changes (Diff)

### Add
- Username + password login/signup UI in LoginPage (tabs: Login / Sign Up)
- Forgot password flow (3 steps: enter username, answer security question, set new password)
- Session persistence via localStorage (stays logged in between visits)
- Login success animation (welcome splash, checkmark, transition to vault)

### Modify
- `App.tsx`: Replace `useInternetIdentity` with `usePasswordAuth`. Auth state driven by `user` (AuthUser | null) and `isInitializing`. Pass `loginWithPassword`, `signUp`, `logout` down to LoginPage. Display `user.name` as the vault owner name.
- `LoginPage.tsx`: Replace Internet Identity button with tabbed username+password form (Login tab + Sign Up tab). Include forgot password link. No external redirects. All logic via props passed from App.

### Remove
- All references to `useInternetIdentity` in App.tsx
- Internet Identity branding, "Login with Internet Identity" button, and "What is Internet Identity?" info box from LoginPage

## Implementation Plan
1. Rewrite `App.tsx` to use `usePasswordAuth` instead of `useInternetIdentity`. Auth state: `user` (AuthUser | null), `isInitializing`. Pass auth callbacks as props to LoginPage.
2. Rewrite `LoginPage.tsx` with:
   - Animated tab switcher (Login / Sign Up)
   - Login form: username, password (show/hide), submit, error display, forgot password link
   - Sign Up form: name, username, password, confirm password, security question, answer
   - Forgot Password flow: step 1 enter username, step 2 answer security question, step 3 new password
   - Login success animation before transitioning to home
   - Footer with Ankush Singh signature
3. Keep all other pages (HomePage, SettingsPage, AdminPage, AddCardPage, CardViewerPage) unchanged.
4. Validate (typecheck + build) and deploy.
