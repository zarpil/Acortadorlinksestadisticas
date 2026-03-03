import { Tier } from "@prisma/client";

export function getTierLimits(tier: Tier) {
    switch (tier) {
        case Tier.FREE:
            return { maxCampaigns: 1, maxLinksPerCampaign: Infinity, maxLinksTotal: 5 };
        case Tier.PRO:
            return { maxCampaigns: 10, maxLinksPerCampaign: 10, maxLinksTotal: 100 };
        case Tier.ENTERPRISE:
            return { maxCampaigns: Infinity, maxLinksPerCampaign: Infinity, maxLinksTotal: Infinity };
        default:
            return { maxCampaigns: 1, maxLinksPerCampaign: Infinity, maxLinksTotal: 5 };
    }
}

export function canCreateCampaign(tier: Tier, currentCampaignCount: number) {
    const limits = getTierLimits(tier);
    return currentCampaignCount < limits.maxCampaigns;
}

export function canCreateLink(tier: Tier, currentLinksCount: number, currentLinksInCampaign: number) {
    const limits = getTierLimits(tier);
    if (currentLinksCount >= limits.maxLinksTotal) return false;
    if (currentLinksInCampaign >= limits.maxLinksPerCampaign) return false;
    return true;
}
