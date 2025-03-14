"use client";
import { ReactNode } from "react";
import { AuthProvider } from "../context/authContext";
import { CartProvider } from "@/context/cartContext";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
