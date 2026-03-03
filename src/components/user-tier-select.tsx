"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useTransition } from "react"
import { updateUserTier } from "@/app/admin/actions"

interface UserTierSelectProps {
    userId: string;
    currentTier: "FREE" | "PRO" | "ENTERPRISE";
}

export function UserTierSelect({ userId, currentTier }: UserTierSelectProps) {
    const [isPending, startTransition] = useTransition();

    const handleValueChange = (value: "FREE" | "PRO" | "ENTERPRISE") => {
        startTransition(async () => {
            const res = await updateUserTier(userId, value);
            if (res?.success) {
                toast.success("User tier updated successfully.");
            } else {
                toast.error(res?.message || "Failed to update user tier.");
            }
        });
    }

    return (
        <Select defaultValue={currentTier} onValueChange={handleValueChange} disabled={isPending}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
            </SelectContent>
        </Select>
    )
}
