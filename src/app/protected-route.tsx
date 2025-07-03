import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";
import { Navigate, Outlet } from "react-router";

export function ProtectedRoute() {
  const { session } = useSession();

  if (!session) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return <Outlet />;
}

// eslint-disable-next-line react-refresh/only-export-components
export async function protectedLoader() {
  const token = await useSession.getState().refreshToken();

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return null;
}
