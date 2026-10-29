import Link from 'next/link';
import { Shield, Chrome, ArrowRight, Code } from 'lucide-react';
import { Button } from '@platform/ui';
import { Navbar } from '@/components/Navbar';
import { BRANDING } from '@platform/utils';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl px-6 py-20 text-center md:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <span className="flex h-2 w-2 rounded-full bg-zinc-600 dark:bg-zinc-400"></span>
            Now Available: Chrome Extension v1.0
          </div>
          <h1 className="mt-8 text-4xl font-bold tracking-tight sm:text-6xl text-zinc-900 dark:text-white">
            Your Professional Identity,<br />Centralized.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Create your career profile once on {BRANDING.name}. Securely sync and auto-fill it across Greenhouse, Lever, LinkedIn, and corporate application forms with one click.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="flex items-center gap-2">
                <span>Create Your Profile</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                Dashboard
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="mx-auto max-w-7xl px-6 py-12 border-t border-zinc-200/50 dark:border-zinc-800/30">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                <Chrome className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">Autofill Companion</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Our Chrome Extension scans application forms on Lever, Greenhouse, Workday, and others, mapping matching inputs automatically.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">Data Sovereignty</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Your credentials and profile are secure. Cookies are HTTP-only and data transmission is fully encrypted. You control who sees your info.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                <Code className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">Open Developer APIs</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Connect your dashboard data to external CLI clients, personal portfolio builders, or write scripts using OAuth tokens and API keys.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-zinc-200 py-6 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between px-6 text-xs text-zinc-500 dark:text-zinc-400 gap-4">
          <p>© 2026 {BRANDING.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white">Terms of Service</a>
            <a href="https://github.com" className="hover:text-zinc-900 dark:hover:text-white">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
