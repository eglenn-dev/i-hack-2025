"use client";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, History, Play, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <SidebarProvider open={isOpen} onOpenChange={setIsOpen}>
            <Sidebar side="left" variant="sidebar" collapsible="icon">
                <SidebarHeader>
                    <div className="flex items-center w-full h-10 px-2">
                        <Sparkles className={isOpen ? "mr-2" : ""} />
                        {isOpen && (
                            <h2 className="text-lg font-semibold">
                                Interview Prep
                            </h2>
                        )}
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent
                            className={isOpen ? "pl-2" : "mt-10"}
                        >
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        className={
                                            pathname === "/dashboard"
                                                ? "bg-gray-200 font-bold"
                                                : ""
                                        }
                                    >
                                        <Link href="/dashboard">
                                            <Home className="mr-2" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        className={
                                            pathname === "/dashboard/setup"
                                                ? "bg-gray-200 font-bold"
                                                : ""
                                        }
                                    >
                                        <Link href="/dashboard/setup">
                                            <Play className="mr-2" />
                                            <span>Start Interview</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        className={
                                            pathname === "/history"
                                                ? "bg-gray-200 font-bold"
                                                : ""
                                        }
                                    >
                                        <Link href="/history">
                                            <History className="mr-2" />
                                            <span>History</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <form
                                    action="/api/auth/logout"
                                    method="POST"
                                    className="w-full"
                                >
                                    <Button
                                        type="submit"
                                        variant="ghost"
                                        className="w-full justify-start p-2 h-auto"
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        <span>Logout</span>
                                    </Button>
                                </form>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
