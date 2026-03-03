"use server"

import { auth } from "@/auth"
import prisma from "@/lib/db"
import { canCreateCampaign, canCreateLink } from "@/lib/limits"
import { revalidatePath } from "next/cache"

export async function createCampaign(formData: FormData) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const name = formData.get("name") as string
    const description = formData.get("description") as string

    if (!name.trim()) return { error: "Name is required" }

    const userId = session.user.id!
    const tier = session.user.tier

    const currentCount = await prisma.campaign.count({ where: { userId, isArchived: false } })
    if (!canCreateCampaign(tier, currentCount)) {
        return { error: "Limit reached" }
    }

    await prisma.campaign.create({
        data: { name, description, userId }
    })

    revalidatePath("/dashboard")
    return { success: true }
}

const RESERVED_SLUGS = [
    "dashboard", "admin", "login", "register", "settings",
    "api", "404", "500", "_next", "favicon.ico", "public"
]

export async function createLink(campaignId: string, formData: FormData) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const originalUrl = formData.get("originalUrl") as string
    const customSlug = formData.get("customSlug") as string
    const expiresAtRaw = formData.get("expiresAt") as string
    const generatedSlug = Math.random().toString(36).substring(2, 8)

    const tier = session.user.tier
    let slug = (tier === "ENTERPRISE" && customSlug.trim() !== "")
        ? customSlug.trim()
        : generatedSlug

    // Validate slug is not a reserved route
    if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
        return { error: `The slug "${slug}" is reserved. Please choose a different one.` }
    }

    if (!originalUrl.trim() || !originalUrl.startsWith("http")) return { error: "Valid URL is required" }

    // Parse expiration date if provided
    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null
    if (expiresAt && expiresAt <= new Date()) {
        return { error: "Expiration date must be in the future." }
    }

    const userId = session.user.id!

    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { _count: { select: { links: true } } }
    })

    if (!campaign || campaign.userId !== userId) return { error: "Campaign not found" }

    const allLinksCount = await prisma.link.count({
        where: { campaign: { userId, isArchived: false } }
    })

    if (!canCreateLink(tier, allLinksCount, campaign._count.links)) {
        return { error: "Limit reached for your tier" }
    }

    try {
        await prisma.link.create({
            data: {
                originalUrl,
                slug,
                campaignId,
                expiresAt
            }
        })
        revalidatePath(`/dashboard/campaigns/${campaignId}`)
        return { success: true }
    } catch (e: any) {
        if (e.code === "P2002") {
            return { error: "Slug already exists. Choose a different one." }
        }
        return { error: "Something went wrong." }
    }
}
