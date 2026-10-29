'use client';

import * as React from 'react';
import { 
  Tabs, TabsList, TabsTrigger, TabsContent, 
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Input, Textarea, Label, Select, Badge,
  Spinner, EmptyState
} from '@platform/ui';
import { 
  User, Briefcase, GraduationCap, Code, Flame, Award, 
  Plus, Trash2, Edit2, Check, AlertCircle 
} from 'lucide-react';
import { formatDate } from '@platform/utils';
import { INDIA_STATES, INDIA_STATES_AND_DISTRICTS } from '@/lib/india-location-data';
import { SKILL_CATEGORIES } from '@/lib/skills-data';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = React.useState('personal');
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState<{type: 'success'|'error', text: string} | null>(null);

  const showToast = (type: 'success'|'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 6000);
  };
  const [formErrors, setFormErrors] = React.useState<Record<string, string[]>>({});
  const [pincodeLoading, setPincodeLoading] = React.useState(false);

  // Dialog states for CRUD
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalType, setModalType] = React.useState<'experience' | 'education' | 'project' | 'skill' | 'certification' | 'award' | 'language' | null>(null);
  const [editingItem, setEditingItem] = React.useState<any>(null);

  // Form input states
  const [personalForm, setPersonalForm] = React.useState({
    headline: '',
    bio: '',
    location: '',
    preferredLocation: '',
    availability: '',
    websiteUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    firstName: '',
    lastName: '',
    phone: '',
    alternatePhone: '',
    alternateEmail: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    maritalStatus: '',
    category: '',
    disabilityStatus: '',
    passportNumber: '',
    addressLine: '',
    addressCity: '',
    addressDistrict: '',
    addressState: '',
    addressCountry: 'India', // default to India
    addressZip: '',
    totalExperience: '',
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: '',
    workAuthorization: '',
    twitterUrl: '',
    portfolioUrl: '',
  });

  const [experienceForm, setExperienceForm] = React.useState({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    type: 'FULL_TIME',
    description: '',
  });

  const [educationForm, setEducationForm] = React.useState({
    school: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    grade: '',
    description: '',
  });

  const [projectForm, setProjectForm] = React.useState({
    title: '',
    description: '',
    url: '',
    githubUrl: '',
    startDate: '',
    endDate: '',
    technologies: '',
  });

  const [skillForm, setSkillForm] = React.useState({
    name: '',
    level: 'INTERMEDIATE',
    category: '',
  });

  const [certificationForm, setCertificationForm] = React.useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
  });

  const [awardForm, setAwardForm] = React.useState({
    title: '',
    issuer: '',
    date: '',
    description: '',
  });

  const [languageForm, setLanguageForm] = React.useState({
    name: '',
    proficiency: 'PROFESSIONAL',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      setProfile(data.profile);

      // Populate personal form
      if (data.profile) {
        setPersonalForm({
          headline: data.profile.headline || '',
          bio: data.profile.bio || '',
          location: data.profile.location || '',
          preferredLocation: data.profile.preferredLocation || '',
          availability: data.profile.availability || '',
          websiteUrl: data.profile.websiteUrl || '',
          githubUrl: data.profile.githubUrl || '',
          linkedinUrl: data.profile.linkedinUrl || '',
          firstName: data.profile.firstName || '',
          lastName: data.profile.lastName || '',
          phone: data.profile.phone || '',
          alternatePhone: data.profile.alternatePhone || '',
          alternateEmail: data.profile.alternateEmail || '',
          dateOfBirth: data.profile.dateOfBirth || '',
          gender: data.profile.gender || '',
          nationality: data.profile.nationality || '',
          maritalStatus: data.profile.maritalStatus || '',
          category: data.profile.category || '',
          disabilityStatus: data.profile.disabilityStatus || '',
          passportNumber: data.profile.passportNumber || '',
          addressLine: data.profile.addressLine || '',
          addressCity: data.profile.addressCity || '',
          addressDistrict: data.profile.addressDistrict || '',
          addressState: data.profile.addressState || '',
          addressCountry: data.profile.addressCountry || 'India',
          addressZip: data.profile.addressZip || '',
          totalExperience: data.profile.totalExperience || '',
          currentSalary: data.profile.currentSalary || '',
          expectedSalary: data.profile.expectedSalary || '',
          noticePeriod: data.profile.noticePeriod || '',
          workAuthorization: data.profile.workAuthorization || '',
          twitterUrl: data.profile.twitterUrl || '',
          portfolioUrl: data.profile.portfolioUrl || '',
        });
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalForm),
      });

      if (res.ok) {
        showToast('success', 'Personal information updated successfully.');
        const data = await res.json();
        setProfile((prev: any) => ({ ...prev, ...data.profile }));
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Failed to update profile');
        if (data.details) setFormErrors(data.details);
      }
    } catch (err: any) {
      showToast('error', err.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPersonalForm(prev => ({ ...prev, addressZip: val }));
    
    if (val.length === 6 && /^\d+$/.test(val)) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`/api/pincode?pincode=${val}`);
        if (res.ok) {
          const data = await res.json();
          setPersonalForm(prev => ({
            ...prev,
            addressCity: data.city || prev.addressCity,
            addressDistrict: data.district || prev.addressDistrict,
            addressState: data.state || prev.addressState,
            addressCountry: data.country || 'India'
          }));
        }
      } catch (err) {
        console.error('Pincode fetch failed', err);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  // Map singular modalType names to plural API route paths
  const getApiRoute = (type: string | null) => {
    const routeMap: Record<string, string> = {
      experience: 'experience',
      education: 'education',
      project: 'projects',
      skill: 'skills',
      certification: 'certifications',
      award: 'awards',
      language: 'languages',
    };
    return routeMap[type || ''] || type;
  };

  const handleCrudSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    const isEdit = !!editingItem;
    const apiRoute = getApiRoute(modalType);
    const url = `/api/profile/${apiRoute}${isEdit ? `?id=${editingItem.id}` : ''}`;
    const method = isEdit ? 'PUT' : 'POST';

    let payload: any = {};
    if (modalType === 'experience') {
      payload = { ...experienceForm };
      // When currently working, clear endDate to avoid validation error
      if (payload.isCurrent) {
        payload.endDate = null;
      } else if (!payload.endDate || payload.endDate === '') {
        payload.endDate = null;
      }
      // Clean empty strings to null for optional fields
      if (!payload.location) payload.location = null;
      if (!payload.description) payload.description = null;
    }
    if (modalType === 'education') {
      payload = { ...educationForm };
      // When currently studying, clear endDate to avoid validation error
      if (payload.isCurrent) {
        payload.endDate = null;
      } else if (!payload.endDate || payload.endDate === '') {
        payload.endDate = null;
      }
      // Clean empty strings to null for optional fields
      if (!payload.grade) payload.grade = null;
      if (!payload.description) payload.description = null;
    }
    if (modalType === 'project') {
      payload = {
        ...projectForm,
        technologies: projectForm.technologies.split(',').map(t => t.trim()).filter(Boolean)
      };
      if (!payload.url) payload.url = null;
      if (!payload.githubUrl) payload.githubUrl = null;
      if (!payload.startDate) payload.startDate = null;
      if (!payload.endDate) payload.endDate = null;
    }
    if (modalType === 'skill') {
      payload = { ...skillForm };
      if (!payload.category) payload.category = null;
    }
    if (modalType === 'certification') {
      payload = { ...certificationForm };
      if (!payload.expiryDate) payload.expiryDate = null;
      if (!payload.credentialId) payload.credentialId = null;
      if (!payload.credentialUrl) payload.credentialUrl = null;
    }
    if (modalType === 'award') {
      payload = { ...awardForm };
      if (!payload.description) payload.description = null;
    }
    if (modalType === 'language') payload = languageForm;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'Validation failed') {
          setFormErrors(data.details);
          throw new Error('Validation failed');
        }
        throw new Error(data.error || 'Operation failed');
      }

      setIsModalOpen(false);
      fetchProfile();
      showToast('success', `${modalType?.toUpperCase()} saved successfully.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleCrudDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const apiRoute = getApiRoute(type);
      const res = await fetch(`/api/profile/${apiRoute}?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete item');
      }

      fetchProfile();
      showToast('success', `${type.toUpperCase()} deleted successfully.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete item');
    }
  };

  const openAddModal = (type: typeof modalType) => {
    setModalType(type);
    setEditingItem(null);
    setFormErrors({});

    // Reset forms
    setExperienceForm({ company: '', position: '', location: '', startDate: '', endDate: '', isCurrent: false, type: 'FULL_TIME', description: '' });
    setEducationForm({ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', isCurrent: false, grade: '', description: '' });
    setProjectForm({ title: '', description: '', url: '', githubUrl: '', startDate: '', endDate: '', technologies: '' });
    setSkillForm({ name: '', level: 'INTERMEDIATE', category: '' });
    setCertificationForm({ name: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '' });
    setAwardForm({ title: '', issuer: '', date: '', description: '' });
    setLanguageForm({ name: '', proficiency: 'PROFESSIONAL' });

    setIsModalOpen(true);
  };

  const openEditModal = (type: typeof modalType, item: any) => {
    setModalType(type);
    setEditingItem(item);
    setFormErrors({});

    const formatDateStr = (d: any): string => d ? new Date(d).toISOString().substring(0, 10) : '';

    if (type === 'experience') {
      setExperienceForm({
        company: item.company,
        position: item.position,
        location: item.location || '',
        startDate: formatDateStr(item.startDate),
        endDate: formatDateStr(item.endDate),
        isCurrent: item.isCurrent,
        type: item.type,
        description: item.description || '',
      });
    }
    if (type === 'education') {
      setEducationForm({
        school: item.school,
        degree: item.degree,
        fieldOfStudy: item.fieldOfStudy,
        startDate: formatDateStr(item.startDate),
        endDate: formatDateStr(item.endDate),
        isCurrent: item.isCurrent,
        grade: item.grade || '',
        description: item.description || '',
      });
    }
    if (type === 'project') {
      setProjectForm({
        title: item.title,
        description: item.description,
        url: item.url || '',
        githubUrl: item.githubUrl || '',
        startDate: formatDateStr(item.startDate),
        endDate: formatDateStr(item.endDate),
        technologies: item.technologies?.join(', ') || '',
      });
    }
    if (type === 'skill') {
      setSkillForm({
        name: item.name,
        level: item.level,
        category: item.category || '',
      });
    }
    if (type === 'certification') {
      setCertificationForm({
        name: item.name,
        issuer: item.issuer,
        issueDate: formatDateStr(item.issueDate),
        expiryDate: formatDateStr(item.expiryDate),
        credentialId: item.credentialId || '',
        credentialUrl: item.credentialUrl || '',
      });
    }
    if (type === 'award') {
      setAwardForm({
        title: item.title,
        issuer: item.issuer,
        date: formatDateStr(item.date),
        description: item.description || '',
      });
    }
    if (type === 'language') {
      setLanguageForm({
        name: item.name,
        proficiency: item.proficiency,
      });
    }

    setIsModalOpen(true);
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
  <div className="relative overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl shadow-xl shadow-zinc-900/5 dark:shadow-black/20 px-6 md:px-8 py-7">

    {/* Soft Gradient Decoration */}
    <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/15 via-violet-500/10 to-cyan-400/10 blur-3xl" />
    <div className="absolute top-0 right-0 h-40 w-40 rounded-bl-[120px] bg-gradient-to-bl from-blue-100/80 via-indigo-100/50 to-transparent dark:from-blue-500/10 dark:via-violet-500/10 dark:to-transparent" />

    {/* Content */}
    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">

      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          Professional Profile
        </span>

        <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          My Profile
        </h1>

        <p className="mt-2 text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Keep your profile up to date. Changes sync automatically across your extension.
        </p>
      </div>

      {/* Optional Right Side */}
      {/*
      <Button className="rounded-xl shadow-md">
        Edit Profile
      </Button>
      */}
    </div>
  </div>
</div>
      <div className="space-y-6 pt-2 px-1">

       <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap md:grid md:grid-cols-6 mb-4 gap-2 h-auto min-h-12 bg-zinc-100/80 dark:bg-zinc-900/60 p-2 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 backdrop-blur-sm shadow-sm">
          <TabsTrigger value="personal" className="flex-1 gap-2 rounded-xl py-3 transition-all text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm data-[state=active]:text-zinc-950 dark:data-[state=active]:text-white">
            <User className="h-4 w-4" /><span>Personal</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex-1 gap-2 rounded-xl py-3 transition-all text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm data-[state=active]:text-zinc-950 dark:data-[state=active]:text-white">
            <Briefcase className="h-4 w-4" /><span>Work</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="flex-1 gap-2 rounded-xl py-3 transition-all text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm data-[state=active]:text-zinc-950 dark:data-[state=active]:text-white">
            <GraduationCap className="h-4 w-4" /><span>Education</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex-1 gap-2 rounded-xl py-3 transition-all text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm data-[state=active]:text-zinc-950 dark:data-[state=active]:text-white">
            <Code className="h-4 w-4" /><span>Projects</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex-1 gap-2 rounded-xl py-3 transition-all text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm data-[state=active]:text-zinc-950 dark:data-[state=active]:text-white">
            <Flame className="h-4 w-4" /><span>Skills</span>
          </TabsTrigger>
          <TabsTrigger value="other" className="flex-1 gap-2 rounded-xl py-3 transition-all text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm data-[state=active]:text-zinc-950 dark:data-[state=active]:text-white">
            <Award className="h-4 w-4" /><span>Awards</span>
          </TabsTrigger>
        </TabsList>

        {/* PERSONAL TAB */}
        <TabsContent value="personal" className="focus-visible:outline-none">
          <form onSubmit={handlePersonalSubmit}>
            <div className="space-y-6">
              {/* SECTION 1: Professional Summary */}
              <Card className="shadow-sm border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/30 backdrop-blur-sm rounded-2xl">
                <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-500" /> Professional Summary
                  </CardTitle>
                  <CardDescription>Your main headline and overview for recruiters.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="headline" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Professional Headline</Label>
                      <Input 
                        id="headline" 
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5 focus-visible:ring-indigo-500"
                        value={personalForm.headline} 
                        onChange={e => setPersonalForm(prev => ({ ...prev, headline: e.target.value }))}
                        placeholder="e.g. Senior Full Stack Engineer" 
                      />
                      {formErrors.headline && <p className="text-xs text-red-500">{formErrors.headline[0]}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalExperience" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Experience</Label>
                      <select
                        id="totalExperience"
                        className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:text-zinc-50"
                        value={personalForm.totalExperience}
                        onChange={e => setPersonalForm(prev => ({ ...prev, totalExperience: e.target.value }))}
                      >
                        <option value="">Select Experience Level</option>
                        <option value="Fresher (0 Years)">Fresher (0 Years)</option>
                        <option value="0 - 1 Years">0 - 1 Years</option>
                        <option value="1 - 2 Years">1 - 2 Years</option>
                        <option value="2 - 3 Years">2 - 3 Years</option>
                        <option value="3 - 5 Years">3 - 5 Years</option>
                        <option value="5 - 7 Years">5 - 7 Years</option>
                        <option value="7 - 10 Years">7 - 10 Years</option>
                        <option value="10+ Years">10+ Years</option>
                      </select>
                      {formErrors.totalExperience && <p className="text-xs text-red-500">{formErrors.totalExperience[0]}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Biography / About Me</Label>
                    <Textarea 
                      id="bio" 
                      rows={4}
                      className="rounded-xl border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500 leading-relaxed text-sm resize-none"
                      value={personalForm.bio} 
                      onChange={e => setPersonalForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Provide a summary of your career accomplishments, core technologies, and professional goals..." 
                    />
                    {formErrors.bio && <p className="text-xs text-red-500">{formErrors.bio[0]}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* SECTION 2: Identity & Contact */}
              <Card className="shadow-sm border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/30 backdrop-blur-sm rounded-2xl">
                <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-500" /> Identity & Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">First Name</Label>
                      <Input
                        id="firstName"
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                        value={personalForm.firstName}
                        onChange={e => setPersonalForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="e.g. Ashwani"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Last Name</Label>
                      <Input
                        id="lastName"
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                        value={personalForm.lastName}
                        onChange={e => setPersonalForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="e.g. Kushwaha"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Primary Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                        value={personalForm.phone}
                        onChange={e => setPersonalForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alternatePhone" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Alternate Phone (Optional)</Label>
                      <Input
                        id="alternatePhone"
                        type="tel"
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                        value={personalForm.alternatePhone}
                        onChange={e => setPersonalForm(prev => ({ ...prev, alternatePhone: e.target.value }))}
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                        value={personalForm.dateOfBirth}
                        onChange={e => setPersonalForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Gender</Label>
                      <select
                        id="gender"
                        className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-50"
                        value={personalForm.gender}
                        onChange={e => setPersonalForm(prev => ({ ...prev, gender: e.target.value }))}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Marital Status</Label>
                      <select
                        id="maritalStatus"
                        className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-50"
                        value={personalForm.maritalStatus}
                        onChange={e => setPersonalForm(prev => ({ ...prev, maritalStatus: e.target.value }))}
                      >
                        <option value="">Select Status</option>
                        <option value="Single/Unmarried">Single / Unmarried</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Separated">Separated</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="nationality" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Nationality</Label>
                      <Input
                        id="nationality"
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                        value={personalForm.nationality}
                        onChange={e => setPersonalForm(prev => ({ ...prev, nationality: e.target.value }))}
                        placeholder="e.g. Indian"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category (Govt Portals)</Label>
                      <select
                        id="category"
                        className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-50"
                        value={personalForm.category}
                        onChange={e => setPersonalForm(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">General / Unreserved</option>
                        <option value="OBC">OBC (Other Backward Class)</option>
                        <option value="SC">SC (Scheduled Caste)</option>
                        <option value="ST">ST (Scheduled Tribe)</option>
                        <option value="EWS">EWS (Economically Weaker Section)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="disabilityStatus" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Differently Abled</Label>
                      <select
                        id="disabilityStatus"
                        className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-50"
                        value={personalForm.disabilityStatus}
                        onChange={e => setPersonalForm(prev => ({ ...prev, disabilityStatus: e.target.value }))}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION 3: Location & Address */}
              <Card className="shadow-sm border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/30 backdrop-blur-sm rounded-2xl">
                <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-500" /> Location & Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2 relative">
                      <Label htmlFor="addressZip" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">ZIP / PIN Code</Label>
                      <div className="relative">
                        <Input
                          id="addressZip"
                          className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5 pr-10"
                          value={personalForm.addressZip}
                          onChange={handlePincodeChange}
                          placeholder="e.g. 560001 (Auto-fetches details)"
                        />
                        {pincodeLoading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressCountry" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Country</Label>
                      <select
                        id="addressCountry"
                        className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:text-zinc-50"
                        value={personalForm.addressCountry}
                        onChange={e => setPersonalForm(prev => ({ 
                          ...prev, 
                          addressCountry: e.target.value,
                          addressState: e.target.value !== 'India' ? '' : prev.addressState,
                          addressDistrict: e.target.value !== 'India' ? '' : prev.addressDistrict
                        }))}
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {personalForm.addressCountry === 'India' ? (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="addressState" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">State</Label>
                        <select
                          id="addressState"
                          className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:text-zinc-50"
                          value={personalForm.addressState}
                          onChange={e => setPersonalForm(prev => ({ 
                            ...prev, 
                            addressState: e.target.value,
                            addressDistrict: '' // reset district when state changes
                          }))}
                        >
                          <option value="">Select State</option>
                          {INDIA_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addressDistrict" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">District</Label>
                        <select
                          id="addressDistrict"
                          className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:text-zinc-50"
                          value={personalForm.addressDistrict}
                          onChange={e => setPersonalForm(prev => ({ ...prev, addressDistrict: e.target.value }))}
                          disabled={!personalForm.addressState}
                        >
                          <option value="">Select District</option>
                          {personalForm.addressState && INDIA_STATES_AND_DISTRICTS[personalForm.addressState]?.map(district => (
                            <option key={district} value={district}>{district}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="addressState" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">State / Province</Label>
                        <Input
                          id="addressState"
                          className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                          value={personalForm.addressState}
                          onChange={e => setPersonalForm(prev => ({ ...prev, addressState: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addressDistrict" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Region / County</Label>
                        <Input
                          id="addressDistrict"
                          className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                          value={personalForm.addressDistrict}
                          onChange={e => setPersonalForm(prev => ({ ...prev, addressDistrict: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="addressCity" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">City / Town / Village</Label>
                      <Input
                        id="addressCity"
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                        value={personalForm.addressCity}
                        onChange={e => setPersonalForm(prev => ({ ...prev, addressCity: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressLine" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Street Address / House No.</Label>
                      <Input
                        id="addressLine"
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                        value={personalForm.addressLine}
                        onChange={e => setPersonalForm(prev => ({ ...prev, addressLine: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION 4: Application Preferences */}
              <Card className="shadow-sm border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/30 backdrop-blur-sm rounded-2xl">
                <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-indigo-500" /> Career Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="currentSalary" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Current Salary (CTC)</Label>
                      <Input
                        id="currentSalary"
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                        value={personalForm.currentSalary}
                        onChange={e => setPersonalForm(prev => ({ ...prev, currentSalary: e.target.value }))}
                        placeholder="e.g. 10 LPA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expectedSalary" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Expected Salary</Label>
                      <Input
                        id="expectedSalary"
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                        value={personalForm.expectedSalary}
                        onChange={e => setPersonalForm(prev => ({ ...prev, expectedSalary: e.target.value }))}
                        placeholder="e.g. 15 LPA / Negotiable"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="noticePeriod" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Notice Period</Label>
                      <select
                        id="noticePeriod"
                        className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:text-zinc-50"
                        value={personalForm.noticePeriod}
                        onChange={e => setPersonalForm(prev => ({ ...prev, noticePeriod: e.target.value }))}
                      >
                        <option value="">Select Notice Period</option>
                        <option value="Immediate">Immediate / Serving Notice</option>
                        <option value="15 Days">15 Days</option>
                        <option value="30 Days">1 Month</option>
                        <option value="60 Days">2 Months</option>
                        <option value="90 Days">3 Months</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredLocation" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Preferred Work Location</Label>
                      <Input
                        id="preferredLocation"
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                        value={personalForm.preferredLocation}
                        onChange={e => setPersonalForm(prev => ({ ...prev, preferredLocation: e.target.value }))}
                        placeholder="e.g. Remote, Bangalore, Delhi"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION 5: Social & Portfolio Links */}
              <Card className="shadow-sm border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/30 backdrop-blur-sm rounded-2xl">
                <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="h-5 w-5 text-indigo-500" /> Links & Socials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">LinkedIn URL</Label>
                      <Input
                        id="linkedinUrl"
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                        value={personalForm.linkedinUrl}
                        onChange={e => setPersonalForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="githubUrl" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">GitHub URL</Label>
                      <Input
                        id="githubUrl"
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                        value={personalForm.githubUrl}
                        onChange={e => setPersonalForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="portfolioUrl" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Portfolio / Behance</Label>
                      <Input
                        id="portfolioUrl"
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                        value={personalForm.portfolioUrl}
                        onChange={e => setPersonalForm(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                        placeholder="https://myportfolio.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Personal Website / Blog</Label>
                      <Input
                        id="websiteUrl"
                        className="rounded-xl border-zinc-200 dark:border-zinc-800 py-5"
                        value={personalForm.websiteUrl}
                        onChange={e => setPersonalForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                        placeholder="https://mywebsite.com"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-end">
                  <Button type="submit" disabled={saving} className="rounded-xl px-8 bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm">
                    {saving ? 'Saving...' : 'Save Profile Information'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        </TabsContent>

        {/* EXPERIENCE TAB */}
        <TabsContent value="experience" className="space-y-6 focus-visible:outline-none">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">Work Experience Nodes</h2>
            <Button size="sm" onClick={() => openAddModal('experience')} className="gap-1.5 rounded-xl px-4">
              <Plus className="h-4 w-4" /><span>Add Job</span>
            </Button>
          </div>

          {profile.experiences?.length > 0 ? (
            <div className="relative pl-2 border-l border-zinc-200 dark:border-zinc-800 ml-3 space-y-6">
              {profile.experiences.map((exp: any) => (
                <div key={exp.id} className="relative group">
                  {/* Timeline Node Ring */}
                  <span className="absolute -left-[19px] top-1.5 h-3.5 w-3.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-350 dark:border-zinc-750 group-hover:border-zinc-900 dark:group-hover:border-zinc-100 transition-colors duration-300" />
                  
                  <Card className="shadow-sm border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/20 hover:border-zinc-400 dark:hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl">
                    <CardHeader className="flex-row items-start justify-between pb-3">
                      <div>
                        <CardTitle className="text-base font-bold text-zinc-900 dark:text-white leading-tight">{exp.position}</CardTitle>
                        <CardDescription className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-1 flex items-center gap-1.5">
                          <span>{exp.company}</span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span>{exp.location}</span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEditModal('experience', exp)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-650 hover:text-red-600" onClick={() => handleCrudDelete('experience', exp.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs leading-relaxed">
                      <div className="flex flex-wrap items-center gap-3 text-zinc-500 font-medium">
                        <span>{formatDate(exp.startDate)} – {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}</span>
                        <Badge variant="secondary" className="text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full capitalize border border-zinc-200/50 dark:border-zinc-700/50">
                          {exp.type.replace('_', ' ').toLowerCase()}
                        </Badge>
                      </div>
                      {exp.description && (
                        <p className="text-zinc-650 dark:text-zinc-400 whitespace-pre-line leading-relaxed border-t border-zinc-100 dark:border-zinc-900/50 pt-3 mt-1">
                          {exp.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No experience added" description="Add details about your past employment, freelance gigs, or internships." actionText="Add Work Experience" onAction={() => openAddModal('experience')} />
          )}
        </TabsContent>

        {/* EDUCATION TAB */}
        <TabsContent value="education" className="space-y-6 focus-visible:outline-none">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">Education History</h2>
            <Button size="sm" onClick={() => openAddModal('education')} className="gap-1.5 rounded-xl px-4">
              <Plus className="h-4 w-4" /><span>Add School</span>
            </Button>
          </div>

          {profile.educations?.length > 0 ? (
            <div className="relative pl-2 border-l border-zinc-200 dark:border-zinc-800 ml-3 space-y-6">
              {profile.educations.map((edu: any) => (
                <div key={edu.id} className="relative group">
                  {/* Timeline Ring */}
                  <span className="absolute -left-[19px] top-1.5 h-3.5 w-3.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-350 dark:border-zinc-750 group-hover:border-zinc-900 dark:group-hover:border-zinc-100 transition-colors duration-300" />
                  
                  <Card className="shadow-sm border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/20 hover:border-zinc-400 dark:hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl">
                    <CardHeader className="flex-row items-start justify-between pb-3">
                      <div>
                        <CardTitle className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                          {edu.degree} in {edu.fieldOfStudy}
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-1 flex items-center gap-1.5">
                          <span>{edu.school}</span>
                          {edu.grade && (
                            <>
                              <span className="text-zinc-300 dark:text-zinc-700">•</span>
                              <span>Grade: {edu.grade}</span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEditModal('education', edu)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-650 hover:text-red-600" onClick={() => handleCrudDelete('education', edu.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs leading-relaxed">
                      <p className="text-zinc-550 font-medium">{formatDate(edu.startDate)} – {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}</p>
                      {edu.description && (
                        <p className="text-zinc-650 dark:text-zinc-400 whitespace-pre-line leading-relaxed border-t border-zinc-100 dark:border-zinc-900/50 pt-3 mt-1">
                          {edu.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No education added" description="Add your academic degrees, high school details, or bootcamps." actionText="Add Education" onAction={() => openAddModal('education')} />
          )}
        </TabsContent>

        {/* PROJECTS TAB */}
        <TabsContent value="projects" className="space-y-6 focus-visible:outline-none">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">Technical Projects</h2>
            <Button size="sm" onClick={() => openAddModal('project')} className="gap-1.5 rounded-xl px-4">
              <Plus className="h-4 w-4" /><span>Add Project</span>
            </Button>
          </div>

          {profile.projects?.length > 0 ? (
            <div className="grid gap-5">
              {profile.projects.map((proj: any) => (
                <Card key={proj.id} className="shadow-sm border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/20 hover:border-zinc-400 dark:hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl">
                  <CardHeader className="flex-row items-start justify-between pb-3">
                    <div className="space-y-2">
                      <CardTitle className="text-base font-bold text-zinc-900 dark:text-white leading-tight">{proj.title}</CardTitle>
                      <div className="flex gap-1.5 flex-wrap">
                        {proj.technologies.map((t: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-[10px] font-medium bg-zinc-50/50 dark:bg-zinc-900/40 px-2.5 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800/60">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEditModal('project', proj)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-650 hover:text-red-600" onClick={() => handleCrudDelete('project', proj.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs leading-relaxed border-t border-zinc-100 dark:border-zinc-900/40 pt-3 mt-1">
                    <p className="text-zinc-650 dark:text-zinc-450 leading-relaxed whitespace-pre-line">{proj.description}</p>
                    {(proj.url || proj.githubUrl) && (
                      <div className="flex items-center gap-4 pt-2">
                        {proj.url && (
                          <a href={proj.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4">
                            <span>Live Demo</span>
                          </a>
                        )}
                        {proj.githubUrl && (
                          <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4">
                            <span>GitHub Repository</span>
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title="No projects added" description="Showcase your software applications, repositories, or research models." actionText="Add Project" onAction={() => openAddModal('project')} />
          )}
        </TabsContent>

        {/* SKILLS TAB */}
        <TabsContent value="skills" className="space-y-6 focus-visible:outline-none">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">Verified Skills Catalog</h2>
            <Button size="sm" onClick={() => openAddModal('skill')} className="gap-1.5 rounded-xl px-4">
              <Plus className="h-4 w-4" /><span>Add Skill</span>
            </Button>
          </div>

          {profile.skills?.length > 0 ? (
            <Card className="shadow-sm border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/20 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((sk: any) => {
                    // Match level color indicators
                    const levelColors: Record<string, string> = {
                      expert: 'bg-violet-500',
                      advanced: 'bg-indigo-500',
                      intermediate: 'bg-blue-500',
                      beginner: 'bg-amber-500',
                    };
                    const dotColor = levelColors[sk.level.toLowerCase()] || 'bg-zinc-400';

                    return (
                      <div key={sk.id} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-full pl-3 pr-1 py-1.5 text-xs shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-200 font-medium">
                        {/* Interactive Dot indicator */}
                        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                        <span className="text-zinc-850 dark:text-zinc-200">{sk.name}</span>
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider scale-90">({sk.level.toLowerCase()})</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full text-zinc-500 hover:text-red-650 hover:bg-zinc-150 dark:hover:bg-zinc-800" onClick={() => handleCrudDelete('skill', sk.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState title="No skills added" description="Specify technical skills, libraries, or operational proficiencies." actionText="Add Skill" onAction={() => openAddModal('skill')} />
          )}
        </TabsContent>

        {/* OTHER / AWARDS TAB */}
        <TabsContent value="other" className="space-y-6 focus-visible:outline-none">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">Awards & Certifications</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openAddModal('certification')} className="gap-1.5 rounded-xl px-3.5">
                <Plus className="h-4 w-4" /><span>Add Cert</span>
              </Button>
              <Button size="sm" onClick={() => openAddModal('award')} className="gap-1.5 rounded-xl px-3.5">
                <Plus className="h-4 w-4" /><span>Add Award</span>
              </Button>
            </div>
          </div>

          {/* Certifications List */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Verified Certifications</h3>
            {profile.certifications?.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {profile.certifications.map((cert: any) => (
                  <Card key={cert.id} className="shadow-sm border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/20 hover:border-zinc-350 dark:hover:border-zinc-750 transition-all rounded-2xl">
                    <CardHeader className="flex-row items-start justify-between pb-2">
                      <div>
                        <CardTitle className="text-base font-bold text-zinc-900 dark:text-white leading-tight">{cert.name}</CardTitle>
                        <CardDescription className="text-xs font-semibold text-zinc-700 dark:text-zinc-350 mt-1">{cert.issuer}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEditModal('certification', cert)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-650 hover:text-red-600" onClick={() => handleCrudDelete('certification', cert.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="text-xs text-zinc-550 font-medium">
                      <p>Issued: {formatDate(cert.issueDate)} {cert.expiryDate ? `• Expires: ${formatDate(cert.expiryDate)}` : '• Non-expiring'}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-2 italic">No certifications added yet.</p>
            )}
          </div>

          {/* Awards List */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Accomplishments & Awards</h3>
            {profile.awards?.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {profile.awards.map((aw: any) => (
                  <Card key={aw.id} className="shadow-sm border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/20 hover:border-zinc-350 dark:hover:border-zinc-750 transition-all rounded-2xl">
                    <CardHeader className="flex-row items-start justify-between pb-2">
                      <div>
                        <CardTitle className="text-base font-bold text-zinc-900 dark:text-white leading-tight">{aw.title}</CardTitle>
                        <CardDescription className="text-xs font-semibold text-zinc-700 dark:text-zinc-350 mt-1">{aw.issuer}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEditModal('award', aw)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-650 hover:text-red-600" onClick={() => handleCrudDelete('award', aw.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <p className="text-zinc-550 font-medium">{formatDate(aw.date)}</p>
                      {aw.description && <p className="text-zinc-650 dark:text-zinc-405 leading-relaxed whitespace-pre-line border-t border-zinc-100 dark:border-zinc-900/30 pt-2.5 mt-1">{aw.description}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-2 italic">No awards added yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs> 

      {/* CRUD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-[101] w-full max-w-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-lg rounded-lg max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {editingItem ? 'Edit' : 'Add'} {modalType?.toUpperCase()}
            </h3>

            <form onSubmit={handleCrudSubmit} className="space-y-4">
              {/* EXPERIENCE FORM */}
              {modalType === 'experience' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" value={experienceForm.company} onChange={e => setExperienceForm(prev => ({ ...prev, company: e.target.value }))} required />
                    {formErrors.company && <p className="text-xs text-red-500">{formErrors.company[0]}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="position">Position Title</Label>
                    <Input id="position" value={experienceForm.position} onChange={e => setExperienceForm(prev => ({ ...prev, position: e.target.value }))} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" type="date" value={experienceForm.startDate} onChange={e => setExperienceForm(prev => ({ ...prev, startDate: e.target.value }))} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input id="endDate" type="date" value={experienceForm.endDate} onChange={e => setExperienceForm(prev => ({ ...prev, endDate: e.target.value }))} disabled={experienceForm.isCurrent} />
                      {formErrors.endDate && <p className="text-xs text-red-500">{formErrors.endDate[0]}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="isCurrent" checked={experienceForm.isCurrent} onChange={e => setExperienceForm(prev => ({ ...prev, isCurrent: e.target.checked, endDate: e.target.checked ? '' : prev.endDate }))} />
                    <Label htmlFor="isCurrent">Currently working here</Label>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="type">Job Type</Label>
                    <Select id="type" value={experienceForm.type} onChange={e => setExperienceForm(prev => ({ ...prev, type: e.target.value }))}>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="FREELANCE">Freelance</option>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="expDesc">Description</Label>
                    <Textarea id="expDesc" rows={4} value={experienceForm.description} onChange={e => setExperienceForm(prev => ({ ...prev, description: e.target.value }))} />
                  </div>
                </div>
              )}

              {/* EDUCATION FORM */}
              {modalType === 'education' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="school">School / Institution</Label>
                    <Input id="school" value={educationForm.school} onChange={e => setEducationForm(prev => ({ ...prev, school: e.target.value }))} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="degree">Degree</Label>
                      <Input id="degree" value={educationForm.degree} onChange={e => setEducationForm(prev => ({ ...prev, degree: e.target.value }))} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="field">Field of Study</Label>
                      <Input id="field" value={educationForm.fieldOfStudy} onChange={e => setEducationForm(prev => ({ ...prev, fieldOfStudy: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="eduStart">Start Date</Label>
                      <Input id="eduStart" type="date" value={educationForm.startDate} onChange={e => setEducationForm(prev => ({ ...prev, startDate: e.target.value }))} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="eduEnd">End Date</Label>
                      <Input id="eduEnd" type="date" value={educationForm.endDate} onChange={e => setEducationForm(prev => ({ ...prev, endDate: e.target.value }))} disabled={educationForm.isCurrent} />
                      {formErrors.endDate && <p className="text-xs text-red-500">{formErrors.endDate[0]}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="eduCurrent" checked={educationForm.isCurrent} onChange={e => setEducationForm(prev => ({ ...prev, isCurrent: e.target.checked, endDate: e.target.checked ? '' : prev.endDate }))} />
                    <Label htmlFor="eduCurrent">Currently studying here</Label>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="grade">Grade / GPA</Label>
                    <Input id="grade" value={educationForm.grade} onChange={e => setEducationForm(prev => ({ ...prev, grade: e.target.value }))} placeholder="e.g. 3.8 / 4.0" />
                  </div>
                </div>
              )}

              {/* PROJECT FORM */}
              {modalType === 'project' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="projTitle">Project Title</Label>
                    <Input id="projTitle" value={projectForm.title} onChange={e => setProjectForm(prev => ({ ...prev, title: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="projDesc">Description</Label>
                    <Textarea id="projDesc" rows={3} value={projectForm.description} onChange={e => setProjectForm(prev => ({ ...prev, description: e.target.value }))} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="projUrl">Demo URL</Label>
                      <Input id="projUrl" value={projectForm.url} onChange={e => setProjectForm(prev => ({ ...prev, url: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="projGit">GitHub URL</Label>
                      <Input id="projGit" value={projectForm.githubUrl} onChange={e => setProjectForm(prev => ({ ...prev, githubUrl: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tech">Technologies (Comma separated)</Label>
                    <Input id="tech" value={projectForm.technologies} onChange={e => setProjectForm(prev => ({ ...prev, technologies: e.target.value }))} placeholder="React, TypeScript, Prisma" />
                  </div>
                </div>
              )}

              {/* SKILL FORM */}
              {modalType === 'skill' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="skName">Select Skill</Label>
                    <select
                      id="skNameSelect"
                      className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-50"
                      value={Object.values(SKILL_CATEGORIES).flat().includes(skillForm.name) ? skillForm.name : (skillForm.name ? 'Other' : '')}
                      onChange={e => setSkillForm(prev => ({ ...prev, name: e.target.value === 'Other' ? '' : e.target.value }))}
                      required
                    >
                      <option value="">Select a Skill</option>
                      {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
                        <optgroup key={category} label={category}>
                          {skills.map(skill => (
                            <option key={skill} value={skill}>{skill}</option>
                          ))}
                        </optgroup>
                      ))}
                      <option value="Other">Other (Custom)</option>
                    </select>
                  </div>
                  
                  {(!Object.values(SKILL_CATEGORIES).flat().includes(skillForm.name) && skillForm.name !== '' || !Object.values(SKILL_CATEGORIES).flat().includes(skillForm.name) && (document.getElementById('skNameSelect') as HTMLSelectElement)?.value === 'Other') && (
                    <div className="space-y-1.5 mt-2">
                      <Label htmlFor="skNameCustom">Custom Skill Name</Label>
                      <Input 
                        id="skNameCustom" 
                        value={skillForm.name} 
                        onChange={e => setSkillForm(prev => ({ ...prev, name: e.target.value }))} 
                        placeholder="e.g. Brainfuck, COBOL..."
                        required 
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="skLevel">Proficiency Level</Label>
                    <Select id="skLevel" value={skillForm.level} onChange={e => setSkillForm(prev => ({ ...prev, level: e.target.value as any }))}>
                      <option value="BEGINNER">Beginner (Familiar)</option>
                      <option value="INTERMEDIATE">Intermediate (Comfortable)</option>
                      <option value="ADVANCED">Advanced (Strong)</option>
                      <option value="EXPERT">Expert (Master)</option>
                    </Select>
                  </div>
                </div>
              )}

              {/* CERTIFICATION FORM */}
              {modalType === 'certification' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="certName">Certification Name</Label>
                    <Input id="certName" value={certificationForm.name} onChange={e => setCertificationForm(prev => ({ ...prev, name: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="certIssuer">Issuer</Label>
                    <Input id="certIssuer" value={certificationForm.issuer} onChange={e => setCertificationForm(prev => ({ ...prev, issuer: e.target.value }))} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="issueDate">Issue Date</Label>
                      <Input id="issueDate" type="date" value={certificationForm.issueDate} onChange={e => setCertificationForm(prev => ({ ...prev, issueDate: e.target.value }))} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input id="expiryDate" type="date" value={certificationForm.expiryDate} onChange={e => setCertificationForm(prev => ({ ...prev, expiryDate: e.target.value }))} />
                    </div>
                  </div>
                </div>
              )}

              {/* AWARD FORM */}
              {modalType === 'award' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="awTitle">Award Title</Label>
                    <Input id="awTitle" value={awardForm.title} onChange={e => setAwardForm(prev => ({ ...prev, title: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="awIssuer">Issuer</Label>
                    <Input id="awIssuer" value={awardForm.issuer} onChange={e => setAwardForm(prev => ({ ...prev, issuer: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="awDate">Date Received</Label>
                    <Input id="awDate" type="date" value={awardForm.date} onChange={e => setAwardForm(prev => ({ ...prev, date: e.target.value }))} required />
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-[200] max-w-sm rounded-xl px-5 py-4 shadow-xl transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-3 border ${toastMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-900/60 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300'}`}>
          {toastMsg.type === 'success' ? <Check className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
          <p className="text-sm font-medium">{toastMsg.text}</p>
          <button onClick={() => setToastMsg(null)} className="ml-auto flex-shrink-0 text-current opacity-70 hover:opacity-100">×</button>
        </div>
      )}

      </div>
    </div>
  );
}
