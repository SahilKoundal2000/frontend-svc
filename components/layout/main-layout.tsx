"use client";

import { ReactNode, useEffect, useState } from "react";
import Navbar from "../ui/navbar";
import { useAuth } from "@/context/authContext";

interface LayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: LayoutProps) {
  const { username, role } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div />;
  }
  return (
    <>
      <Navbar username={username} role={role} />
      <main className="pt-20">{children}</main>
    </>
  );
}
