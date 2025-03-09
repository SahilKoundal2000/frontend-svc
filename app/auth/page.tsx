"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/authContext";
import { useLoginHandler, useSignupHandler } from "@/hooks/useAuthHandlers";
import Loading from "@/components/ui/loading";
import Logo from "@/components/ui/logo";
import { InputMask } from "@react-input/mask";

type SignupFormData = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  country: string;
  province: string;
  postal_code: string;
  street_line1: string;
  street_line2: string;
  date_of_birth: string;
};

type FormField = {
  label: string;
  name: keyof SignupFormData;
  type?: string;
};

const initialSignupData: SignupFormData = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  city: "",
  country: "",
  province: "",
  postal_code: "",
  street_line1: "",
  street_line2: "",
  date_of_birth: "",
};

const fieldNameMapping: Record<string, keyof SignupFormData> = {
  dateOfBirth: "date_of_birth",
  streetLine1: "street_line1",
  streetLine2: "street_line2",
  postalCode: "postal_code",
  firstName: "first_name",
  lastName: "last_name",
};

export default function LoginSignupPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const { handleLoginSubmit, loginError } = useLoginHandler();

  const [signupStep, setSignupStep] = useState(1);
  const [signupData, setSignupData] =
    useState<SignupFormData>(initialSignupData);
  const { handleSignupSubmit, signupError, signupSuccess } = useSignupHandler();

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (token) {
      router.push("/");
    }
  }, [token, router]);

  useEffect(() => {
    if (signupSuccess) {
      setSignupData(initialSignupData);
      setFieldErrors({});
    }
  }, [signupSuccess]);

  useEffect(() => {
    if (signupError) {
      try {
        const errorObj =
          typeof signupError === "string"
            ? JSON.parse(signupError)
            : signupError;

        if (errorObj.details) {
          const errors: Record<string, string> = {};

          Object.entries(errorObj.details).forEach(([key, value]) => {
            const formField = fieldNameMapping[key] || key;
            errors[formField] = value as string;
          });

          setFieldErrors(errors);
        } else {
          setFieldErrors({});
        }
      } catch {
        setFieldErrors({});
      }
    } else {
      setFieldErrors({});
    }
  }, [signupError]);

  if (token) {
    return <Loading />;
  }

  const onLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await handleLoginSubmit(loginIdentifier, loginPassword);
  };

  const onSignupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (signupStep === 1) {
      setSignupStep(2);
    } else {
      await handleSignupSubmit(signupData);
    }
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as SignupFormData)
    );

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(
      (prev) =>
        ({
          ...prev,
          [name]: value.toUpperCase(),
        } as SignupFormData)
    );

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const step1Fields: FormField[] = [
    { label: "First Name", name: "first_name" },
    { label: "Last Name", name: "last_name" },
    { label: "Username", name: "username" },
    { label: "Email", name: "email", type: "email" },
    { label: "Password", name: "password", type: "password" },
  ];

  const step2Fields: FormField[] = [
    { label: "Phone", name: "phone" },
    { label: "Date of Birth", name: "date_of_birth", type: "date" },
    { label: "Street Line 1", name: "street_line1" },
    { label: "Street Line 2", name: "street_line2" },
    { label: "City", name: "city" },
    { label: "Province", name: "province" },
    { label: "Country", name: "country" },
    { label: "Postal Code", name: "postal_code" },
  ];

  const getGeneralErrorMessage = () => {
    if (!signupError) return null;

    try {
      const errorObj =
        typeof signupError === "string" ? JSON.parse(signupError) : signupError;

      return errorObj.type === "VALIDATION_ERROR"
        ? "Please correct the errors above"
        : errorObj.message;
    } catch {
      return signupError;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center auth-background px-4 py-8">
      <div className="fixed inset-0 bg-black opacity-60 z-0"></div>
      <div className="flex items-center justify-center p-4 z-10 w-full">
        <Tabs
          defaultValue="login"
          className="w-full max-w-[580px] bg-white p-4 sm:p-6 rounded-lg shadow-md"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Signup</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form
              onSubmit={onLoginSubmit}
              className="space-y-4 max-h-[600px] sm:h-[620px] flex flex-col justify-center"
            >
              <div className="flex justify-center">
                <Logo variant="rectangle" size={60} />
              </div>
              <h3 className="text-lg font-medium">Login Credentials</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter your email or username"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
              </div>
              {loginError && (
                <p className="text-red-500 text-sm">{loginError}</p>
              )}
              <button
                type="submit"
                className="w-full bg-teal-400 text-white py-2 rounded-md hover:bg-teal-500 transition-colors"
              >
                Login
              </button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form
              onSubmit={onSignupSubmit}
              className="space-y-4 max-h-[600px] sm:h-[620px] flex flex-col justify-center overflow-y-auto"
            >
              {signupStep === 1 ? (
                <>
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {step1Fields.map(({ label, name, type = "text" }) => (
                      <div
                        key={name}
                        className={
                          name === "email" || name === "password"
                            ? "col-span-1 sm:col-span-2"
                            : ""
                        }
                      >
                        <label className="block text-sm font-medium text-gray-700">
                          {label}
                        </label>
                        <input
                          type={type}
                          name={name}
                          value={signupData[name]}
                          onChange={handleSignupChange}
                          placeholder={label}
                          className={`mt-1 block w-full border ${
                            fieldErrors[name]
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md p-2`}
                          required
                        />
                        {fieldErrors[name] && (
                          <p className="text-red-500 text-xs mt-1">
                            {fieldErrors[name]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-teal-400 text-white py-2 rounded-md hover:bg-teal-500 transition-colors"
                  >
                    Next
                  </button>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Additional Information
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="text-teal-500 hover:text-teal-600 text-sm"
                    >
                      Back
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {step2Fields.map(({ label, name, type = "text" }) => (
                      <div
                        key={name}
                        className={
                          name === "street_line1" || name === "street_line2"
                            ? "col-span-1 sm:col-span-2"
                            : ""
                        }
                      >
                        <label className="block text-sm font-medium text-gray-700">
                          {label}
                        </label>

                        {name === "phone" ? (
                          <>
                            <InputMask
                              mask="+1 (___) ___-____"
                              replacement={{ _: /\d/ }}
                              type="text"
                              name="phone"
                              value={signupData.phone}
                              onChange={handleSignupChange}
                              placeholder="(123) 456-7890"
                              className={`mt-1 block w-full border ${
                                fieldErrors[name]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md p-2`}
                              required
                            />
                            {fieldErrors[name] && (
                              <p className="text-red-500 text-xs mt-1">
                                {fieldErrors[name]}
                              </p>
                            )}
                          </>
                        ) : name === "postal_code" ? (
                          <>
                            <InputMask
                              mask="A0A 0A0"
                              replacement={{ A: /[A-Za-z]/, 0: /\d/ }}
                              type="text"
                              name="postal_code"
                              value={signupData.postal_code}
                              onChange={handlePostalCodeChange}
                              placeholder="A1B 2C3"
                              className={`mt-1 block w-full border ${
                                fieldErrors[name]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md p-2`}
                              required
                            />
                            {fieldErrors[name] && (
                              <p className="text-red-500 text-xs mt-1">
                                {fieldErrors[name]}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <input
                              type={type}
                              name={name}
                              value={signupData[name]}
                              onChange={handleSignupChange}
                              placeholder={label}
                              className={`mt-1 block w-full border ${
                                fieldErrors[name]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md p-2`}
                              required={name !== "street_line2"}
                            />
                            {fieldErrors[name] && (
                              <p className="text-red-500 text-xs mt-1">
                                {fieldErrors[name]}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {getGeneralErrorMessage() && (
                    <p className="text-red-500 text-sm">
                      {getGeneralErrorMessage()}
                    </p>
                  )}
                  {signupSuccess && (
                    <p className="text-green-500 text-sm">{signupSuccess}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-teal-400 text-white py-2 rounded-md hover:bg-teal-500 transition-colors"
                  >
                    Signup
                  </button>
                </>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
