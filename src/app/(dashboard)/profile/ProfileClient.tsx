"use client";

import { useState, useRef, useEffect } from "react";
import { UserSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Save, X, Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProfileClientProps {
    session: UserSession;
}

export default function ProfileClient({ session }: ProfileClientProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(session.name || "");
    const [profilePhoto, setProfilePhoto] = useState("");
    const [previewPhoto, setPreviewPhoto] = useState("");
    const [originalName, setOriginalName] = useState(session.name || "");
    const [originalPhoto, setOriginalPhoto] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Fetch latest profile data on mount
    useEffect(() => {
        async function fetchProfile() {
            try {
                const response = await fetch("/api/profile");
                if (response.ok) {
                    const data = await response.json();
                    setName(data.name || "");
                    setProfilePhoto(data.profilePhoto || "");
                    setPreviewPhoto(data.profilePhoto || "");
                    setOriginalName(data.name || "");
                    setOriginalPhoto(data.profilePhoto || "");
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        // Check file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setPreviewPhoto(base64String);
            setProfilePhoto(base64String);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    profilePhoto: profilePhoto,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update profile");
            }

            toast.success("Profile updated successfully");

            // Update original values after successful save
            setOriginalName(name);
            setOriginalPhoto(profilePhoto);

            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update profile"
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setName(originalName);
        setPreviewPhoto(originalPhoto);
        setProfilePhoto(originalPhoto);
        setIsEditing(false);
    };

    const getInitials = (name: string, email: string) => {
        if (name && name.trim()) {
            return name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        return email[0].toUpperCase();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-3xl font-bold text-blank">
                        Profile
                    </CardTitle>
                    {!isEditing ? (
                        <Button
                            onClick={() => setIsEditing(true)}
                            variant="outline"
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                disabled={isSaving}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Profile Photo Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <Avatar className="h-32 w-32">
                                <AvatarImage
                                    src={previewPhoto}
                                    alt={name || session.email}
                                />
                                <AvatarFallback className="text-3xl bg-primary/20 text-blank">
                                    {getInitials(name, session.email)}
                                </AvatarFallback>
                            </Avatar>
                            {isEditing && (
                                <button
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="absolute bottom-0 right-0 p-2 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg transition-colors"
                                    type="button"
                                >
                                    <Camera className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        {isEditing && (
                            <>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <p className="text-sm text-blank/70 text-center">
                                    Click the camera icon to upload a new photo
                                    <br />
                                    (Max 5MB, JPG, PNG, or GIF)
                                </p>
                            </>
                        )}
                    </div>

                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-blank">
                            Name
                        </Label>
                        {isEditing ? (
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="bg-white/10 border-white/20 text-blank placeholder:text-blank/50"
                            />
                        ) : (
                            <p className="text-blank text-lg">
                                {name || (
                                    <span className="text-blank/50">
                                        Not set
                                    </span>
                                )}
                            </p>
                        )}
                    </div>

                    {/* Email Field (Read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-blank">
                            Email
                        </Label>
                        <p className="text-blank/70 text-lg">{session.email}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
