import { ROUTES } from "@/shared/model/routes";
import { Link } from "react-router";
import { AuthLayout } from "./auth-layout";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Register"
      description="Create an account"
      form={<form></form>}
      footer={
        <>
          Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
        </>
      }
    ></AuthLayout>
  );
}
