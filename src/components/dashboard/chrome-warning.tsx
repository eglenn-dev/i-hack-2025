import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STORAGE_KEY = "chrome-warning-dismissed";

const isChrome = () => {
    // Only run in browser environment
    if (typeof window === "undefined") return true;

    const userAgent = navigator.userAgent.toLowerCase();
    const vendor = navigator.vendor.toLowerCase();

    // Check for Chrome specifically
    // Chrome has both 'chrome' in userAgent and 'google inc' in vendor
    // This helps distinguish from Edge and other Chromium browsers
    const hasChrome = userAgent.includes("chrome");
    const hasGoogleVendor = vendor.includes("google inc");
    const isEdge = userAgent.includes("edg");
    const isOpera = userAgent.includes("opr") || userAgent.includes("opera");
    const isBrave = userAgent.includes("brave");

    // Return true only if it's actually Chrome, not other Chromium browsers
    return hasChrome && hasGoogleVendor && !isEdge && !isOpera && !isBrave;
};

const hasSeenWarning = () => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
};

export function ChromeOnlyWarning() {
    const [isOpen, setIsOpen] = useState(() => {
        // Only show if not Chrome and user hasn't seen the warning before
        return !isChrome() && !hasSeenWarning();
    });

    const handleDismiss = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setIsOpen(false);
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Chrome Browser Required</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        <p>
                            This application is optimized for Google Chrome and
                            all features are only guaranteed to work properly in
                            Chrome.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            You appear to be using a different browser. For the
                            best experience, please switch to Google Chrome.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleDismiss}>
                        I Understand
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
