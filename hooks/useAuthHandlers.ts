"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

interface LoginData {
  identifier: string;
  password: string;
}

export const useLoginHandler = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginSubmit = async ({ identifier, password }: LoginData) => {
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const response = await login(identifier, password);
      // Assuming login returns a success indicator or throws on failure
      router.push("/");
      setIsLoggingIn(false);
      return true; // Success indicator
    } catch (error: any) {
      // Handle different error formats
      let errorMessage = "Login failed. Please check your credentials.";

      if (error.response && error.response.data) {
        errorMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message ||
              JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }

      setLoginError(errorMessage);
      setIsLoggingIn(false);
      return false; // Failure indicator
    }
  };

  return { handleLoginSubmit, loginError, isLoggingIn };
};

export const useRegisterHandler = () => {
  const { register } = useAuth();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegisterSubmit = async (registerData: Record<string, string>) => {
    setRegisterError(null);
    setFieldErrors({});
    setRegisterSuccess(null);
    setIsRegistering(true);

    try {
      await register(registerData);
      setRegisterSuccess("Registration successful! Please log in.");
      setIsRegistering(false);
      return true;
    } catch (error: any) {
      // Default error message
      let errorMessage = "Registration failed. Please try again.";

      // Check for structured validation errors
      if (
        error.response?.data?.type === "VALIDATION_ERROR" &&
        error.response?.data?.details
      ) {
        // Extract field-specific errors
        setFieldErrors(error.response.data.details);
        errorMessage = "Validation error. Please check all fields.";
      } else if (error.response && error.response.data) {
        errorMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message ||
              JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }

      setRegisterError(errorMessage);
      setIsRegistering(false);
      return false;
    }
  };

  return {
    handleRegisterSubmit,
    registerError,
    fieldErrors,
    registerSuccess,
    isRegistering,
  };
};
