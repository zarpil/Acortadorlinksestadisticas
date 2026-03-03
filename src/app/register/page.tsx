"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "./actions";
import { useState, Suspense } from "react";

const errorMessages: Record<string, string> = {
    UserExists: "An account with that email already exists.",
    InvalidInput: "Please provide a valid email and a password with at least 6 characters.",
    PasswordsDoNotMatch: "The passwords you entered do not match.",
};

function RegisterForm() {
    const searchParams = useSearchParams();
    const errorParam = searchParams.get("error");
    const errorMessage = errorParam ? (errorMessages[errorParam] || "Something went wrong.") : null;
    const [pending, setPending] = useState(false);

    return (
        <>
            {errorMessage && (
                <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg font-medium text-center animate-in fade-in slide-in-from-top-2">
                    {errorMessage}
                </div>
            )}
            <form action={registerAction} onSubmit={() => setPending(true)} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground/80 font-medium">Email address</Label>
                        <Input
                            id="email"
                            name="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            required
                            className="bg-background/50 border-muted focus-visible:ring-primary/50 transition-colors h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground/80 font-medium">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a strong password (min. 6 chars)"
                            required
                            minLength={6}
                            className="bg-background/50 border-muted focus-visible:ring-primary/50 transition-colors h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-foreground/80 font-medium">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            required
                            minLength={6}
                            className="bg-background/50 border-muted focus-visible:ring-primary/50 transition-colors h-11"
                        />
                    </div>
                </div>

                <Button type="submit" disabled={pending} className="w-full h-11 font-medium shadow-none transition-all hover:shadow-md hover:shadow-primary/20">
                    {pending ? "Creating account..." : "Sign Up"}
                </Button>
            </form>
        </>
    );
}

export default function RegisterPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            {/* Glass Container */}
            <div className="relative z-10 w-full max-w-md px-6 py-12 mx-auto">
                <div className="backdrop-blur-xl bg-background/60 border border-border/50 shadow-2xl rounded-2xl p-8 transition-all duration-300 hover:shadow-primary/5 hover:border-border">
                    <div className="flex flex-col space-y-2 text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-6 w-6 text-primary"
                                >
                                    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Create an account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Join us to start shortening your links
                        </p>
                    </div>

                    <Suspense>
                        <RegisterForm />
                    </Suspense>

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-primary hover:underline hover:text-primary/80 transition-colors">
                            Sign in instead
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
