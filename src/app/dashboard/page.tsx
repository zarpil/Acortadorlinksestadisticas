import { auth } from "@/auth";
import prisma from "@/lib/db";
import { format } from "date-fns";
import { PlusCircle, Link as LinkIcon, BarChart3, TrendingUp, Key, Archive } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CreateCampaignDialog } from "@/components/create-campaign-dialog";
import { CampaignActionsMenu } from "./campaign-actions-menu";
import { SearchInput } from "@/components/search-input";
import { Suspense } from "react";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const session = await auth();
    if (!session?.user) return null;

    const { q: searchQuery } = await searchParams;

    const campaigns = await prisma.campaign.findMany({
        where: {
            userId: session.user.id,
            ...(searchQuery ? {
                OR: [
                    { name: { contains: searchQuery, mode: "insensitive" as const } },
                    { description: { contains: searchQuery, mode: "insensitive" as const } },
                ]
            } : {})
        },
        include: {
            _count: {
                select: { links: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    const allLinks = await prisma.link.findMany({
        where: { campaign: { userId: session.user.id, isArchived: false } },
        include: { _count: { select: { clicks: true } } }
    });

    const totalLinks = allLinks.length;
    const totalClicks = allLinks.reduce((acc, link) => acc + link._count.clicks, 0);

    const { getTierLimits } = await import("@/lib/limits");
    const tierLimits = getTierLimits(session.user.tier);

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <CreateCampaignDialog userId={session.user.id!} tier={(session.user as any).tier} currentCount={campaigns.filter(c => !(c as any).isArchived).length} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{campaigns.filter(c => !(c as any).isArchived).length} <span className="text-sm font-normal text-muted-foreground">/ {tierLimits.maxCampaigns === Infinity ? '∞' : tierLimits.maxCampaigns}</span></div>
                        <p className="text-xs text-muted-foreground">Active campaigns</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Links</CardTitle>
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLinks} <span className="text-sm font-normal text-muted-foreground">/ {tierLimits.maxLinksTotal === Infinity ? '∞' : tierLimits.maxLinksTotal}</span></div>
                        <p className="text-xs text-muted-foreground">Shortened so far</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClicks}</div>
                        <p className="text-xs text-muted-foreground">Across all links</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Plan Tier</CardTitle>
                        <Key className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{session.user.tier}</div>
                        <p className="text-xs text-muted-foreground">
                            <Link href="/settings/billing" className="underline text-primary">Upgrade Plan</Link>
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 mt-8">
                <Tabs defaultValue="active" className="w-full space-y-4">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="active">Active Campaigns</TabsTrigger>
                            <TabsTrigger value="archived">Archived</TabsTrigger>
                        </TabsList>
                    </div>

                    <Suspense>
                        <SearchInput placeholder="Search campaigns..." />
                    </Suspense>

                    <TabsContent value="active" className="space-y-4">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Your Campaigns</CardTitle>
                                <CardDescription>
                                    Manage your link campaigns and view detailed analytics.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {campaigns.filter(c => !c.isArchived).length === 0 ? (
                                    <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                                        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                                            <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
                                            <h3 className="mt-4 text-lg font-semibold">No active campaigns</h3>
                                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                                You don't have any active campaigns. Create one to start tracking links.
                                            </p>
                                            <CreateCampaignDialog userId={session.user.id!} tier={(session.user as any).tier} currentCount={campaigns.filter(c => !(c as any).isArchived).length} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {campaigns.filter(c => !c.isArchived).map((camp) => (
                                            <div key={camp.id} className="flex items-center justify-between p-4 border rounded-lg transition-colors hover:bg-muted/50">
                                                <div>
                                                    <h4 className="font-semibold">
                                                        <Link href={`/dashboard/campaigns/${camp.id}`} className="hover:underline">
                                                            {camp.name}
                                                        </Link>
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">{camp.description}</p>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm">
                                                    <div className="flex items-center text-muted-foreground">
                                                        <LinkIcon className="h-3 w-3 mr-1" />
                                                        {camp._count.links} links
                                                    </div>
                                                    <span className="text-muted-foreground">{format(camp.createdAt, "MMM d, yyyy")}</span>
                                                    <CampaignActionsMenu campaignId={camp.id} isArchived={camp.isArchived} campaignName={camp.name} campaignDescription={camp.description || ""} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="archived" className="space-y-4">
                        <Card className="col-span-4 opacity-75">
                            <CardHeader>
                                <CardTitle className="flex items-center"><Archive className="h-5 w-5 mr-2" /> Archived Campaigns</CardTitle>
                                <CardDescription>
                                    Hidden campaigns that no longer count towards your active UI limits.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {campaigns.filter(c => c.isArchived).length === 0 ? (
                                    <div className="text-center p-8 text-muted-foreground">
                                        No archived campaigns.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {campaigns.filter(c => c.isArchived).map((camp) => (
                                            <div key={camp.id} className="flex items-center justify-between p-4 border rounded-lg transition-colors hover:bg-muted/50 bg-muted/20">
                                                <div>
                                                    <h4 className="font-semibold text-muted-foreground">
                                                        <Link href={`/dashboard/campaigns/${camp.id}`} className="hover:underline">
                                                            {camp.name}
                                                        </Link>
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground/70">{camp.description}</p>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm">
                                                    <div className="flex items-center text-muted-foreground">
                                                        <LinkIcon className="h-3 w-3 mr-1" />
                                                        {camp._count.links} links
                                                    </div>
                                                    <CampaignActionsMenu campaignId={camp.id} isArchived={camp.isArchived} campaignName={camp.name} campaignDescription={camp.description || ""} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
