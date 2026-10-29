import { redirect } from 'next/navigation';
import { prisma } from '@platform/db';
import { getSession } from '@/lib/auth-server';
import { hasRequiredRole } from '@/lib/auth';
import { Role } from '@platform/types';
import {
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Heading,
  Paragraph,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@platform/ui';
import { Users, Key, Database, FlaskConical, Sparkles, History } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !hasRequiredRole(user.role as Role, Role.ADMIN)) {
    redirect('/dashboard');
  }

  const [totalUsers, activeApiKeys, datasetEntries, experimentRuns, feedbackCount, auditLogs] =
    await Promise.all([
      prisma.user.count(),
      prisma.apiKey.count(),
      prisma.formDatasetEntry.count(),
      prisma.experimentRun.count(),
      prisma.auditLog.count({ where: { action: { startsWith: 'AI_PREDICTION' } } }),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { user: true } }),
    ]);

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, hint: 'Registered accounts' },
    { label: 'API Keys', value: activeApiKeys, icon: Key, hint: 'Developer credentials' },
    { label: 'Dataset Entries', value: datasetEntries, icon: Database, hint: 'Collected form fields' },
    { label: 'Experiments', value: experimentRuns, icon: FlaskConical, hint: 'Benchmark runs' },
    { label: 'AI Feedback', value: feedbackCount, icon: Sparkles, hint: 'Extension prediction feedback' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="flex flex-col gap-1">
        <Heading level={2}>System Administration</Heading>
        <Paragraph>
          Live platform metrics: accounts, developer keys, dataset growth, experiments, and audit trail.
        </Paragraph>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <stat.icon className="h-4 w-4 text-zinc-500" />
                <span>{stat.label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
              <p className="text-[10px] text-zinc-400 mt-1">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-4 w-4 text-zinc-500" />
            <span>Recent Audit Trail</span>
          </CardTitle>
          <CardDescription>Latest 10 recorded platform events</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {auditLogs.length === 0 ? (
            <p className="text-sm text-zinc-500 px-6 pb-6">No audit events recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {log.createdAt.toISOString().replace('T', ' ').slice(0, 19)}
                    </TableCell>
                    <TableCell className="text-xs">{log.user?.email || 'system'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500 max-w-md truncate">
                      {log.details || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
