import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true }
    });

    return (
        <div className="flex-1 space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between space-y-2 mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
            </div>
            <ProfileForm userName={user?.name || null} userEmail={user?.email || null} />
        </div>
    );
}
