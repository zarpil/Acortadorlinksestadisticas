import { auth } from "@/auth";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isAuthRoute =
        nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

    const isProtectedRoute =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/admin") ||
        nextUrl.pathname.startsWith("/settings");

    if (isApiAuthRoute) {
        return;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return;
    }

    if (!isLoggedIn && isProtectedRoute) {
        return Response.redirect(new URL("/login", nextUrl));
    }

    return;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
