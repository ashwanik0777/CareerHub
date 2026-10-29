'use client';

import * as React from 'react';
import { 
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Input, Label, Select, Alert, AlertTitle, AlertDescription, Spinner
} from '@platform/ui';
import { Check, AlertCircle, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [deletingAccount, setDeletingAccount] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [formErrors, setFormErrors] = React.useState<Record<string, string[]>>({});

  // Settings form
  const [settingsForm, setSettingsForm] = React.useState({
    emailNotifications: true,
    profileVisibility: 'PUBLIC',
    themePreference: 'dark',
    languagePreference: 'en',
  });

  // Password form
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to load settings');
      const data = await res.json();
      if (data.settings) {
        setSettingsForm({
          emailNotifications: data.settings.emailNotifications,
          profileVisibility: data.settings.profileVisibility,
          themePreference: data.settings.themePreference,
          languagePreference: data.settings.languagePreference,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });

      if (!res.ok) throw new Error('Failed to update settings');
      
      // Dynamic client-side theme application
      if (settingsForm.themePreference === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', settingsForm.themePreference);

      setSuccess('Account preferences updated successfully.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setError(null);
    setSuccess(null);
    setFormErrors({});

    try {
      const res = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'Validation failed') {
          setFormErrors(data.details);
          throw new Error('Please correct the validation errors.');
        }
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccess('Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('WARNING: This action is permanent. Type "DELETE My Account" to confirm account deletion:');
    if (confirmation !== 'DELETE My Account') {
      alert('Confirmation text did not match. Account deletion cancelled.');
      return;
    }

    setDeletingAccount(true);
    setError(null);

    try {
      const res = await fetch('/api/settings/delete-account', {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete account');

      // Redirect to landing
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
      setDeletingAccount(false);
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
  <div className="relative overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm px-6 md:px-8 py-6">

    {/* Soft Background Accent */}
    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-500/5 blur-2xl" />
    <div className="absolute top-0 right-0 h-28 w-28 rounded-bl-[90px] bg-blue-100/50 dark:bg-blue-400/5" />

    <div className="relative">
      <span className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100/70 dark:bg-zinc-800/70 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">
        Preferences
      </span>

      <h1 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Settings
      </h1>

      <p className="mt-2 max-w-xl text-sm md:text-base text-zinc-500 dark:text-zinc-400">
        Manage your account, security, and preferences.
      </p>
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

      {/* Preferences Form */}
      <form onSubmit={handleSettingsSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Account Preferences</CardTitle>
            <CardDescription>Configure notifications and profile visibility settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="visibility">Profile Visibility</Label>
              <Select 
                id="visibility" 
                value={settingsForm.profileVisibility}
                onChange={e => setSettingsForm(prev => ({ ...prev, profileVisibility: e.target.value }))}
              >
                <option value="PUBLIC">Public (Visible to everyone)</option>
                <option value="CONNECTED">Connected (Visible only to authenticated job boards)</option>
                <option value="PRIVATE">Private (Visible only to me)</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="theme">Theme Preference</Label>
              <Select 
                id="theme" 
                value={settingsForm.themePreference}
                onChange={e => setSettingsForm(prev => ({ ...prev, themePreference: e.target.value }))}
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="notif" 
                checked={settingsForm.emailNotifications}
                onChange={e => setSettingsForm(prev => ({ ...prev, emailNotifications: e.target.checked }))}
              />
              <Label htmlFor="notif">Receive email notifications for profile activity</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={savingSettings}>
              {savingSettings ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Change Password Form */}
      <form onSubmit={handlePasswordSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Security Credentials</CardTitle>
            <CardDescription>Update your login credentials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currPass">Current Password</Label>
              <Input 
                type="password" 
                id="currPass" 
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                required 
              />
              {formErrors.currentPassword && <p className="text-xs text-red-500">{formErrors.currentPassword[0]}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="newPass">New Password</Label>
                <Input 
                  type="password" 
                  id="newPass" 
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  required 
                />
                {formErrors.newPassword && <p className="text-xs text-red-500">{formErrors.newPassword[0]}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confPass">Confirm New Password</Label>
                <Input 
                  type="password" 
                  id="confPass" 
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required 
                />
                {formErrors.confirmPassword && <p className="text-xs text-red-500">{formErrors.confirmPassword[0]}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900/40 bg-red-50/10">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-500 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription>Irreversible account management actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <p className="text-zinc-600 dark:text-zinc-400">
            Deleting your account will remove your profile, work experience, resumes, and settings from our databases. This action cannot be undone.
          </p>
        </CardContent>
        <CardFooter className="pt-2">
          <Button variant="destructive" onClick={handleDeleteAccount} disabled={deletingAccount}>
            {deletingAccount ? 'Deleting...' : 'Delete My Account'}
          </Button>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}
