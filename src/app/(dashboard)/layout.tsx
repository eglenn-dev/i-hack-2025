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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getProfile } from "./actions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { ChromeOnlyWarning } from "@/components/dashboard/chrome-warning";

interface Profile {
    email: string;
    name?: string;
    profilePictureUrl?: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(true);
    const [userProfile, setUserProfile] = useState<Profile | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        async function fetchProfilePhoto() {
            const photo = await getProfile();
            setUserProfile(photo);
        }
        fetchProfilePhoto();
    }, []);

    const handleLogout = async () => {
        const formData = new FormData();
        await fetch("/api/auth/logout", {
            method: "POST",
            body: formData,
        });
        window.location.href = "/";
    };

    return (
        <SidebarProvider open={isOpen} onOpenChange={setIsOpen}>
            <Sidebar side="left" variant="sidebar" collapsible="icon">
                <SidebarHeader className="mt-2">
                    <div className="flex items-center w-full h-10 px-2">
                        <Sparkles className={isOpen ? "mr-2" : ""} />
                        {isOpen && (
                            <h2 className="text-lg bg-blue-600 rounded-lg p-3 py-2 text-white font-semibold">
                                Olin
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
                    <SidebarMenu className="flex flex-col gap-4">
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 h-12"
                                >
                                    <Avatar className="h-8 w-8 max-h-full max-w-full shrink-0">
                                        <AvatarImage
                                            src={userProfile?.profilePictureUrl}
                                            alt={userProfile?.name || ""}
                                        />
                                        <AvatarFallback>
                                            {userProfile?.email?.[0] || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    {isOpen && (
                                        <span className="truncate">
                                            {userProfile?.name ||
                                                userProfile?.email}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                className="cursor-pointer"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2" />
                                <span>Logout</span>
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
                <ChromeOnlyWarning />
            </SidebarInset>
        </SidebarProvider>
    );
}
