import { auth, signOut } from "@/auth";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

interface AppNavbarProps {
    brandSuffix?: string;
}

export async function AppNavbar({ brandSuffix }: AppNavbarProps) {
    const session = await auth();

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between mx-auto px-4">
                <div className="flex gap-4 items-center">
                    <Link href="/" className="font-bold flex items-center space-x-2">
                        <span className="font-bold inline-block">Kutt.{brandSuffix ? ` ${brandSuffix}` : ""}</span>
                    </Link>
                    <nav className="flex items-center gap-4 text-sm font-medium ml-6">
                        <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">Dashboard</Link>
                        <Link href="/settings" className="transition-colors hover:text-foreground/80 text-foreground/60">Settings</Link>
                        {session?.user?.role === "ADMIN" && (
                            <Link href="/admin" className="transition-colors hover:text-foreground/80 text-primary">Admin</Link>
                        )}
                    </nav>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <span className="text-sm font-medium mx-2">{session?.user?.email}</span>
                    <form action={async () => {
                        "use server"
                        await signOut({ redirectTo: "/login" })
                    }}>
                        <Button variant="ghost" size="sm">Log out</Button>
                    </form>
                </div>
            </div>
        </header>
    );
}
