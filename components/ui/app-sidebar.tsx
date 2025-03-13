import * as React from "react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import Logo from "./logo";
import { NavUser } from "./nav-user";
import Link from "next/link";

const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/admin",
            items: [
                {
                    title: "Homepage",
                    url: "/admin",
                },
            ],
        },
        {
            title: "Products",
            url: "/admin/products",
            items: [
                {
                    title: "Add Product",
                    url: "/admin/products/add",
                },
                {
                    title: "List Products",
                    url: "/admin/products",
                },
            ],
        },
        {
            title: "Orders",
            url: "/admin/orders",
            items: [
                {
                    title: "List Orders",
                    url: "/admin/orders",
                },
            ],
        },
        {
            title: "Payments",
            url: "/admin/payments",
            items: [
                {
                    title: "List Payments",
                    url: "/admin/payments",
                },
            ],
        },
        {
            title: "Reminders",
            url: "/admin/reminders",
            items: [
                {
                    title: "List Reminders",
                    url: "/admin/reminders",
                },
                {
                    title: "Reminder Logs",
                    url: "/admin/reminders/logs",
                },
            ],
        },
    ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    username: string;
}

export function AppSidebar({ username, ...props }: AppSidebarProps) {
    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div
                                    className="flex aspect-square size-10 p-1 items-center justify-center rounded-lg bg-teal-200 shadow-md">
                                    <Logo variant="nolabel" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Pharmakart</span>
                                    <span className="">v1.0.0</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {data.navMain.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <Link href={item.url} className="font-medium">
                                        {item.title}
                                    </Link>
                                </SidebarMenuButton>
                                {item.items?.length ? (
                                    <SidebarMenuSub>
                                        {item.items.map((item) => (
                                            <SidebarMenuSubItem key={item.title}>
                                                <SidebarMenuSubButton asChild isActive={false}>
                                                    <Link href={item.url}>{item.title}</Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                ) : null}
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={{ name: username, avatar: "" }} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
