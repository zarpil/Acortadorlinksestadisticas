import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const tier = (session.user as any).tier;
    if (tier === "FREE") {
        return new Response("Export is available on Pro and Enterprise plans.", { status: 403 });
    }

    try {
        const { id } = await context.params;

        // Verify ownership and get data
        const campaign = await prisma.campaign.findUnique({
            where: {
                id,
                userId: session.user.id
            },
            include: {
                links: {
                    include: {
                        clicks: {
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                }
            }
        });

        if (!campaign) {
            return new Response("Campaign not found", { status: 404 });
        }

        // Flatten all clicks across all links in the campaign
        const allClicks = campaign.links.flatMap(link =>
            link.clicks.map(click => ({
                linkSlug: link.slug,
                originalUrl: link.originalUrl,
                ...click
            }))
        ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Header mapping
        const headers = [
            "Timestamp",
            "Link Slug",
            "Original URL",
            "IP Address",
            "Country",
            "Region",
            "City",
            "Device Type",
            "Device Brand",
            "OS",
            "Browser",
            "Referer",
            "Is VPN/Proxy",
            "UTM Source",
            "UTM Medium",
            "UTM Campaign"
        ];

        // Format rows safely escaping commas and quotes
        const escapeCSV = (field: any) => {
            if (field === null || field === undefined) return '""';
            const stringField = String(field);
            if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return `"${stringField}"`;
        };

        const rows = allClicks.map(click => [
            escapeCSV(click.createdAt.toISOString()),
            escapeCSV(click.linkSlug),
            escapeCSV(click.originalUrl),
            escapeCSV(click.ip),
            escapeCSV(click.country),
            escapeCSV(click.region),
            escapeCSV(click.city),
            escapeCSV(click.device),
            escapeCSV(click.deviceBrand),
            escapeCSV(click.os),
            escapeCSV(click.browser),
            escapeCSV(click.referer),
            escapeCSV(click.isVpn ? "Yes" : "No"),
            escapeCSV(click.utm_source),
            escapeCSV(click.utm_medium),
            escapeCSV(click.utm_campaign)
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        return new Response(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analytics.csv"`
            }
        });
    } catch (error) {
        console.error("Export Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
