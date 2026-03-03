"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useState } from "react"
import { updateProfile, changePassword, deleteAccount } from "../actions"
import { signOut } from "next-auth/react"

interface ProfileFormProps {
    userName: string | null
    userEmail: string | null
}

export function ProfileForm({ userName, userEmail }: ProfileFormProps) {
    const [pendingProfile, setPendingProfile] = useState(false)
    const [pendingPassword, setPendingPassword] = useState(false)
    const [pendingDelete, setPendingDelete] = useState(false)

    const handleProfileUpdate = async (formData: FormData) => {
        setPendingProfile(true)
        const result = await updateProfile(formData)
        if (result.error) toast.error(result.error)
        else toast.success("Profile updated!")
        setPendingProfile(false)
    }

    const handlePasswordChange = async (formData: FormData) => {
        setPendingPassword(true)
        const result = await changePassword(formData)
        if (result.error) toast.error(result.error)
        else toast.success("Password changed successfully!")
        setPendingPassword(false)
    }

    const handleDeleteAccount = async () => {
        setPendingDelete(true)
        const result = await deleteAccount()
        if (result.error) {
            toast.error(result.error)
            setPendingDelete(false)
        } else {
            await signOut({ callbackUrl: "/login" })
        }
    }

    return (
        <div className="space-y-6">
            {/* Profile Info */}
            <Card>
                <form action={handleProfileUpdate}>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Update your display name.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={userEmail || ""} disabled className="bg-muted" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" placeholder="Your name" defaultValue={userName || ""} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={pendingProfile}>
                            {pendingProfile ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {/* Change Password */}
            <Card>
                <form action={handlePasswordChange}>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your account password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input id="currentPassword" name="currentPassword" type="password" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" name="newPassword" type="password" required minLength={6} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={pendingPassword}>
                            {pendingPassword ? "Changing..." : "Change Password"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Permanently delete your account and all associated data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={pendingDelete}>
                                {pendingDelete ? "Deleting..." : "Delete Account"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete your account, all campaigns, links, and analytics data. This action <strong>cannot be undone</strong>.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteAccount}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete my account forever
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    )
}
