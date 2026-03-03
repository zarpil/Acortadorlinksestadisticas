import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/app-navbar";
import Link from "next/link";

export default async function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <AppNavbar />
            <main className="flex-1 p-8 pt-6 container mx-auto">
                <div className="flex flex-col md:flex-row gap-8">
                    <aside className="md:w-48 shrink-0">
                        <nav className="flex md:flex-col gap-2">
                            <Link
                                href="/settings/profile"
                                className="text-sm font-medium px-3 py-2 rounded-md hover:bg-muted transition-colors"
                            >
                                Profile
                            </Link>
                            <Link
                                href="/settings/billing"
                                className="text-sm font-medium px-3 py-2 rounded-md hover:bg-muted transition-colors"
                            >
                                Billing & Plans
                            </Link>
                        </nav>
                    </aside>
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
