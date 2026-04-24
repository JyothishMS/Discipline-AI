import { useAuth } from "../context/AuthContext";

export function useAuthGuard() {
  const { user, isLoading } = useAuth();

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
}
