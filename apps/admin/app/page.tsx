'use client';

import * as React from 'react';
import { 
  Badge, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  Breadcrumbs, 
  Heading, 
  Paragraph, 
  PageLayout, 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@platform/ui';
import { Shield, Users, History, Settings, Sun, Moon, Sparkles, Key, CreditCard, LogOut } from 'lucide-react';
import { BRANDING } from '@platform/utils';

export default function AdminPage() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');
  const [aiFlag, setAiFlag] = React.useState(true);
  const [apiFlag, setApiFlag] = React.useState(true);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const currentTheme = savedTheme || 'dark';
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const breadcrumbs = [
    { label: 'Admin', href: '#' },
    { label: 'System Overview' }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white px-2">
          <Shield className="h-5 w-5 text-zinc-900 dark:text-white" />
          <span>{BRANDING.shortName} Admin</span>
        </div>
        <nav className="space-y-1">
          <a href="#" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium bg-zinc-100 text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-50 transition-all">
            <Users className="h-4 w-4" />
            <span>User Accounts</span>
          </a>
          <a href="#" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-50 transition-all">
            <History className="h-4 w-4" />
            <span>Audit Trail Logs</span>
          </a>
          <a href="#" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-50 transition-all">
            <Settings className="h-4 w-4" />
            <span>System Flags</span>
          </a>
        </nav>
      </div>

      <div className="space-y-4">
        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-zinc-500 dark:text-zinc-400 self-start ml-1">
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </Button>

        {/* User Info / Logout */}
        <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-bold text-sm border border-zinc-200 dark:border-zinc-700">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate leading-tight">Admin Manager</p>
            <p className="text-[10px] text-zinc-500 truncate leading-tight mt-0.5">admin@platform.com</p>
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
    </div>
  );

  return (
    <PageLayout sidebar={sidebarContent} className="space-y-6 max-w-5xl">
      <div className="flex flex-col gap-1">
        <Breadcrumbs items={breadcrumbs} className="mb-2" />
        <Heading level={2}>System Administration Overview</Heading>
        <Paragraph>
          Welcome to the {BRANDING.name} admin control panel. Monitor active subscriptions, developer scopes, system telemetry, and audit logs.
        </Paragraph>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Users className="h-4 w-4 text-zinc-500" />
              <span>Total Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <span className="text-2xl font-bold tracking-tight">1,482</span>
            <p className="text-[10px] text-green-500 font-semibold mt-1">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-zinc-500" />
              <span>Active Pro Tiers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <span className="text-2xl font-bold tracking-tight">320</span>
            <p className="text-[10px] text-zinc-400 mt-1">21.5% subscription rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Key className="h-4 w-4 text-zinc-500" />
              <span>Developer API Keys</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <span className="text-2xl font-bold tracking-tight">84</span>
            <p className="text-[10px] text-zinc-400 mt-1">Active client applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-zinc-500" />
              <span>AI Core Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <span className="text-2xl font-bold tracking-tight">12,492</span>
            <p className="text-[10px] text-green-500 font-semibold mt-1">99.8% prompt response rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Flags Toggle Control */}
        <Card>
          <CardHeader>
            <CardTitle>Global Feature Flags</CardTitle>
            <CardDescription>Configure user entitlements and toggles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-white">AI Resume Optimization Services</p>
                <p className="text-[10px] text-zinc-500">Provide AI improvement advice on user resumes</p>
              </div>
              <Button 
                variant={aiFlag ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setAiFlag(!aiFlag)}
              >
                {aiFlag ? 'ACTIVE' : 'PAUSED'}
              </Button>
            </div>
            <div className="flex items-center justify-between pb-1">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-white">Developer API Key Generation</p>
                <p className="text-[10px] text-zinc-500">Enable profile key access gates</p>
              </div>
              <Button 
                variant={apiFlag ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setApiFlag(!apiFlag)}
              >
                {apiFlag ? 'ACTIVE' : 'PAUSED'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Health Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status Scopes</CardTitle>
            <CardDescription>Telemetry check results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-semibold">Web API Gateway Node</span>
              <Badge variant="success">ONLINE</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-semibold">Database Engine Client</span>
              <Badge variant="success">OK (2ms query time)</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-semibold">AI Completion Queue</span>
              <Badge variant="success">RESOLVED</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Trail Logs</CardTitle>
          <CardDescription>Centralized telemetry logging and analytics</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Caller</TableHead>
                <TableHead>Action Log</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">2026-07-01T09:42:00Z</TableCell>
                <TableCell>USER_1982</TableCell>
                <TableCell>Triggered AI Resume Optimization</TableCell>
                <TableCell><Badge variant="outline">AI_SUCCESS</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">2026-07-01T09:41:05Z</TableCell>
                <TableCell>DEV_APP_84</TableCell>
                <TableCell>Fetched Profile API v1 (Authorized via Key)</TableCell>
                <TableCell><Badge variant="success">API_OK</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">2026-07-01T09:38:22Z</TableCell>
                <TableCell>SYSTEM</TableCell>
                <TableCell>Prisma Database migration sync completed</TableCell>
                <TableCell><Badge variant="outline">INFO</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
