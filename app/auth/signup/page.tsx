"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRegisterHandler } from "@/hooks/useAuthHandlers";
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
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { DatePicker } from "@/components/ui/date-picker";
import { useMask } from "@react-input/mask";

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password: string) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
    password
  );
};

const isValidPhone = (phone: string) => {
  return /^\d{10,}$/.test(phone.replace(/[^0-9]/g, ""));
};

const isValidPostalCode = (postalCode: string) => {
  return /^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$/.test(postalCode);
};

const FormSchema = z
  .object({
    first_name: z.string().min(1, { message: "First name is required" }),
    last_name: z.string().min(1, { message: "Last name is required" }),
    username: z.string().min(1, { message: "Username is required" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .refine(isValidEmail, { message: "Invalid email format" }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .refine(isValidPassword, {
        message:
          "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a digit, and a special character",
      }),
    confirm_password: z
      .string()
      .min(1, { message: "Confirm password is required" }),
    phone: z
      .string()
      .min(1, { message: "Phone number is required" })
      .refine(isValidPhone, { message: "Invalid phone number format" }),
    city: z.string().min(1, { message: "City is required" }),
    country: z.string().min(1, { message: "Country is required" }),
    province: z.string().min(1, { message: "Province is required" }),
    postal_code: z
      .string()
      .min(1, { message: "Postal code is required" })
      .refine(isValidPostalCode, {
        message: "Invalid postal code format (e.g., A1A 1A1)",
      }),
    street_line1: z.string().min(1, { message: "Street line 1 is required" }),
    street_line2: z.string().optional(),
    date_of_birth: z
      .date()
      .max(new Date(), { message: "Date of birth must be in the past" }),
    toc: z.boolean().refine((value) => value, {
      message: "You must agree to the terms and conditions.",
    }),
  })
  .superRefine(({ confirm_password, password }, ctx) => {
    if (confirm_password !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirm_password"],
      });
    }
  });

type RegisterRequestData = Omit<
  z.infer<typeof FormSchema>,
  "toc" | "confirm_password"
>;

export default function RegisterForm() {
  const router = useRouter();
  const { handleRegisterSubmit, registerError, fieldErrors, isRegistering } =
    useRegisterHandler();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      phone: "",
      city: "",
      country: "",
      province: "",
      postal_code: "",
      street_line1: "",
      street_line2: "",
      date_of_birth: undefined,
      toc: false,
    },
    mode: "onTouched",
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      form.clearErrors();
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (Object.keys(fieldErrors).length > 0) {
      Object.entries(fieldErrors).forEach(([field, message]) => {
        form.setError(field as keyof z.infer<typeof FormSchema>, {
          type: "manual",
          message: message,
        });
      });
    }
  }, [fieldErrors, form]);

  useEffect(() => {
    if (registerError) {
      form.setError("root", {
        type: "manual",
        message: registerError,
      });
    }
  }, [registerError, form]);

  const validateStep = async () => {
    let fieldsToValidate: (keyof z.infer<typeof FormSchema>)[] = [];

    if (step === 1) {
      fieldsToValidate = ["first_name", "last_name", "username", "email"];
    } else if (step === 2) {
      fieldsToValidate = [
        "password",
        "confirm_password",
        "phone",
        "date_of_birth",
      ];
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await validateStep();
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const requestData: RegisterRequestData = {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        email: data.email,
        password: data.password,
        phone: data.phone,
        city: data.city,
        country: data.country,
        province: data.province,
        postal_code: data.postal_code,
        street_line1: data.street_line1,
        street_line2: data.street_line2,
        date_of_birth: data.date_of_birth,
      };
      const success = await handleRegisterSubmit({
        ...requestData,
        date_of_birth: requestData.date_of_birth.toISOString(),
      });

      if (success) {
        form.reset();
        router.push("/auth/login");
        toast.success("Account registered successfully");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      toast.error("Error registering account", {
        description: errorMessage,
      });
    }
  }

  const phoneMask = useMask({
    mask: "+1 (___) ___-____",
    replacement: { _: /\d/ },
  });

  const postalCodeMask = useMask({
    mask: "A0A 0A0",
    replacement: { A: /[A-Za-z]/, 0: /\d/ },
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Register</CardTitle>
              <CardDescription>Register new customer account</CardDescription>
              <Progress value={(step / totalSteps) * 100} className="mt-2" />
              <div className="text-sm text-center mt-2">
                Step {step} of {totalSteps}:{" "}
                {step === 1
                  ? "Basic Information"
                  : step === 2
                  ? "Security & Contact"
                  : "Address Details"}
              </div>
            </CardHeader>
            <CardContent>
              {/* Display form-level errors */}
              {form.formState.errors.root && (
                <div className="mb-4 p-3 text-sm bg-red-100 border border-red-200 text-red-800 rounded">
                  {form.formState.errors.root.message}
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
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
                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm Password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl ref={phoneMask}>
                            <Input
                              placeholder="Phone"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <DatePicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="street_line1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Line 1</FormLabel>
                        <FormControl>
                          <Input placeholder="Street Line 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="street_line2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Line 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Street Line 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Province</FormLabel>
                        <FormControl>
                          <Input placeholder="Province" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl ref={postalCodeMask}>
                          <Input placeholder="A1A 1A1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="toc"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to the{" "}
                              <Link href="/terms" className="underline">
                                Terms and Conditions
                              </Link>
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4">
                {step < totalSteps ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isRegistering}>
                    {isRegistering ? "Registering..." : "Register"}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
