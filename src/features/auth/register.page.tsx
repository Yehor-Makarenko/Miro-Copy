import { ROUTES } from "@/shared/model/routes";
import { Link } from "react-router";
import { AuthLayout } from "./ui/auth-layout";
import RegisterForm from "./ui/register-form";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Register"
      description="Create an account"
      form={<RegisterForm />}
      footer={
        <>
          Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
        </>
      }
    ></AuthLayout>
  );
}
