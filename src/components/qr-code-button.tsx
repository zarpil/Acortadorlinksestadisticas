"use client"

import { Button } from "@/components/ui/button"
import { QrCode } from "lucide-react"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface QrCodeButtonProps {
    url: string
    slug: string
}

export function QrCodeButton({ url, slug }: QrCodeButtonProps) {
    const [open, setOpen] = useState(false)

    // Use free Google Charts QR API (no external dependency)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                <QrCode className="h-4 w-4" />
                <span className="sr-only">QR Code</span>
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>QR Code for /{slug}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        <img
                            src={qrUrl}
                            alt={`QR Code for ${url}`}
                            width={250}
                            height={250}
                            className="rounded-lg border"
                        />
                        <p className="text-sm text-muted-foreground text-center break-all">
                            {url}
                        </p>
                        <Button variant="outline" asChild className="w-full">
                            <a href={qrUrl} download={`qr-${slug}.png`} target="_blank" rel="noopener noreferrer">
                                Download QR Code
                            </a>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
