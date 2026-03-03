"use client"

import * as React from "react"
import { Tier } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Lock, CalendarClock } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { createLink } from "@/app/dashboard/actions"

interface CreateLinkDialogProps {
    campaignId: string
    tier: Tier
    currentTotalLinks: number
    currentCampaignLinks: number
    limitPerCampaign: number
    limitTotal: number
}

export function CreateLinkDialog({ campaignId, tier, limitPerCampaign, limitTotal, currentCampaignLinks, currentTotalLinks }: CreateLinkDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [pending, setPending] = React.useState(false)

    const hasReachedCampaignLimit = currentCampaignLinks >= limitPerCampaign
    const hasReachedTotalLimit = currentTotalLinks >= limitTotal
    const canCreate = !hasReachedCampaignLimit && !hasReachedTotalLimit

    async function clientAction(formData: FormData) {
        setPending(true)
        try {
            const result = await createLink(campaignId, formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Link shortened successfully!")
                setOpen(false)
            }
        } catch (e) {
            toast.error("Something went wrong.")
        } finally {
            setPending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button onClick={(e) => {
                    if (hasReachedTotalLimit) {
                        e.preventDefault()
                        toast.error(`You have reached your global limit of ${limitTotal} links. Please upgrade.`)
                    } else if (hasReachedCampaignLimit) {
                        e.preventDefault()
                        toast.error(`You have reached your limit of ${limitPerCampaign} links for this campaign. Please upgrade.`)
                    }
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Shorten Link
                </Button>
            </DialogTrigger>
            {canCreate && (
                <DialogContent className="sm:max-w-[425px]">
                    <form action={clientAction}>
                        <DialogHeader>
                            <DialogTitle>Shorten New Link</DialogTitle>
                            <DialogDescription>
                                Enter the destination URL and an optional custom slug.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="originalUrl">Destination URL</Label>
                                <Input id="originalUrl" name="originalUrl" type="url" placeholder="https://example.com/very/long/path" required />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="customSlug">Custom Slug (Optional)</Label>
                                    {tier !== "ENTERPRISE" && (
                                        <span className="text-xs text-muted-foreground flex items-center bg-muted/50 px-2 py-0.5 rounded-full">
                                            <Lock className="h-3 w-3 mr-1" />
                                            Enterprise Feature
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-muted-foreground text-sm">/</span>
                                    <Input
                                        id="customSlug"
                                        name="customSlug"
                                        placeholder={tier === "ENTERPRISE" ? "my-custom-link" : "Requires Enterprise"}
                                        disabled={tier !== "ENTERPRISE"}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="expiresAt" className="flex items-center">
                                        <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
                                        Expiration Date (Optional)
                                    </Label>
                                </div>
                                <Input
                                    id="expiresAt"
                                    name="expiresAt"
                                    type="datetime-local"
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                                <p className="text-xs text-muted-foreground">Leave empty for a permanent link.</p>
                            </div>

                            {/* Tier features summary */}
                            <div className="border rounded-lg p-3 bg-muted/30 space-y-1.5">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Features available on your plan:</p>
                                <div className="flex items-center text-xs gap-1.5">
                                    {tier !== "FREE" ? (
                                        <span className="text-green-500">✓</span>
                                    ) : (
                                        <Lock className="h-3 w-3 text-muted-foreground" />
                                    )}
                                    <span className={tier === "FREE" ? "text-muted-foreground" : ""}>Social Media Preview (OG Tags)</span>
                                    {tier === "FREE" && <span className="text-xs text-muted-foreground ml-auto">Pro+</span>}
                                </div>
                                <div className="flex items-center text-xs gap-1.5">
                                    {tier !== "FREE" ? (
                                        <span className="text-green-500">✓</span>
                                    ) : (
                                        <Lock className="h-3 w-3 text-muted-foreground" />
                                    )}
                                    <span className={tier === "FREE" ? "text-muted-foreground" : ""}>CSV Export</span>
                                    {tier === "FREE" && <span className="text-xs text-muted-foreground ml-auto">Pro+</span>}
                                </div>
                                <div className="flex items-center text-xs gap-1.5">
                                    {tier === "ENTERPRISE" ? (
                                        <span className="text-green-500">✓</span>
                                    ) : (
                                        <Lock className="h-3 w-3 text-muted-foreground" />
                                    )}
                                    <span className={tier !== "ENTERPRISE" ? "text-muted-foreground" : ""}>Custom Slugs</span>
                                    {tier !== "ENTERPRISE" && <span className="text-xs text-muted-foreground ml-auto">Enterprise</span>}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={pending}>
                                {pending ? "Creating..." : "Shorten"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            )}
        </Dialog>
    )
}
