import { auth } from "@/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Users, Link as LinkIcon, BarChart3, Wallet } from "lucide-react";
import { UserTierSelect } from "@/components/user-tier-select";
import { SearchInput } from "@/components/search-input";
import { Suspense } from "react";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") return redirect("/dashboard");

    const { q: searchQuery } = await searchParams;

    const [totalUsers, totalLinks, totalClicks, premiumCount, users] = await Promise.all([
        prisma.user.count(),
        prisma.link.count(),
        prisma.clickLog.count(),
        prisma.user.count({ where: { tier: { not: "FREE" } } }),
        prisma.user.findMany({
            where: searchQuery ? {
                email: { contains: searchQuery, mode: "insensitive" as const }
            } : undefined,
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { campaigns: true }
                }
            }
        })
    ]);

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2 mb-6">
                <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Registered accounts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Links Shortened</CardTitle>
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLinks}</div>
                        <p className="text-xs text-muted-foreground">Across the entire system</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Global Clicks</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClicks}</div>
                        <p className="text-xs text-muted-foreground">System total activity</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Premium Accounts</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {premiumCount}
                        </div>
                        <p className="text-xs text-muted-foreground">Pro & Enterprise</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-8">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>
                                {searchQuery
                                    ? `Showing ${users.length} of ${totalUsers} users matching "${searchQuery}"`
                                    : "View and manage all registered users."}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Suspense>
                            <SearchInput placeholder="Search users by email..." />
                        </Suspense>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Tier</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Campaigns</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell>
                                            <UserTierSelect userId={user.id} currentTier={user.tier as "FREE" | "PRO" | "ENTERPRISE"} />
                                        </TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>{user._count.campaigns}</TableCell>
                                        <TableCell>{format(user.createdAt, "PP")}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
