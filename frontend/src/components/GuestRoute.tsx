import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Spin } from "antd";

/**
 * GuestRoute - Only allows access to unauthenticated users.
 * If user is already logged in, redirects to home page.
 */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Spin
        size="large"
        style={{ display: "flex", justifyContent: "center", marginTop: "20%" }}
      />
    );
  }

  // If user is already authenticated, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
