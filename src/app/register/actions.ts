"use server"

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function registerAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!email || !password || password.length < 6) {
        return redirect("/register?error=InvalidInput");
    }

    if (password !== confirmPassword) {
        return redirect("/register?error=PasswordsDoNotMatch");
    }

    const existing = await prisma.user.findUnique({
        where: { email }
    });

    if (existing) {
        return redirect("/register?error=UserExists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Make the first user an ADMIN automatically (for template usage)
    const usersCount = await prisma.user.count();
    const role = usersCount === 0 ? "ADMIN" : "USER";

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role
        }
    });

    return redirect("/login?success=AccountCreated");
}
