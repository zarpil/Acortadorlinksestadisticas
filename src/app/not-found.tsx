import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-4">
            <Frown className="h-16 w-16 text-muted-foreground/50 mb-6" />
            <h1 className="text-4xl font-bold tracking-tight mb-2">404</h1>
            <p className="text-xl text-muted-foreground mb-1">Page not found</p>
            <p className="text-sm text-muted-foreground mb-8 max-w-md">
                The link you followed may be broken, expired, or the page may have been removed.
            </p>
            <div className="flex gap-4">
                <Button asChild>
                    <Link href="/">Go Home</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </Button>
            </div>
        </div>
    );
}
