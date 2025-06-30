import { ROUTES } from "@/shared/model/routes";
import { Link } from "react-router";
import { AuthLayout } from "./auth-layout";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Login"
      description="Sign in to your account"
      form={<form></form>}
      footer={
        <>
          Don't have an account? <Link to={ROUTES.REGISTER}>Sign up</Link>
        </>
      }
    />
  );
}
