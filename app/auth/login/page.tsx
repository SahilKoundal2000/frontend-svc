"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLoginHandler } from "@/hooks/useAuthHandlers";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { useEffect } from "react";

const FormSchema = z.object({
  identifier: z.string().min(2, {
    message: "Invalid Username or Email",
  }),
  password: z.string().min(8, {
    message: "Invalid Password",
  }),
});

export default function LoginForm() {
  const { handleLoginSubmit, loginError, isLoggingIn } = useLoginHandler();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // Reset form validation errors when user modifies fields
  useEffect(() => {
    const subscription = form.watch(() => {
      form.clearErrors();
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Set form error when loginError is updated
  useEffect(() => {
    if (loginError) {
      form.setError("root", {
        type: "manual",
        message: loginError,
      });
    }
  }, [loginError, form]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const success = await handleLoginSubmit(data);

    if (success) {
      toast.success("Logged in successfully");
      form.reset();
    }
  }

  return (
    <div className="w-full max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Enter your credentials</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Display form-level errors */}
              {form.formState.errors.root && (
                <div className="mb-4 p-3 text-sm bg-red-100 border border-red-200 text-red-800 rounded">
                  {form.formState.errors.root.message}
                </div>
              )}

              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem className="my-4">
                    <FormLabel>Username/Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Username/email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="my-4">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Button type="submit" disabled={isLoggingIn}>
                {isLoggingIn ? "Logging in..." : "Login"}
              </Button>
              <div className="text-sm ml-2">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="underline underline-offset-4"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
