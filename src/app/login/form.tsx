"use client";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Checkbox,
  Button,
} from "@material-tailwind/react";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      router.push(callbackUrl);
    } catch (error: any) {}
  };

  return (
    <div className="p-10">
      <form>
        <Card className="min-w-[300px] max-w-md mx-auto">
          <CardHeader
            variant="gradient"
            color="gray"
            className="mb-4 grid h-28 place-items-center"
          >
            <Typography variant="h3" color="white">
              SAAS
            </Typography>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Input crossOrigin="" label="Email" type="email" size="lg" />
            <Input crossOrigin="" label="Password" size="lg" />
            <div className="-ml-2.5">
              <Checkbox crossOrigin="" label="Remember Me" />
            </div>
          </CardBody>
          <CardFooter className="pt-0">
            <Button variant="gradient" fullWidth>
              Sign In
            </Button>
            <Button
              onClick={() => signIn("github", { callbackUrl })}
              color="white"
              className="text-center mt-3 bg-black text-white w-full"
            >
              Github
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
