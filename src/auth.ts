import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if (!user || !user.password) return null

                const passwordsMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (passwordsMatch) return user

                return null
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id as string
                token.tier = user.tier
                token.role = user.role
            }
            // Temporarily disabling live database queries in the JWT callback
            // because `auth.ts` is imported by `middleware.ts`, which runs on the Edge Runtime.
            // Standard Prisma Client is NOT compatible with the Edge Runtime and will crash silently.

            // Allow manual session update
            if (trigger === "update" && session) {
                token.tier = session.tier
            }
            return token
        },
        async session({ session, token }) {
            if (token.id && session.user) {
                session.user.id = token.id as string
                session.user.tier = token.tier
                session.user.role = token.role
            }
            return session
        }
    },
    pages: {
        signIn: "/login",
    }
})
