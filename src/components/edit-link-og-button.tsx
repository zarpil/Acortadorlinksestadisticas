"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Share2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { updateLinkOG } from "@/app/dashboard/campaigns/actions"

interface EditLinkOGDialogProps {
    linkId: string
    campaignId: string
    slug: string
    currentOgTitle: string | null
    currentOgDescription: string | null
    currentOgImage: string | null
}

export function EditLinkOGButton({
    linkId,
    campaignId,
    slug,
    currentOgTitle,
    currentOgDescription,
    currentOgImage,
}: EditLinkOGDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [ogTitle, setOgTitle] = useState(currentOgTitle || "")
    const [ogDescription, setOgDescription] = useState(currentOgDescription || "")
    const [ogImage, setOgImage] = useState(currentOgImage || "")

    const handleSave = async () => {
        setIsLoading(true)
        const result = await updateLinkOG(linkId, campaignId, {
            ogTitle,
            ogDescription,
            ogImage,
        })
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Social preview updated!")
            setOpen(false)
        }
        setIsLoading(false)
    }

    const hasOgData = ogTitle || ogDescription || ogImage

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className={hasOgData ? "text-primary border-primary/50" : ""}
            >
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Social Preview</span>
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Social Media Preview</DialogTitle>
                        <DialogDescription>
                            Customize how /{slug} appears when shared on social media (Facebook, Twitter, WhatsApp, etc.)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="og-title">Title</Label>
                            <Input
                                id="og-title"
                                value={ogTitle}
                                onChange={(e) => setOgTitle(e.target.value)}
                                placeholder="My awesome page"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="og-description">Description</Label>
                            <Textarea
                                id="og-description"
                                value={ogDescription}
                                onChange={(e) => setOgDescription(e.target.value)}
                                placeholder="A brief description of what this link leads to..."
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="og-image">Image URL (Optional)</Label>
                            <Input
                                id="og-image"
                                value={ogImage}
                                onChange={(e) => setOgImage(e.target.value)}
                                placeholder="https://example.com/preview-image.jpg"
                                type="url"
                            />
                            <p className="text-xs text-muted-foreground">Recommended: 1200×630px for optimal display.</p>
                        </div>

                        {/* Live preview */}
                        {(ogTitle || ogDescription) && (
                            <div className="border rounded-lg overflow-hidden mt-2">
                                <div className="text-xs text-muted-foreground px-3 pt-2 pb-1 bg-muted">Preview</div>
                                {ogImage && (
                                    <img
                                        src={ogImage}
                                        alt="OG Preview"
                                        className="w-full h-32 object-cover"
                                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => (e.currentTarget.style.display = "none")}
                                    />
                                )}
                                <div className="p-3">
                                    {ogTitle && <p className="font-semibold text-sm">{ogTitle}</p>}
                                    {ogDescription && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ogDescription}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Preview"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
