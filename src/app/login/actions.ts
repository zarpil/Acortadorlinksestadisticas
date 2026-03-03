"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(prevState: any, formData: FormData) {
    try {
        const result = await signIn("credentials", {
            ...Object.fromEntries(formData),
            redirect: false,
        });

        // signIn with redirect: false either returns a URL string or undefined if success
        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials." };
                default:
                    return { error: "Something went wrong." };
            }
        }
        throw error;
    }
}
