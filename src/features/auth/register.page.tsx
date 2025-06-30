import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/kit/card";
import { Link } from "react-router";

export default function RegisterPage() {
  return (
    <main className="grow flex flex-col pt-[200px] items-center">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Sign up to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form></form>
        </CardContent>
        <CardFooter>
          <p>
            Already have an account?
            <Button asChild variant={"link"}>
              <Link to={ROUTES.LOGIN}>Sign in</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
