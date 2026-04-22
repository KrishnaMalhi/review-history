'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, MapPin, Calendar, Shield, Pencil, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button, Input, Card, CardContent, Badge, Skeleton } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { useCities } from '@/hooks/use-api';
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validators';
import { apiPatch } from '@/lib/api-client';
import { formatDate, getInitials } from '@/lib/utils';
import { FIELD_LIMITS } from '@shared/field-limits';

function trustLevelColor(level: string) {
  switch (level) {
    case 'trusted': return 'text-primary bg-primary-light';
    case 'established': return 'text-navy-light bg-blue-50';
    default: return 'text-muted bg-surface';
  }
}

function roleLabel(role: string) {
  switch (role) {
    case 'super_admin': return 'Super Admin';
    case 'admin': return 'Admin';
    case 'moderator': return 'Moderator';
    case 'claimed_owner': return 'Verified Owner';
    case 'user': return 'Member';
    default: return 'Guest';
  }
}

export default function DashboardProfilePage() {
  const { user, isLoading, refreshUser } = useAuth();
  const { data: cities } = useCities();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [cityQuery, setCityQuery] = useState(user?.city || '');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      city: user?.city || '',
    },
  });

  const currentCity = watch('city') || '';

  useEffect(() => {
    if (editing) {
      setCityQuery(currentCity);
    }
  }, [editing, currentCity]);

  const filteredCities = useMemo(() => {
    const list = cities || [];
    const q = cityQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((city) => city.name.toLowerCase().includes(q));
  }, [cities, cityQuery]);

  const onSubmit = async (data: UpdateProfileInput) => {
    setError('');
    setSaving(true);
    try {
      await apiPatch('/me', data);
      await refreshUser();
      setEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Profile Hero Card */}
            <Card className="relative overflow-hidden">
              {/* Gradient Banner */}
              <div className="h-28 bg-gradient-to-r from-primary via-primary-dark to-navy" />
              <div className="absolute top-6 right-6">
                {!editing && (
                  <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1.5 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/50 hover:text-white">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Profile
                  </Button>
                )}
              </div>

              <CardContent className="relative -mt-12 pb-6">
                <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-5">
                  {/* Avatar */}
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-3xl font-bold text-white shadow-xl shadow-primary/30 ring-4 ring-white">
                    {getInitials(user?.displayName || 'User')}
                  </div>

                  {/* Name & Badges */}
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <h1 className="text-2xl font-bold text-foreground">
                      {user?.displayName || 'Anonymous User'}
                    </h1>
                    <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <Badge variant="info">{roleLabel(user?.role || 'guest')}</Badge>
                      <Badge variant={user?.trustLevel === 'trusted' ? 'success' : user?.trustLevel === 'established' ? 'navy' : 'default'}>
                        <Shield className="mr-1 h-3 w-3" />
                        {user?.trustLevel === 'trusted' ? 'Trusted' : user?.trustLevel === 'established' ? 'Established' : 'New User'}
                      </Badge>
                      {user?.emailVerified ? (
                        <Badge variant="success">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Email Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {user?.bio && (
                  <p className="mt-4 rounded-xl bg-surface p-4 text-sm text-muted italic">
                    &ldquo;{user.bio}&rdquo;
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted">Email</p>
                  <p className="truncate text-sm font-semibold text-foreground">{user?.email || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-light">
                  <Phone className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted">Phone</p>
                  <p className="truncate text-sm font-semibold text-foreground">{user?.phone || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <Calendar className="h-5 w-5 text-navy-light" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted">Member Since</p>
                  <p className="truncate text-sm font-semibold text-foreground">{formatDate(user?.createdAt || '')}</p>
                </div>
              </div>
            </div>

            {/* Edit / Details Card */}
            <Card>
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {editing ? 'Edit Your Details' : 'Personal Details'}
                  </h3>
                </div>
                {!editing && (
                  <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="gap-1.5 text-primary">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                )}
              </div>
              <CardContent className="py-6">
                {editing ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input
                        label="Display Name"
                        placeholder="Your public name"
                        maxLength={FIELD_LIMITS.DISPLAY_NAME}
                        {...register('displayName')}
                        error={errors.displayName?.message}
                      />
                      <Input
                        label="City"
                        placeholder="Search city..."
                        value={cityQuery}
                        onChange={(e) => {
                          const next = e.target.value;
                          setCityQuery(next);
                          setValue('city', next, { shouldValidate: true });
                        }}
                        list="profile-city-options"
                        maxLength={FIELD_LIMITS.DISPLAY_NAME}
                        error={errors.city?.message}
                      />
                      <datalist id="profile-city-options">
                        {filteredCities.slice(0, 100).map((city) => (
                          <option key={city.id} value={city.name} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Bio</label>
                      <textarea
                        {...register('bio')}
                        placeholder="Tell others about yourself..."
                        maxLength={FIELD_LIMITS.BIO}
                        rows={3}
                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted/50 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {errors.bio?.message && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200/50">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3 pt-1">
                      <Button type="submit" loading={saving}>
                        <CheckCircle className="h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => { setEditing(false); reset(); setError(''); }}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
                        <User className="h-3.5 w-3.5" /> Display Name
                      </p>
                      <p className="text-sm font-semibold text-foreground">{user?.displayName || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
                        <MapPin className="h-3.5 w-3.5" /> City
                      </p>
                      <p className="text-sm font-semibold text-foreground">{user?.city || '-'}</p>
                    </div>
                    <div className="col-span-full space-y-1">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
                        <Sparkles className="h-3.5 w-3.5" /> Bio
                      </p>
                      <p className="text-sm text-foreground">{user?.bio || '-'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card>
              <div className="flex items-center gap-2 border-b border-border px-6 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-light">
                  <Shield className="h-4 w-4 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground">Security & Verification</h3>
              </div>
              <CardContent className="py-6">
                <div className="space-y-4">
                  {/* Email Verification */}
                  <div className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${user?.emailVerified ? 'bg-primary-light' : 'bg-amber-50'}`}>
                        <Mail className={`h-5 w-5 ${user?.emailVerified ? 'text-primary' : 'text-amber-600'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Email Verification</p>
                        <p className="text-xs text-muted">{user?.email || 'No email set'}</p>
                      </div>
                    </div>
                    {user?.emailVerified ? (
                      <Badge variant="success">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Phone Number</p>
                        <p className="text-xs text-muted">{user?.phone || 'Not linked'}</p>
                      </div>
                    </div>
                    <Badge variant="success">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Linked
                    </Badge>
                  </div>

                  {/* Trust Level */}
                  <div className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${trustLevelColor(user?.trustLevel || '')}`}>
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Trust Level</p>
                        <p className="text-xs text-muted">
                          {user?.trustLevel === 'trusted'
                            ? 'You are a trusted community member'
                            : user?.trustLevel === 'established'
                              ? 'Keep contributing to level up'
                              : 'Build trust by writing quality reviews'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={user?.trustLevel === 'trusted' ? 'success' : user?.trustLevel === 'established' ? 'navy' : 'default'}>
                      {user?.trustLevel === 'trusted' ? 'Trusted' : user?.trustLevel === 'established' ? 'Established' : 'New'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
