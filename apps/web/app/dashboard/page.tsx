import * as React from 'react';
import { prisma } from '@platform/db';
import { getSession } from '@/lib/auth-server';
import { calculateProfileCompletion } from '@/lib/profile-completion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@platform/ui';
import { 
  Plus, FileText, AlertTriangle, ArrowRight, CheckCircle2, 
  Briefcase, Code, CheckCircle, ShieldCheck, Activity 
} from 'lucide-react';
import { formatTimeAgo } from '@platform/utils';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  // Fetch profile, audit logs, notifications and resume count in parallel
  const [profile, auditLogs, notifications, resumeCount] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: session.userId },
      include: {
        experiences: true,
        educations: true,
        projects: true,
        skills: true,
      },
    }),
    prisma.auditLog.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.notification.findMany({
      where: { userId: session.userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.resume.count({
      where: { userId: session.userId },
    }),
  ]);

  // Calculate completion
  const completion = profile 
    ? calculateProfileCompletion(profile as any)
    : { score: 0, completedSteps: [], missingSteps: ['Headline', 'Biography', 'Location', 'Work Experience', 'Education', 'Projects', 'Skills'] };

  // Calculate counts
  const experienceCount = profile?.experiences.length || 0;
  const projectCount = profile?.projects.length || 0;
  const skillCount = profile?.skills.length || 0;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Sticky Header */}
     <div className="sticky top-4 z-10 mb-6">
  <div className="relative overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm px-6 md:px-8 py-6">

    {/* Soft Background Accent */}
    <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-sky-500/5 blur-3xl" />
    <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-[100px] bg-sky-100/60 dark:bg-sky-500/5" />

    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">

      {/* Left */}
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100/70 dark:bg-zinc-800/70 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">
          Dashboard
        </span>

        <h1 className="mt-4 flex items-center gap-3 text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Welcome back, {session.name}
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50 animate-ping"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
          </span>
        </h1>

        <p className="mt-2 text-sm md:text-base text-zinc-500 dark:text-zinc-400">
          Manage your profile, resumes, and extension sync in one place.
        </p>
      </div>

      {/* Right */}
      <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-950/20 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        </span>
        Extension Sync Active
      </div>

    </div>
  </div>
</div>

      <div className="space-y-6 pt-2">

      {/* Metrics Cards Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Identity Score</span>
              <CheckCircle2 className="h-5 w-5 text-zinc-900 dark:text-zinc-50" />
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{completion.score}%</p>
              <p className="text-[10px] text-zinc-500 truncate">Master profile complete</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Experiences</span>
              <Briefcase className="h-5 w-5 text-zinc-900 dark:text-zinc-50" />
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{experienceCount}</p>
              <p className="text-[10px] text-zinc-500 truncate">Job nodes verified</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Projects</span>
              <Code className="h-5 w-5 text-zinc-900 dark:text-zinc-50" />
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{projectCount}</p>
              <p className="text-[10px] text-zinc-500 truncate">Portfolio artifacts</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Active Resumes</span>
              <FileText className="h-5 w-5 text-zinc-900 dark:text-zinc-50" />
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{resumeCount}</p>
              <p className="text-[10px] text-zinc-500 truncate">ATS optimized variations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Profile Builder Status & Action Triggers */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Identity Progress Tracker</CardTitle>
              <CardDescription>Keep your master profile detailed to improve autofill accuracy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-zinc-900 dark:bg-zinc-50 h-full transition-all duration-500 rounded-full" 
                  style={{ width: `${completion.score}%` }}
                />
              </div>

              {completion.missingSteps.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Missing Fields to Complete</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {completion.missingSteps.slice(0, 4).map((step, idx) => (
                      <a 
                        key={idx} 
                        href="/dashboard/profile"
                        className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{step} is missing</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/50 dark:bg-emerald-950/15 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                  <CheckCircle className="h-4 w-4" />
                  <span>Profile fully synced! Autofill algorithms are running with maximum match score.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Identity Action Panel</CardTitle>
              <CardDescription>Fast actions to configure nodes in your master identity file.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <a href="/dashboard/profile" className="block">
                <Button variant="outline" className="w-full justify-center gap-2 text-xs rounded-xl py-5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Work Node</span>
                </Button>
              </a>
              <a href="/dashboard/profile" className="block">
                <Button variant="outline" className="w-full justify-center gap-2 text-xs rounded-xl py-5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Tech Skill</span>
                </Button>
              </a>
              <a href="/dashboard/resumes" className="block">
                <Button variant="outline" className="w-full justify-center gap-2 text-xs rounded-xl py-5">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Add ATS Resume</span>
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* User Skills Summary */}
          {profile?.skills && profile.skills.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Skill Matrix Catalog</CardTitle>
                <CardDescription>Verified skills parsed by your companion browser extension ({skillCount} skills).</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {profile.skills.map((skill: any, idx: number) => (
                  <Badge key={idx} variant="outline" className="px-3 py-1 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 font-medium">
                    {skill.name} • <span className="text-zinc-500 text-[10px]">{skill.level.toLowerCase()}</span>
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Logs, Alerts, and Audit timeline */}
        <div className="space-y-6">
          {/* Notifications Panel */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Alerts & System Info</CardTitle>
              <CardDescription>Active notices from extension sync engines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((n, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 text-xs">
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-zinc-900 dark:text-white leading-snug">{n.title}</p>
                      <p className="text-zinc-500 dark:text-zinc-400 leading-normal">{n.message}</p>
                      <p className="text-[10px] text-zinc-400 mt-1">{formatTimeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-zinc-400 space-y-1">
                  <ShieldCheck className="h-6 w-6 mx-auto opacity-40 text-zinc-500" />
                  <p className="text-xs">All systems operational</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit trail activity log */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Security Audit Logs</CardTitle>
              <CardDescription>Timeline of changes made to your data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {auditLogs.length > 0 ? (
                <div className="relative border-l border-zinc-200 dark:border-zinc-800 pl-4 ml-2 space-y-4 text-xs">
                  {auditLogs.map((log, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline circle indicator */}
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-zinc-450 dark:bg-zinc-700 border border-white dark:border-zinc-950" />
                      <div className="space-y-0.5">
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize leading-none mb-1">
                          {log.action.replace(/_/g, ' ').toLowerCase()}
                        </p>
                        {log.details && <p className="text-zinc-500 dark:text-zinc-400 leading-normal">{log.details}</p>}
                        <p className="text-[10px] text-zinc-400 mt-1">{formatTimeAgo(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-zinc-400 space-y-1">
                  <Activity className="h-6 w-6 mx-auto opacity-40 text-zinc-500" />
                  <p className="text-xs">No audit logs logged</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
