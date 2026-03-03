"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteLink } from "@/app/dashboard/campaigns/actions"

interface DeleteLinkButtonProps {
    linkId: string
    campaignId: string
    slug: string
}

export function DeleteLinkButton({ linkId, campaignId, slug }: DeleteLinkButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        setIsLoading(true)
        const result = await deleteLink(linkId, campaignId)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`Link /${slug} deleted.`)
        }
        setIsLoading(false)
        setShowConfirm(false)
    }

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setShowConfirm(true)} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
            </Button>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete link /{slug}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this shortened link and all its click data. This action <strong>cannot be undone</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isLoading ? "Deleting..." : "Delete permanently"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
