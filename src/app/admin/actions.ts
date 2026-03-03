"use server"

import prisma from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateUserTier(userId: string, tier: "FREE" | "PRO" | "ENTERPRISE") {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { tier }
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message || "Failed to update" };
    }
}
