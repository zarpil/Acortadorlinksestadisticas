"use client"

import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"

interface SearchInputProps {
    placeholder?: string
    paramName?: string
}

export function SearchInput({ placeholder = "Search...", paramName = "q" }: SearchInputProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const currentQuery = searchParams.get(paramName) || ""
    const [value, setValue] = useState(currentQuery)

    const updateSearch = useCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (term.trim()) {
            params.set(paramName, term.trim())
        } else {
            params.delete(paramName)
        }
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`)
        })
    }, [searchParams, pathname, router, paramName])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setValue(newValue)
        updateSearch(newValue)
    }

    const handleClear = () => {
        setValue("")
        updateSearch("")
    }

    return (
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className={`pl-9 pr-8 ${isPending ? "opacity-70" : ""}`}
            />
            {value && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={handleClear}
                >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Clear search</span>
                </Button>
            )}
        </div>
    )
}
