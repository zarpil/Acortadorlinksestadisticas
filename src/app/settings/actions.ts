"use server"

import { auth } from "@/auth"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const name = formData.get("name") as string

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { name: name.trim() || null }
        })
        revalidatePath("/settings")
        return { success: true }
    } catch {
        return { error: "Failed to update profile." }
    }
}

export async function changePassword(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!currentPassword || !newPassword) return { error: "All fields are required." }
    if (newPassword.length < 6) return { error: "New password must be at least 6 characters." }
    if (newPassword !== confirmPassword) return { error: "Passwords do not match." }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user?.password) return { error: "Cannot change password for OAuth accounts." }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) return { error: "Current password is incorrect." }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword }
    })

    return { success: true }
}

export async function deleteAccount() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        await prisma.user.delete({ where: { id: session.user.id } })
        return { success: true }
    } catch {
        return { error: "Failed to delete account." }
    }
}
