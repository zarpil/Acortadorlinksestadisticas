import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { UAParser } from "ua-parser-js";

function render404() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 — Link Not Found</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #09090b; color: #fafafa; text-align: center; padding: 1rem;
        }
        .container { max-width: 420px; }
        .icon { font-size: 4rem; margin-bottom: 1.5rem; opacity: 0.4; }
        h1 { font-size: 3rem; font-weight: 700; letter-spacing: -0.025em; margin-bottom: 0.5rem; }
        .subtitle { font-size: 1.25rem; color: #a1a1aa; margin-bottom: 0.25rem; }
        .desc { font-size: 0.875rem; color: #71717a; margin-bottom: 2rem; max-width: 320px; margin-left: auto; margin-right: auto; }
        .buttons { display: flex; gap: 1rem; justify-content: center; }
        .btn {
            display: inline-flex; align-items: center; padding: 0.5rem 1.25rem;
            border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500;
            text-decoration: none; transition: all 0.15s;
        }
        .btn-primary { background: #fafafa; color: #09090b; }
        .btn-primary:hover { background: #e4e4e7; }
        .btn-outline { border: 1px solid #27272a; color: #fafafa; background: transparent; }
        .btn-outline:hover { background: #27272a; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">☹</div>
        <h1>404</h1>
        <p class="subtitle">Page not found</p>
        <p class="desc">The link you followed may be broken, expired, or the page may have been removed.</p>
        <div class="buttons">
            <a href="/" class="btn btn-primary">Go Home</a>
            <a href="/dashboard" class="btn btn-outline">Dashboard</a>
        </div>
    </div>
</body>
</html>`;
    return new NextResponse(html, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" }
    });
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    if (!slug) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    const link = await prisma.link.findUnique({
        where: { slug },
        include: { campaign: true },
    });

    if (!link) {
        return render404();
    }

    // If the campaign is archived, the link is disabled
    if (link.campaign?.isArchived) {
        return render404();
    }

    // If the link has expired (TTL)
    if ((link as any).expiresAt && new Date() > (link as any).expiresAt) {
        return render404();
    }

    // Capture Request Metadata
    const ipHeader = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const ip = ipHeader.split(",")[0].trim();

    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";
    const language = req.headers.get("accept-language")?.split(",")[0] || "Unknown";

    // Extract UTM Parameters from the requested URL
    const searchParams = req.nextUrl.searchParams;
    const utm_source = searchParams.get("utm_source");
    const utm_medium = searchParams.get("utm_medium");
    const utm_campaign = searchParams.get("utm_campaign");

    // Asynchronous Tracking Logic (Fire and Forget)
    trackClickMetadata({
        linkId: link.id,
        ip,
        userAgent,
        referer,
        language,
        utm_source,
        utm_medium,
        utm_campaign
    }).catch(err => console.error("Async Tracking Error:", err));

    // If the link has custom OG meta tags, serve an HTML page so social media
    // crawlers (Facebook, WhatsApp, Twitter) can read the preview metadata.
    // Regular users will be redirected instantly via JavaScript.
    const hasOgTags = (link as any).ogTitle || (link as any).ogDescription || (link as any).ogImage;

    if (hasOgTags) {
        const ogTitle = ((link as any).ogTitle || "").replace(/"/g, "&quot;");
        const ogDesc = ((link as any).ogDescription || "").replace(/"/g, "&quot;");
        const ogImage = ((link as any).ogImage || "").replace(/"/g, "&quot;");
        const destUrl = link.originalUrl.replace(/"/g, "&quot;");

        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${ogTitle}</title>
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDesc}" />
    ${ogImage ? `<meta property="og:image" content="${ogImage}" />` : ""}
    <meta property="og:url" content="${destUrl}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDesc}" />
    ${ogImage ? `<meta name="twitter:image" content="${ogImage}" />` : ""}
    <meta http-equiv="refresh" content="0;url=${destUrl}" />
</head>
<body>
    <script>window.location.replace("${link.originalUrl.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}");</script>
    <p>Redirecting to <a href="${destUrl}">${destUrl}</a>...</p>
</body>
</html>`;

        return new NextResponse(html, {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" }
        });
    }

    // Standard redirect for links without OG meta tags
    return NextResponse.redirect(link.originalUrl, 302);
}


// --- 
// Non-Blocking Tracking Function 
// ---
async function trackClickMetadata(data: {
    linkId: string;
    ip: string;
    userAgent: string;
    referer: string;
    language: string;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
}) {
    // 1. Parse User Agent
    const parser = new UAParser(data.userAgent);
    const browserArgs = parser.getBrowser();
    const osArgs = parser.getOS();
    const deviceArgs = parser.getDevice();

    const browser = browserArgs.name || "Unknown";
    const os = osArgs.name || "Unknown";

    // Determine Device Type
    let deviceType = deviceArgs.type || "Desktop";
    if (deviceType === "mobile") deviceType = "Mobile";
    if (deviceType === "tablet") deviceType = "Tablet";

    const deviceBrand = deviceArgs.vendor || "Unknown";

    // 2. Geolocation lookup with fallbacks
    let country = "Unknown";
    let city = "Unknown";
    let region = "Unknown";
    let isp = "Unknown";
    let isVpn = false;
    let metadata: any = {};

    // Do not call Geo API for local IPs to avoid errors
    const isLocal = data.ip === "127.0.0.1" || data.ip === "::1" || data.ip.startsWith("192.168.");

    if (!isLocal) {
        try {
            const geoApi = process.env.IPAPI_KEY
                ? `http://api.ipapi.com/api/${data.ip}?access_key=${process.env.IPAPI_KEY}&security=1`
                : `https://ipapi.co/${data.ip}/json/`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const resp = await fetch(geoApi, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (resp.ok) {
                const geoData = await resp.json();
                metadata = geoData; // Store full JSON response for audits

                if (process.env.IPAPI_KEY) {
                    // ipapi.com structure
                    country = geoData.country_name || "Unknown";
                    city = geoData.city || "Unknown";
                    region = geoData.region_name || "Unknown";
                    isVpn = geoData.security?.is_vpn || geoData.security?.is_proxy || false;
                    isp = geoData.connection?.isp || "Unknown";
                } else {
                    // ipapi.co structure (fallback)
                    country = geoData.country_name || "Unknown";
                    city = geoData.city || "Unknown";
                    region = geoData.region || "Unknown";
                    isp = geoData.org || "Unknown";
                }
            }
        } catch (e) {
            console.error("Geo API Error:", e);
        }
    }

    // 3. Database Insertion
    try {
        await prisma.clickLog.create({
            data: {
                linkId: data.linkId,
                ip: data.ip,
                country,
                city,
                region,
                browser,
                os,
                device: deviceType,
                deviceBrand,
                referer: data.referer,
                language: data.language,
                isp,
                isVpn,
                utm_source: data.utm_source,
                utm_medium: data.utm_medium,
                utm_campaign: data.utm_campaign,
                metadata: metadata // Store the JSONB blob
            },
        });
    } catch (e) {
        console.error("Log insertion failed:", e);
    }
}
