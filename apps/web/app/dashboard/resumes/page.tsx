'use client';

import * as React from 'react';
import { 
  Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Badge,
  Input, Textarea, Label, Alert, AlertTitle, AlertDescription, Spinner, EmptyState
} from '@platform/ui';
import { Plus, Trash2, Edit2, Check, AlertCircle, FileText } from 'lucide-react';
import { formatDate } from '@platform/utils';

export default function ResumesPage() {
  const [resumes, setResumes] = React.useState<any[]>([]);
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Dialog state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingResume, setEditingResume] = React.useState<any>(null);

  // Form states
  const [resumeForm, setResumeForm] = React.useState({
    title: '',
    targetRole: '',
    summary: '',
    isDefault: false,
  });

  // Selected item IDs
  const [selectedExperiences, setSelectedExperiences] = React.useState<string[]>([]);
  const [selectedEducations, setSelectedEducations] = React.useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [resumesRes, profileRes] = await Promise.all([
        fetch('/api/resumes'),
        fetch('/api/profile'),
      ]);

      if (!resumesRes.ok || !profileRes.ok) throw new Error('Failed to load dashboard data');

      const resumesData = await resumesRes.json();
      const profileData = await profileRes.json();

      setResumes(resumesData.resumes);
      setProfile(profileData.profile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingResume(null);
    setResumeForm({
      title: '',
      targetRole: '',
      summary: '',
      isDefault: false,
    });
    setSelectedExperiences([]);
    setSelectedEducations([]);
    setSelectedProjects([]);
    setSelectedSkills([]);
    setIsModalOpen(true);
  };

  const openEditModal = (resume: any) => {
    setEditingResume(resume);
    setResumeForm({
      title: resume.title,
      targetRole: resume.targetRole || '',
      summary: resume.summary || '',
      isDefault: resume.isDefault,
    });
    const structure = resume.structure || {};
    setSelectedExperiences(structure.experiences || []);
    setSelectedEducations(structure.educations || []);
    setSelectedProjects(structure.projects || []);
    setSelectedSkills(structure.skills || []);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const isEdit = !!editingResume;
    const url = `/api/resumes${isEdit ? `?id=${editingResume.id}` : ''}`;
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      ...resumeForm,
      structure: {
        experiences: selectedExperiences,
        educations: selectedEducations,
        projects: selectedProjects,
        skills: selectedSkills,
        certifications: [],
        awards: [],
        languages: [],
      },
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save resume');
      }

      setIsModalOpen(false);
      fetchData();
      setSuccess('Resume configuration saved successfully.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/resumes?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete resume');
      }

      fetchData();
      setSuccess('Resume deleted successfully.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleSelection = (id: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Sticky Header */}
      <div className="sticky top-4 z-10 mb-6">
  <div className="relative overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl shadow-xl shadow-zinc-900/5 dark:shadow-black/20 px-6 md:px-8 py-6">

    {/* Background Decoration */}
    <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/15 via-indigo-500/10 to-sky-500/10 blur-3xl" />
    <div className="absolute top-0 right-0 h-40 w-40 rounded-bl-[120px] bg-gradient-to-bl from-violet-100/80 via-blue-100/50 to-transparent dark:from-violet-500/10 dark:via-blue-500/10 dark:to-transparent" />

    <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

      {/* Left */}
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/60 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
          <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
          Resume Manager
        </span>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Resumes
        </h1>

        <p className="mt-2 text-sm md:text-base text-zinc-600 dark:text-zinc-400">
          Create and manage resumes for different job roles.
        </p>
      </div>

      {/* Right */}
      <Button
        onClick={openAddModal}
        className="rounded-xl px-5 h-11 gap-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:via-indigo-700 hover:to-blue-700 shadow-lg shadow-violet-500/20 transition-all duration-300 hover:scale-[1.02]"
      >
        <Plus className="h-4 w-4" />
        <span>New Resume</span>
      </Button>

    </div>
  </div>
</div>

      <div className="space-y-6 pt-2 px-1">

      {success && (
        <Alert variant="success">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {resumes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {resumes.map((resume) => (
            <Card key={resume.id} className={resume.isDefault ? 'border-zinc-900 dark:border-zinc-100' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-zinc-500" />
                      <CardTitle className="text-base">{resume.title}</CardTitle>
                    </div>
                    {resume.targetRole && <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{resume.targetRole}</p>}
                  </div>
                  {resume.isDefault && <Badge variant="default">Default</Badge>}
                </div>
              </CardHeader>
              <CardContent className="text-xs text-zinc-500 min-h-[50px] line-clamp-2">
                {resume.summary || 'No summary configured.'}
              </CardContent>
              <CardFooter className="flex justify-between border-t border-zinc-100 dark:border-zinc-900/50 pt-4">
                <span className="text-[10px] text-zinc-400">Updated {formatDate(resume.updatedAt)}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(resume)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(resume.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No Resumes Configured" description="Create custom resume targets highlighting your best projects, skills, and work experience." actionText="Create First Resume" onAction={openAddModal} />
      )}

      {/* RESUME CONFIGURATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-50 w-full max-w-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-lg rounded-lg max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {editingResume ? 'Edit' : 'Create'} Resume Profile
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Metadata */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="resTitle">Resume Title</Label>
                    <Input id="resTitle" value={resumeForm.title} onChange={e => setResumeForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Software Engineer (Full Stack)" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="resRole">Target Role</Label>
                    <Input id="resRole" value={resumeForm.targetRole} onChange={e => setResumeForm(prev => ({ ...prev, targetRole: e.target.value }))} placeholder="e.g. Senior Frontend Developer" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="resSummary">Profile Summary</Label>
                  <Textarea id="resSummary" rows={3} value={resumeForm.summary} onChange={e => setResumeForm(prev => ({ ...prev, summary: e.target.value }))} placeholder="Tailored summary matching your target job..." />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="resDefault" checked={resumeForm.isDefault} onChange={e => setResumeForm(prev => ({ ...prev, isDefault: e.target.checked }))} />
                  <Label htmlFor="resDefault">Mark as default resume</Label>
                </div>
              </div>

              {/* Node Selectors */}
              <div className="space-y-4 border-t border-zinc-100 dark:border-zinc-900 pt-4">
                <h4 className="text-sm font-bold">Select Profile Nodes to Include</h4>

                {/* Experiences */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Work Experience</Label>
                  {profile.experiences?.length > 0 ? (
                    <div className="grid gap-2">
                      {profile.experiences.map((exp: any) => (
                        <div key={exp.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
                          <input type="checkbox" className="mt-0.5" checked={selectedExperiences.includes(exp.id)} onChange={() => toggleSelection(exp.id, selectedExperiences, setSelectedExperiences)} />
                          <div>
                            <p className="font-semibold">{exp.position} at {exp.company}</p>
                            <p className="text-zinc-500">{formatDate(exp.startDate)} – {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">No experience available in profile.</p>
                  )}
                </div>

                {/* Educations */}
                <div className="space-y-2 pt-2">
                  <Label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Education</Label>
                  {profile.educations?.length > 0 ? (
                    <div className="grid gap-2">
                      {profile.educations.map((edu: any) => (
                        <div key={edu.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
                          <input type="checkbox" className="mt-0.5" checked={selectedEducations.includes(edu.id)} onChange={() => toggleSelection(edu.id, selectedEducations, setSelectedEducations)} />
                          <div>
                            <p className="font-semibold">{edu.degree} in {edu.fieldOfStudy}</p>
                            <p className="text-zinc-500">{edu.school}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">No education available in profile.</p>
                  )}
                </div>

                {/* Projects */}
                <div className="space-y-2 pt-2">
                  <Label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Projects</Label>
                  {profile.projects?.length > 0 ? (
                    <div className="grid gap-2">
                      {profile.projects.map((proj: any) => (
                        <div key={proj.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
                          <input type="checkbox" className="mt-0.5" checked={selectedProjects.includes(proj.id)} onChange={() => toggleSelection(proj.id, selectedProjects, setSelectedProjects)} />
                          <div>
                            <p className="font-semibold">{proj.title}</p>
                            <p className="text-zinc-500 line-clamp-1">{proj.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">No projects available in profile.</p>
                  )}
                </div>

                {/* Skills */}
                <div className="space-y-2 pt-2">
                  <Label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Skills</Label>
                  {profile.skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                      {profile.skills.map((sk: any) => (
                        <label key={sk.id} className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 text-xs cursor-pointer select-none">
                          <input type="checkbox" checked={selectedSkills.includes(sk.id)} onChange={() => toggleSelection(sk.id, selectedSkills, setSelectedSkills)} />
                          <span className="font-medium">{sk.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">No skills available in profile.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900/50">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Resume'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
