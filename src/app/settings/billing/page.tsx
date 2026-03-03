import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default async function BillingPage() {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    const currentTier = (session.user as any).tier;

    return (
        <div className="flex-1 space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between space-y-2 mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Billing & Plans</h2>
            </div>
            <p className="text-muted-foreground mb-8">Manage your subscription and upgrade your limits. You are currently on the <span className="font-bold">{currentTier}</span> plan.</p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card className={currentTier === "FREE" ? "border-primary" : ""}>
                    <CardHeader>
                        <CardTitle>Free</CardTitle>
                        <CardDescription>Perfect for personal projects.</CardDescription>
                        <div className="text-3xl font-bold py-2">$0 <span className="text-muted-foreground text-sm font-normal">/mo</span></div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center"><Check className="h-4 w-4 mr-2" /> 1 Campaign</li>
                            <li className="flex items-center"><Check className="h-4 w-4 mr-2" /> 5 Links Total</li>
                            <li className="flex items-center"><Check className="h-4 w-4 mr-2" /> Standard Redirects</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant={currentTier === "FREE" ? "default" : "outline"} className="w-full" disabled={currentTier === "FREE"}>
                            {currentTier === "FREE" ? "Current Plan" : "Downgrade"}
                        </Button>
                    </CardFooter>
                </Card>

                <Card className={currentTier === "PRO" ? "border-primary" : ""}>
                    <CardHeader>
                        <CardTitle>Pro</CardTitle>
                        <CardDescription>For serious creators and marketers.</CardDescription>
                        <div className="text-3xl font-bold py-2">$12 <span className="text-muted-foreground text-sm font-normal">/mo</span></div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center"><Check className="h-4 w-4 text-primary mr-2" /> 10 Campaigns</li>
                            <li className="flex items-center"><Check className="h-4 w-4 text-primary mr-2" /> 10 Links per Campaign</li>
                            <li className="flex items-center"><Check className="h-4 w-4 text-primary mr-2" /> Geolocation Analytics</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <form action={async () => {
                            "use server";
                            // In a real app, this creates a Stripe checkout session based on PRICE_ID
                            // and redirects the user to the Stripe URL.
                        }} className="w-full">
                            <Button type="submit" variant={currentTier === "PRO" ? "default" : "outline"} className="w-full" disabled={currentTier === "PRO"}>
                                {currentTier === "PRO" ? "Current Plan" : "Upgrade to Pro"}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>

                <Card className={currentTier === "ENTERPRISE" ? "border-primary" : ""}>
                    <CardHeader>
                        <CardTitle>Enterprise</CardTitle>
                        <CardDescription>Unlimited potential for scale.</CardDescription>
                        <div className="text-3xl font-bold py-2">$49 <span className="text-muted-foreground text-sm font-normal">/mo</span></div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center"><Check className="h-4 w-4 text-primary mr-2" /> Unlimited Campaigns</li>
                            <li className="flex items-center"><Check className="h-4 w-4 text-primary mr-2" /> Unlimited Links</li>
                            <li className="flex items-center"><Check className="h-4 w-4 text-primary mr-2" /> API Access & Support</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <form action={async () => {
                            "use server";
                        }} className="w-full">
                            <Button type="submit" variant={currentTier === "ENTERPRISE" ? "default" : "outline"} className="w-full" disabled={currentTier === "ENTERPRISE"}>
                                {currentTier === "ENTERPRISE" ? "Current Plan" : "Upgrade to Enterprise"}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
