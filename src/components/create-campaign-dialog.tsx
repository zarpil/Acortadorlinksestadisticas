"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Tier } from "@prisma/client"
import { getTierLimits } from "@/lib/limits"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { PlusCircle } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { createCampaign } from "@/app/dashboard/actions"

interface CreateCampaignDialogProps {
    userId: string
    tier: Tier
    currentCount: number
}

export function CreateCampaignDialog({ userId, tier, currentCount }: CreateCampaignDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [pending, setPending] = React.useState(false)

    const limit = getTierLimits(tier).maxCampaigns
    const canCreate = currentCount < limit

    async function clientAction(formData: FormData) {
        setPending(true)
        try {
            const result = await createCampaign(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Campaign created!")
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
                    if (!canCreate) {
                        e.preventDefault()
                        toast.error(`You have reached your limit of ${limit} campaigns. Please upgrade.`)
                    }
                }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Campaign
                </Button>
            </DialogTrigger>
            {canCreate && (
                <DialogContent className="sm:max-w-[425px]">
                    <form action={clientAction}>
                        <DialogHeader>
                            <DialogTitle>Create Campaign</DialogTitle>
                            <DialogDescription>
                                Add a new campaign to group your short links.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" placeholder="E.g. Summer Sale 2026" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input id="description" name="description" placeholder="A brief description of this campaign" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={pending}>
                                {pending ? "Creating..." : "Create Campaign"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            )}
        </Dialog>
    )
}
