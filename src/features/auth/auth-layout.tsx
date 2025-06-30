import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/ui/kit/card";

export function AuthLayout({
  title,
  description,
  form,
  footer,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  form: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="grow flex flex-col pt-[200px] items-center">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{form}</CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground [&_a]:underline [&_a]:text-primary ">
            {footer}
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
