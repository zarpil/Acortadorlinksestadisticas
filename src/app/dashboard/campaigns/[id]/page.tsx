import { auth } from "@/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Link as LinkIcon, Copy, ArrowLeft, Globe, Monitor, Compass, Download } from "lucide-react";
import Link from "next/link";
import { CreateLinkDialog } from "@/components/create-link-dialog";
import { CopyButton } from "@/components/copy-button";
import { DeleteLinkButton } from "@/components/delete-link-button";
import { QrCodeButton } from "@/components/qr-code-button";
import { EditLinkOGButton } from "@/components/edit-link-og-button";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ClicksChart } from "@/components/clicks-chart"
import { MetricsPieChart } from "@/components/metrics-pie-chart"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/search-input"
import { Suspense } from "react"

export default async function CampaignPage(
    { params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ q?: string }> }
) {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    const { id } = await params;
    const { q: searchQuery } = await searchParams;

    const campaign = await prisma.campaign.findUnique({
        where: { id, userId: session.user.id },
        include: {
            links: {
                where: searchQuery ? {
                    OR: [
                        { slug: { contains: searchQuery, mode: "insensitive" as const } },
                        { originalUrl: { contains: searchQuery, mode: "insensitive" as const } },
                    ]
                } : undefined,
                include: {
                    _count: { select: { clicks: true } },
                    clicks: {
                        take: 200,
                        orderBy: { createdAt: 'desc' }
                    }
                },
                orderBy: { createdAt: 'desc' },
            }
        }
    });

    if (!campaign) return redirect("/dashboard");

    const tier = session.user.tier;
    const { getTierLimits } = await import("@/lib/limits");
    const limits = getTierLimits(tier);

    const allClicks = campaign.links.flatMap(l => l.clicks).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // prepare 7-day chart data
    const chartDataMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        chartDataMap.set(format(d, "MMM dd"), 0);
    }

    // Analytics Aggregation
    const countriesMap = new Map<string, number>();
    const devicesMap = new Map<string, number>();
    const browsersMap = new Map<string, number>();
    const referrersMap = new Map<string, number>();

    let suspiciousTrafficCount = 0;
    const uniqueIps = new Set<string>();

    allClicks.forEach(c => {
        // 7 days timeline
        const d = format(c.createdAt, "MMM dd");
        if (chartDataMap.has(d)) {
            chartDataMap.set(d, chartDataMap.get(d)! + 1);
        }

        // Demographics
        const country = c.country || "Unknown";
        countriesMap.set(country, (countriesMap.get(country) || 0) + 1);

        const cAny = c as any;
        const device = cAny.deviceBrand && cAny.deviceBrand !== "Unknown"
            ? `${c.device} (${cAny.deviceBrand})`
            : c.device || "Unknown";
        devicesMap.set(device, (devicesMap.get(device) || 0) + 1);

        const browser = c.browser || "Unknown";
        browsersMap.set(browser, (browsersMap.get(browser) || 0) + 1);

        let refererDomain = "Direct";
        if (c.referer) {
            try {
                refererDomain = new URL(c.referer).hostname.replace('www.', '');
            } catch {
                refererDomain = c.referer;
            }
        }
        referrersMap.set(refererDomain, (referrersMap.get(refererDomain) || 0) + 1);

        if (c.ip) uniqueIps.add(c.ip);
        if (cAny.isVpn) suspiciousTrafficCount++;
    });

    const chartData = Array.from(chartDataMap).map(([date, clicks]) => ({ date, clicks }));

    const sortMap = (map: Map<string, number>) => Array.from(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);

    const topCountries = sortMap(countriesMap);
    const topDevices = sortMap(devicesMap);
    const topBrowsers = sortMap(browsersMap);
    const topReferrers = sortMap(referrersMap);

    const headersList = await import("next/headers").then(m => m.headers());
    const host = headersList.get("host") || "localhost:4675";

    return (
        <div className="flex-1 space-y-6 pb-12">
            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        {campaign.name}
                        {campaign.isArchived && <Badge variant="destructive">Archived</Badge>}
                    </h2>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" asChild>
                        <a href={`/api/campaigns/${campaign.id}/export`} download>
                            <Download className="mr-2 h-4 w-4" />
                            Export Data
                        </a>
                    </Button>
                    {!campaign.isArchived && (
                        <CreateLinkDialog
                            campaignId={campaign.id}
                            tier={(session.user as any).tier}
                            currentTotalLinks={await prisma.link.count({ where: { campaign: { userId: session.user.id } } })}
                            currentCampaignLinks={campaign.links.length}
                            limitPerCampaign={limits.maxLinksPerCampaign}
                            limitTotal={limits.maxLinksTotal}
                        />
                    )}
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allClicks.length}</div>
                        <p className="text-xs text-muted-foreground">All time interactions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Clicks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueIps.size}</div>
                        <p className="text-xs text-muted-foreground">Based on Unique IPs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Suspicious Traffic</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{suspiciousTrafficCount}</div>
                        <p className="text-xs text-muted-foreground">VPNs or Proxies detected</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Links</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{campaign.links.length}</div>
                        <p className="text-xs text-muted-foreground">Shortened under this campaign</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
                <Card className="col-span-full mb-4">
                    <CardHeader>
                        <CardTitle>Click Performance</CardTitle>
                        <CardDescription>7-day volume history across all links.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ClicksChart data={chartData} />
                    </CardContent>
                </Card>
            </div>

            <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 relative ${tier === "FREE" ? "overflow-hidden" : ""}`}>
                {tier === "FREE" && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl border">
                        <Globe className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Advanced Analytics Locked</h3>
                        <p className="text-muted-foreground text-sm text-center max-w-sm mb-4">
                            Geolocation, Device Brands, Referrers, and specific metrics are available on Pro and Enterprise plans.
                        </p>
                        <Button asChild>
                            <Link href="/settings/billing">Upgrade to Pro</Link>
                        </Button>
                    </div>
                )}

                <Card className={tier === "FREE" ? "opacity-50 pointer-events-none" : ""}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-muted-foreground" /> Top Referrers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MetricsPieChart data={topReferrers} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-muted-foreground" /> Top Countries
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MetricsPieChart data={topCountries} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <Monitor className="h-4 w-4 mr-2 text-muted-foreground" /> Top Devices
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MetricsPieChart data={topDevices} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <Compass className="h-4 w-4 mr-2 text-muted-foreground" /> Top Browsers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MetricsPieChart data={topBrowsers} />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Links</CardTitle>
                    <CardDescription>Your shortened links under this campaign.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Suspense>
                            <SearchInput placeholder="Search links by slug or URL..." />
                        </Suspense>
                    </div>
                    {campaign.links.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center border-dashed border-2 rounded-lg">
                            <LinkIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
                            <p className="text-muted-foreground">No links in this campaign.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {campaign.links.map(link => (
                                <div key={link.id} className="flex justify-between items-center p-4 border rounded-md">
                                    <div className="flex-1 overflow-hidden pr-4">
                                        <p className="font-medium text-lg flex items-center">
                                            <a href={`http://${host}/${link.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center text-primary">
                                                {host}/{link.slug}
                                            </a >
                                        </p >
                                        <p className="text-sm text-muted-foreground truncate" title={link.originalUrl}>
                                            {link.originalUrl}
                                        </p>
                                        <div className="flex space-x-4 mt-2 text-xs text-muted-foreground">
                                            <span>{format(link.createdAt, 'PP')}</span>
                                            <span><Badge variant="secondary">{link._count.clicks} Clicks</Badge></span>
                                            {(link as any).expiresAt && (
                                                <span>
                                                    <Badge variant={new Date((link as any).expiresAt) < new Date() ? "destructive" : "outline"}>
                                                        {new Date((link as any).expiresAt) < new Date() ? "Expired" : `Expires ${format((link as any).expiresAt, 'PP')}`}
                                                    </Badge>
                                                </span>
                                            )}
                                        </div>
                                    </div >
                                    <div className="flex space-x-2">
                                        <QrCodeButton url={`http://${host}/${link.slug}`} slug={link.slug} />
                                        <CopyButton text={`${host}/${link.slug}`} />
                                        {!campaign.isArchived && tier !== "FREE" && (
                                            <EditLinkOGButton
                                                linkId={link.id}
                                                campaignId={campaign.id}
                                                slug={link.slug}
                                                currentOgTitle={(link as any).ogTitle || null}
                                                currentOgDescription={(link as any).ogDescription || null}
                                                currentOgImage={(link as any).ogImage || null}
                                            />
                                        )}
                                        {!campaign.isArchived && (
                                            <DeleteLinkButton linkId={link.id} campaignId={campaign.id} slug={link.slug} />
                                        )}
                                    </div>
                                </div >
                            ))}
                        </div >
                    )}
                </CardContent >
            </Card >

            <Card className="relative overflow-hidden">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Detailed metadata of the latest clicks across this campaign.</CardDescription>
                </CardHeader>
                <CardContent>
                    {tier === "FREE" && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
                            <h3 className="text-lg font-bold mb-2 pt-16">Raw Data Locked</h3>
                            <Button size="sm" asChild>
                                <Link href="/settings/billing">Upgrade to Unlock</Link>
                            </Button>
                        </div>
                    )}
                    <div className={tier === "FREE" ? "opacity-40 pointer-events-none" : ""}>
                        {allClicks.length === 0 ? (
                            <div className="text-center p-4 text-muted-foreground">No clicks recorded yet.</div>
                        ) : (
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>IP</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>System</TableHead>
                                            <TableHead>Referer</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allClicks.slice(0, 50).map(click => {
                                            const clickAny = click as any;
                                            return (
                                                <TableRow key={click.id}>
                                                    <TableCell className="text-xs whitespace-nowrap">{format(click.createdAt, "PP pp")}</TableCell>
                                                    <TableCell className="font-mono text-xs">{click.ip || "Unknown"}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-sm flex items-center gap-1">
                                                                {click.country || "Unknown"}
                                                                {clickAny.isVpn && <Badge variant="destructive" className="h-4 text-[9px] px-1">VPN</Badge>}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">{clickAny.region ? `${click.city}, ${clickAny.region}` : (click.city || "Unknown City")}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            <Badge variant="outline" className="text-[10px] h-5" title={clickAny.deviceBrand || "Brand"}>{click.device || "Unknown"} {clickAny.deviceBrand ? `(${clickAny.deviceBrand})` : ""}</Badge>
                                                            <Badge variant="outline" className="text-[10px] h-5">{click.os || "Unknown"}</Badge>
                                                            <Badge variant="outline" className="text-[10px] h-5">{click.browser || "Unknown"}</Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs max-w-[150px] truncate" title={click.referer || "Direct"}>
                                                        <div className="flex flex-col">
                                                            <span>{click.referer || "Direct"}</span>
                                                            {clickAny.utm_source && (
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    UTM: {clickAny.utm_source} / {clickAny.utm_medium}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
