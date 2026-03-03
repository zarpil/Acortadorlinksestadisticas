import { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"
import { Tier, Role } from "@prisma/client"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            tier: Tier
            role: Role
        } & DefaultSession["user"]
    }

    interface User {
        tier: Tier
        role: Role
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        tier: Tier
        role: Role
    }
}
