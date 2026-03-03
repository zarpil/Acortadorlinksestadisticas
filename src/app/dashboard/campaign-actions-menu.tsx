"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreVertical, Archive, Download, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { archiveCampaign, deleteCampaign, updateCampaign } from "./campaigns/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CampaignActionsMenuProps {
    campaignId: string;
    isArchived: boolean;
    campaignName?: string;
    campaignDescription?: string;
}

export function CampaignActionsMenu({ campaignId, isArchived, campaignName = "", campaignDescription = "" }: CampaignActionsMenuProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editName, setEditName] = useState(campaignName);
    const [editDescription, setEditDescription] = useState(campaignDescription);

    const handleArchive = async () => {
        setIsLoading(true);
        await archiveCampaign(campaignId);
        setIsLoading(false);
        setShowArchiveConfirm(false);
    };

    const handleDelete = async () => {
        setIsLoading(true);
        const result = await deleteCampaign(campaignId);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Campaign deleted permanently.");
            router.push("/dashboard");
        }
        setIsLoading(false);
        setShowDeleteConfirm(false);
    };

    const handleEdit = async () => {
        setIsLoading(true);
        const result = await updateCampaign(campaignId, {
            name: editName,
            description: editDescription
        });
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Campaign updated.");
        }
        setIsLoading(false);
        setShowEditDialog(false);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/campaigns/${campaignId}`} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <a href={`/api/campaigns/${campaignId}/export`} download className="cursor-pointer">
                            <Download className="mr-2 h-4 w-4" />
                            Export Data (CSV)
                        </a>
                    </DropdownMenuItem>
                    {!isArchived && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    setEditName(campaignName);
                                    setEditDescription(campaignDescription);
                                    setShowEditDialog(true);
                                }}
                                className="cursor-pointer"
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setShowArchiveConfirm(true)}
                                disabled={isLoading}
                                className="cursor-pointer text-destructive focus:text-destructive"
                            >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                            </DropdownMenuItem>
                        </>
                    )}
                    {isArchived && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={isLoading}
                                className="cursor-pointer text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Permanently
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Archive Confirmation */}
            <AlertDialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive this campaign permanently?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action <strong>cannot be undone</strong>. All shortened links in this campaign will <strong>stop working immediately</strong> and visitors will see a 404 page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleArchive}
                            disabled={isLoading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isLoading ? "Archiving..." : "Yes, archive permanently"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this campaign forever?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will <strong>permanently delete</strong> this campaign, all its links, and all click analytics data. This action <strong>cannot be undone</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isLoading ? "Deleting..." : "Delete forever"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Campaign Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Campaign</DialogTitle>
                        <DialogDescription>
                            Update your campaign name and description.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description (Optional)</Label>
                            <Input
                                id="edit-description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleEdit} disabled={isLoading || !editName.trim()}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
