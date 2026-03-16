import { usePasswordAuth } from "./usePasswordAuth";

export function useLogin() {
  const auth = usePasswordAuth();
  return {
    isLoggedIn: auth.isLoggedIn,
    login: auth.login,
    logout: auth.logout,
    principal: auth.user?.username ?? null,
    isInitializing: auth.isInitializing,
    loginStatus: auth.isLoggedIn ? "success" : "idle",
    currentUser: auth.currentUser,
    auth,
  };
}
