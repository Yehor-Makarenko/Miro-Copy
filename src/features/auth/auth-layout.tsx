import { ROUTES } from "@/shared/model/routes";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/ui/kit/card";
import { Link } from "react-router";

export function AuthLayout() {
  return (
    <main className="grow flex flex-col pt-[200px] items-center">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form></form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground ">
            Don't have an account?{" "}
            <Link className="underline text-primary" to={ROUTES.REGISTER}>
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
