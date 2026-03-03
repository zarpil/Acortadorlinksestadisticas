import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LinkIcon, Zap, Shield, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center font-bold text-lg tracking-tight" href="#">
          <Zap className="h-6 w-6 mr-2 text-primary" />
          Kutt.
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center flex-row">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
            Pricing
          </Link>
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4 ml-4">
            Sign In
          </Link>
          <Button asChild size="sm">
            <Link href="/register">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 text-center" id="hero">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  High Performance <span className="text-primary">Short Links</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Shorten, track, and manage your links dynamically. Gain deep insights into your audience with our blazingly fast global redirection network.
                </p>
              </div>
              <div className="flex space-x-4">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/register">
                    Start for free <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#features">Learn more</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 border-t border-b">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Fast Redirects</h3>
                <p className="text-muted-foreground">Lightning fast 302 redirects with advanced caching to ensure your users get to the destination immediately.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Rich Analytics</h3>
                <p className="text-muted-foreground">Track operating systems, browsers, countries, and specific cities of your visitors in real time.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Organization & Privacy</h3>
                <p className="text-muted-foreground">Group your links into campaigns. Benefit from GDPR compliant analytics without compromising user privacy.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 text-center">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="mx-auto mb-10 space-y-4 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Simple Pricing</h2>
              <p className="text-muted-foreground md:text-xl">Choose a plan that scales with your growth.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col p-6 border rounded-lg shadow-sm">
                <h3 className="text-2xl font-bold">Free</h3>
                <p className="text-muted-foreground mt-2">Get started completely free.</p>
                <div className="mt-4 mb-8 text-4xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-2 mb-8 flex-1 text-sm text-center">
                  <li>1 Active Campaign</li>
                  <li>5 Links Total</li>
                  <li>Basic Analytics</li>
                </ul>
                <Button asChild variant="outline" className="w-full"><Link href="/register">Sign Up Free</Link></Button>
              </div>
              <div className="flex flex-col p-6 border rounded-lg shadow-md border-primary relative">
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold w-max">OVERKILL</div>
                <h3 className="text-2xl font-bold">Pro</h3>
                <p className="text-muted-foreground mt-2">For serious creators and marketers.</p>
                <div className="mt-4 mb-8 text-4xl font-bold">$12<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-2 mb-8 flex-1 text-sm text-center">
                  <li>10 Active Campaigns</li>
                  <li>10 Links per Campaign</li>
                  <li>Advanced Geolocation Analytics</li>
                  <li>Priority Support</li>
                </ul>
                <Button asChild className="w-full"><Link href="/register">Start Pro</Link></Button>
              </div>
              <div className="flex flex-col p-6 border rounded-lg shadow-sm">
                <h3 className="text-2xl font-bold">Enterprise</h3>
                <p className="text-muted-foreground mt-2">For large-scale teams.</p>
                <div className="mt-4 mb-8 text-4xl font-bold">$49<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-2 mb-8 flex-1 text-sm text-center">
                  <li>Unlimited Campaigns</li>
                  <li>Unlimited Links</li>
                  <li>Custom SLAs</li>
                  <li>Dedicated Manager</li>
                </ul>
                <Button asChild variant="outline" className="w-full"><Link href="/register">Contact Sales</Link></Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2026 Kutt SaaS Template. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
