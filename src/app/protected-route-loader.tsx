import { enableMocking } from "@/shared/api/mocks";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";
import { Navigate } from "react-router";

export async function protectedLoader() {
  await enableMocking();
  const token = await useSession.getState().refreshToken();

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return null;
}
