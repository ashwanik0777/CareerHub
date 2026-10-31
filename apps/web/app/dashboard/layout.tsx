import * as React from 'react';
import { redirect } from 'next/navigation';
import { getSession, getCurrentUser } from '@/lib/auth-server';
import { hasRequiredRole } from '@/lib/auth';
import { Role } from '@platform/types';
import { LayoutDashboard, User, FileText, Settings, LogOut, Shield, ShieldCheck } from 'lucide-react';
import { BRANDING } from '@platform/utils';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const dbUser = await getCurrentUser();
  const isAdmin = !!dbUser && hasRequiredRole(dbUser.role as Role, Role.ADMIN);

  const initial = session.name ? session.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 m-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-md h-[calc(100vh-2.5rem)] shadow-sm flex-shrink-0">
        <div className="flex flex-col h-full justify-between p-6">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight px-2">
              <Shield className="h-5 w-5 text-zinc-900 dark:text-white" />
              <span>{BRANDING.name}</span>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              <a
                href="/dashboard"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-50 transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </a>
              <a
                href="/dashboard/profile"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-50 transition-all"
              >
                <User className="h-4 w-4" />
                <span>My Profile</span>
              </a>
              <a
                href="/dashboard/resumes"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-50 transition-all"
              >
                <FileText className="h-4 w-4" />
                <span>Resumes</span>
              </a>
              <a
                href="/dashboard/settings"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-50 transition-all"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </a>
              {isAdmin && (
                <a
                  href="/dashboard/admin"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-50 transition-all"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin</span>
                </a>
              )}
            </nav>
          </div>

          {/* User Info / Logout */}
          <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-bold text-sm border border-zinc-200 dark:border-zinc-700">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate leading-tight">{session.name}</p>
              <p className="text-[10px] text-zinc-500 truncate leading-tight mt-0.5">{session.email}</p>
            </div>
            <form action="/api/auth/logout" method="POST" className="flex items-center">
              <button
                type="submit"
                className="p-2 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <Shield className="h-5 w-5" />
            <span>{BRANDING.name}</span>
          </div>
          <div className="flex gap-2">
            <a href="/dashboard" className="p-1.5 text-zinc-500"><LayoutDashboard className="h-4 w-4" /></a>
            <a href="/dashboard/profile" className="p-1.5 text-zinc-500"><User className="h-4 w-4" /></a>
            <a href="/dashboard/resumes" className="p-1.5 text-zinc-500"><FileText className="h-4 w-4" /></a>
            <a href="/dashboard/settings" className="p-1.5 text-zinc-500"><Settings className="h-4 w-4" /></a>
            {isAdmin && (
              <a href="/dashboard/admin" className="p-1.5 text-zinc-500"><ShieldCheck className="h-4 w-4" /></a>
            )}
          </div>
        </header>

        <main className="flex-1 p-2 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
