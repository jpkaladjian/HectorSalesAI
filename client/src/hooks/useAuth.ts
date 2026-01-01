import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
  isAdmin: string;
  isActive: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnMount: true,
  });

  // If we get a 401 error, user is explicitly not authenticated
  const isUnauthenticated = error ? isUnauthorizedError(error as Error) : false;
  
  // User is authenticated if we have user data and no 401 error
  const isAuthenticated = !!user && !isUnauthenticated;

  return {
    user,
    isLoading,
    isAuthenticated,
    isUnauthenticated,
  };
}
