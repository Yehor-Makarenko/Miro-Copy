import { ROUTES } from "@/shared/model/routes";
import { Link } from "react-router";
import { AuthLayout } from "./ui/auth-layout";
import LoginForm from "./ui/login-form";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Login"
      description="Sign in to your account"
      form={<LoginForm />}
      footer={
        <>
          Don't have an account? <Link to={ROUTES.REGISTER}>Sign up</Link>
        </>
      }
    />
  );
}
