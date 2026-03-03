"use server"

import { auth } from "@/auth"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function archiveCampaign(campaignId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await prisma.campaign.update({
            where: {
                id: campaignId,
                userId: session.user.id
            },
            data: {
                isArchived: true
            }
        });

        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/campaigns/${campaignId}`);
        return { success: true };
    } catch (error) {
        console.error("Error archiving campaign:", error);
        return { error: "Failed to archive campaign" };
    }
}

export async function deleteCampaign(campaignId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await prisma.campaign.delete({
            where: {
                id: campaignId,
                userId: session.user.id
            }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error deleting campaign:", error);
        return { error: "Failed to delete campaign" };
    }
}

export async function updateCampaign(campaignId: string, data: { name: string; description?: string }) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    if (!data.name.trim()) return { error: "Name is required" };

    try {
        await prisma.campaign.update({
            where: {
                id: campaignId,
                userId: session.user.id
            },
            data: {
                name: data.name.trim(),
                description: data.description?.trim() || null
            }
        });

        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/campaigns/${campaignId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating campaign:", error);
        return { error: "Failed to update campaign" };
    }
}

export async function deleteLink(linkId: string, campaignId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        // Verify ownership through campaign
        const link = await prisma.link.findUnique({
            where: { id: linkId },
            include: { campaign: true }
        });

        if (!link || link.campaign.userId !== session.user.id) {
            return { error: "Link not found" };
        }

        await prisma.link.delete({ where: { id: linkId } });

        revalidatePath(`/dashboard/campaigns/${campaignId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting link:", error);
        return { error: "Failed to delete link" };
    }
}

export async function updateLinkOG(
    linkId: string,
    campaignId: string,
    data: { ogTitle?: string; ogDescription?: string; ogImage?: string }
) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const link = await prisma.link.findUnique({
            where: { id: linkId },
            include: { campaign: true }
        });

        if (!link || link.campaign.userId !== session.user.id) {
            return { error: "Link not found" };
        }

        await prisma.link.update({
            where: { id: linkId },
            data: {
                ogTitle: data.ogTitle?.trim() || null,
                ogDescription: data.ogDescription?.trim() || null,
                ogImage: data.ogImage?.trim() || null,
            } as any
        });

        revalidatePath(`/dashboard/campaigns/${campaignId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating link OG metadata:", error);
        return { error: "Failed to update link metadata" };
    }
}
