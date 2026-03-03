import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppNavbar } from "@/components/app-navbar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "ADMIN") {
        redirect("/dashboard");
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <AppNavbar brandSuffix="Admin" />
            <main className="flex-1 space-y-4 p-8 pt-6 container mx-auto">
                {children}
            </main>
        </div>
    );
}
