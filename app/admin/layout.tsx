"use client";

import { useEffect, useState } from "react";
import { unauthorized, useRouter, usePathname } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from "@/context/authContext";
import React from "react";
import Loading from "@/components/ui/loading";

const routeMap: Record<string, string> = {
  admin: "Admin Dashboard",
  products: "Products",
  orders: "Orders",
  payments: "Payments",
  reminders: "Reminders",
};

interface BreadcrumbItem {
  href: string | undefined;
  label: string;
  isLast: boolean;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { username, role, token } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname?.replace(/^\//, "").split("/") || [];
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      const label =
        routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

      breadcrumbs.push({
        href: isLast ? undefined : currentPath,
        label,
        isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }

    if (role !== "admin") {
      unauthorized();
    }

    setMounted(true);
  }, [token, role, router]);

  if (!mounted) {
    return <Loading />;
  }

  return (
    <SidebarProvider>
      <AppSidebar username={username ?? "admin"} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href || "#"}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
