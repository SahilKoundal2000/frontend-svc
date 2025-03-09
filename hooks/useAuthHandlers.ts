"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

export const useLoginHandler = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLoginSubmit = async (identifier: string, password: string) => {
    setLoginError(null);
    try {
      await login(identifier, password);
      router.push("/");
    } catch (error: any) {
      setLoginError(error.response.data);
    }
  };

  return { handleLoginSubmit, loginError };
};

export const useSignupHandler = () => {
  const { register } = useAuth();
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  const handleSignupSubmit = async (signupData: Record<string, string>) => {
    setSignupError(null);
    setSignupSuccess(null);
    try {
      await register(signupData);
      setSignupSuccess("Registration successful! Please log in.");
    } catch (error: any) {
      setSignupError(error.response.data);
    }
  };

  return { handleSignupSubmit, signupError, signupSuccess };
};
