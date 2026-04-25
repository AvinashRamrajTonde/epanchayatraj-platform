import { Navigate } from "react-router";
import { useCitizenAuthStore } from "../store/citizenAuthStore";

interface CitizenProtectedRouteProps {
  children: React.ReactNode;
}

export default function CitizenProtectedRoute({ children }: CitizenProtectedRouteProps) {
  const { isAuthenticated, needsRegistration } = useCitizenAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/citizen/login" replace />;
  }

  if (needsRegistration) {
    return <Navigate to="/citizen/register" replace />;
  }

  return <>{children}</>;
}
