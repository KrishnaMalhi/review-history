'use client';

import { use, useEffect, useState } from 'react';
import {
  BarChart3, Mail, Copy, FileText, Clock, Users, Eye, TrendingUp,
  Star, MessageSquare, CheckCircle2, Pencil, Save, X, Phone, MapPin, AlertCircle,
  Info, Lightbulb, ExternalLink,
} from 'lucide-react';
import { PublicLayout } from '@/components/layout';
import { Card, CardContent, Badge, Button, Skeleton, EmptyState, Input } from '@/components/ui';
import {
  useEntity, useEntityAnalytics, useResponseMetrics, useReviewInvites,
  useCreateInvite, useResponseTemplates, useUpdateEntity, useEntityReviews, useCreateReply,
  useCategoryProfile,
  useCreateEmployerProfile,
  useUpdateEmployerProfile,
  useCreateSchoolProfile,
  useUpdateSchoolProfile,
  useCreateMedicalProfile,
  useUpdateMedicalProfile,
  useCreateProductProfile,
  useUpdateProductProfile,
} from '@/hooks/use-api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/shared/toast';
import { ResponseMetricsBar } from '@/components/shared/response-metrics-bar';
import { FIELD_LIMITS } from '@shared/field-limits';
import { formatRelativeTime, ratingColor } from '@/lib/utils';
import Link from 'next/link';
import { getApiErrorMessage } from '@/lib/api-client';

type Tab = 'overview' | 'reviews' | 'templates' | 'invites';

const TABS: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'invites', label: 'Invites', icon: Mail },
];

const SENTIMENT_STYLES: Record<string, { badge: string; border: string; bg: string; label: string }> = {
  positive: { badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50', label: 'For positive reviews' },
  negative: { badge: 'bg-red-100 text-red-700', border: 'border-red-200', bg: 'bg-red-50', label: 'For negative reviews' },
  neutral: { badge: 'bg-blue-100 text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50', label: 'For neutral reviews' },
};

function StatCard({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 text-center">
      <Icon className="mx-auto h-5 w-5 text-primary" />
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function CopiedButton({ text, children }: { text: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 1800);
      }}
      className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
    >
      <Copy className="h-3 w-3" />
      {copied ? 'Copied!' : children}
    </button>
  );
}

// ── Tab: Overview ──────────────────────────────────────────────────────────
function OverviewTab({ entityId, entity, analytics, analyticsLoading, metrics }: any) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    addressLine: entity?.address ?? '',
    landmark: entity?.landmark ?? '',
    phone: entity?.phone ?? '',
  });
  const updateEntity = useUpdateEntity(entityId);
  const toast = useToast();

  const handleSave = () => {
    updateEntity.mutate(
      {
        addressLine: form.addressLine || undefined,
        landmark: form.landmark || undefined,
        phone: form.phone || undefined,
      },
      {
        onSuccess: () => { toast.success('Profile updated!'); setEditing(false); },
        onError: () => toast.error('Failed to update profile'),
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Response Metrics */}
      <ResponseMetricsBar metrics={metrics} />

      {/* Analytics */}
      <Card>
        <CardContent className="py-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
            <BarChart3 className="h-4 w-4 text-primary" /> Analytics
          </h2>
          {analyticsLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard icon={Eye} label="Page Views" value={analytics.totalViews ?? 0} />
              <StatCard icon={Users} label="Unique Visitors" value={analytics.uniqueVisitors ?? 0} />
              <StatCard icon={TrendingUp} label="Reviews (30d)" value={analytics.recentReviews ?? 0} />
              <StatCard icon={Clock} label="Avg Response" value={`${Math.round(metrics?.avgResponseTimeHours ?? 0)}h`} />
            </div>
          ) : (
            <p className="text-sm text-muted">Analytics data will appear once your listing gets traffic.</p>
          )}
        </CardContent>
      </Card>

      <CategoryExtensionProfileEditor entityId={entityId} categoryKey={entity?.categoryKey} />

      {/* Profile Edit */}
      <Card>
        <CardContent className="py-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary" /> Business Details
            </h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Address</label>
                <Input
                  value={form.addressLine}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, addressLine: e.target.value }))}
                  placeholder="e.g. House 47, Street 3, Block B"
                  maxLength={FIELD_LIMITS.ADDRESS_LINE}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Landmark</label>
                <Input
                  value={form.landmark}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, landmark: e.target.value }))}
                  placeholder="e.g. Near Centaurus Mall"
                  maxLength={FIELD_LIMITS.LANDMARK ?? 120}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Phone</label>
                <Input
                  value={form.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+923001234567"
                  maxLength={FIELD_LIMITS.PHONE ?? 20}
                />
              </div>
              <Button size="sm" loading={updateEntity.isPending} onClick={handleSave}>
                <Save className="mr-1.5 h-3.5 w-3.5" /> Save Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted" />
                <span className="text-foreground">{entity?.address || <span className="text-muted italic">No address set</span>}</span>
              </p>
              <p className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted" />
                <span className="text-foreground">{entity?.landmark || <span className="text-muted italic">No landmark set</span>}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted" />
                <span className="text-foreground">{entity?.phone || <span className="text-muted italic">No phone set</span>}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-800">
            <Lightbulb className="h-4 w-4" /> Owner Tips
          </h3>
          <ul className="space-y-2 text-xs text-amber-800">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> Respond to reviews within 24 hours to boost your response score.</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> Use <strong>Templates tab</strong> to pre-write replies for common review sentiments.</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> Send <strong>Invite links</strong> to customers for authentic reviews.</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> Keep your address and phone updated to help customers find you.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryExtensionProfileEditor({ entityId, categoryKey }: { entityId: string; categoryKey?: string }) {
  const employerKeys = ['employer', 'workplace', 'workspace', 'company'];
  const schoolKeys = ['school', 'college', 'university', 'madrasa'];
  const medicalKeys = ['doctor', 'hospital', 'clinic', 'dentist'];
  const productKeys = ['food_product', 'product'];

  const type = employerKeys.includes(categoryKey || '')
    ? 'employer'
    : schoolKeys.includes(categoryKey || '')
      ? 'school'
      : medicalKeys.includes(categoryKey || '')
        ? 'medical'
        : productKeys.includes(categoryKey || '')
          ? 'product'
          : null;

  const toast = useToast();
  const profileQuery = useCategoryProfile(entityId);
  const createEmployer = useCreateEmployerProfile(entityId);
  const updateEmployer = useUpdateEmployerProfile(entityId);
  const createSchool = useCreateSchoolProfile(entityId);
  const updateSchool = useUpdateSchoolProfile(entityId);
  const createMedical = useCreateMedicalProfile(entityId);
  const updateMedical = useUpdateMedicalProfile(entityId);
  const createProduct = useCreateProductProfile(entityId);
  const updateProduct = useUpdateProductProfile(entityId);

  const [form, setForm] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  const profile = profileQuery.data as any;
  const hasExistingProfile = Boolean(profile && typeof profile === 'object' && Object.keys(profile).length > 0);
  const isLoading = profileQuery.isLoading;

  if (type == null) {
    return null;
  }

  useEffect(() => {
    if (initialized || isLoading) return;
    setForm({
      description: profile?.description ?? '',
      websiteUrl: profile?.websiteUrl ?? '',
      logoUrl: profile?.logoUrl ?? profile?.imageUrl ?? '',
      coverImageUrl: profile?.coverImageUrl ?? '',
      industry: profile?.industry ?? '',
      employerSize: profile?.employerSize ?? '',
      foundedYear: profile?.foundedYear ? String(profile.foundedYear) : '',
      schoolType: profile?.schoolType ?? '',
      curriculum: profile?.curriculum ?? '',
      totalStudents: profile?.totalStudents ? String(profile.totalStudents) : '',
      specialization: profile?.specialization ?? '',
      qualifications: profile?.qualifications ?? '',
      experienceYears: profile?.experienceYears ? String(profile.experienceYears) : '',
      hospitalAffiliation: profile?.hospitalAffiliation ?? '',
      consultationFee: profile?.consultationFee ? String(profile.consultationFee) : '',
      pmdcNumber: profile?.pmdcNumber ?? '',
      brand: profile?.brand ?? '',
      productCategory: profile?.productCategory ?? '',
      barcode: profile?.barcode ?? '',
      imageUrl: profile?.imageUrl ?? '',
    });
    setInitialized(true);
  }, [initialized, isLoading, profile]);

  const buildCommonPayload = () => ({
    description: form.description || undefined,
    websiteUrl: form.websiteUrl || undefined,
    logoUrl: form.logoUrl || undefined,
    coverImageUrl: form.coverImageUrl || undefined,
  });

  const save = async () => {
    try {
      if (type === 'employer') {
        const payload = {
          ...buildCommonPayload(),
          industry: form.industry || undefined,
          employerSize: form.employerSize || undefined,
          foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
        };
        if (hasExistingProfile) await updateEmployer.mutateAsync(payload);
        else await createEmployer.mutateAsync(payload);
      } else if (type === 'school') {
        const payload = {
          ...buildCommonPayload(),
          schoolType: form.schoolType || undefined,
          curriculum: form.curriculum || undefined,
          totalStudents: form.totalStudents ? Number(form.totalStudents) : undefined,
          foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
        };
        if (hasExistingProfile) await updateSchool.mutateAsync(payload);
        else await createSchool.mutateAsync(payload);
      } else if (type === 'medical') {
        const payload = {
          ...buildCommonPayload(),
          specialization: form.specialization || undefined,
          qualifications: form.qualifications || undefined,
          hospitalAffiliation: form.hospitalAffiliation || undefined,
          experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
          consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
          pmdcNumber: form.pmdcNumber || undefined,
        };
        if (hasExistingProfile) await updateMedical.mutateAsync(payload);
        else await createMedical.mutateAsync(payload);
      } else if (type === 'product') {
        const payload = {
          description: form.description || undefined,
          imageUrl: form.imageUrl || form.logoUrl || undefined,
          brand: form.brand || undefined,
          productCategory: form.productCategory || undefined,
          barcode: form.barcode || undefined,
        };
        if (hasExistingProfile) await updateProduct.mutateAsync(payload);
        else await createProduct.mutateAsync(payload);
      }
      toast.success(hasExistingProfile ? 'Profile updated successfully' : 'Profile created successfully');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save profile'));
    }
  };

  const pending =
    createEmployer.isPending || updateEmployer.isPending ||
    createSchool.isPending || updateSchool.isPending ||
    createMedical.isPending || updateMedical.isPending ||
    createProduct.isPending || updateProduct.isPending;

  return (
    <Card>
      <CardContent className="py-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">Category Profile</h2>
          <Badge variant={hasExistingProfile ? 'success' : 'warning'}>
            {hasExistingProfile ? 'Configured' : 'Not configured'}
          </Badge>
        </div>

        {isLoading ? (
          <Skeleton className="h-28 w-full rounded-xl" />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted">Description</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  maxLength={FIELD_LIMITS.PROFILE_DESCRIPTION}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              {type !== 'product' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Website URL</label>
                  <Input value={form.websiteUrl || ''} maxLength={FIELD_LIMITS.URL} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, websiteUrl: e.target.value }))} />
                </div>
              )}

              {(type === 'employer' || type === 'school' || type === 'medical') && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Logo URL</label>
                  <Input value={form.logoUrl || ''} maxLength={FIELD_LIMITS.URL} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))} />
                </div>
              )}

              {type === 'employer' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">Industry</label>
                    <Input value={form.industry || ''} maxLength={FIELD_LIMITS.INDUSTRY} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, industry: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">Employer Size</label>
                    <select
                      value={form.employerSize || ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, employerSize: e.target.value }))}
                      className="w-full rounded-lg border border-border p-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                    >
                      <option value="">Select size</option>
                      <option value="micro">micro</option>
                      <option value="small">small</option>
                      <option value="medium">medium</option>
                      <option value="large">large</option>
                      <option value="enterprise">enterprise</option>
                    </select>
                  </div>
                </>
              )}

              {type === 'school' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">School Type</label>
                    <Input value={form.schoolType || ''} maxLength={FIELD_LIMITS.CATEGORY_NAME_EN} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, schoolType: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">Curriculum</label>
                    <Input value={form.curriculum || ''} maxLength={FIELD_LIMITS.CATEGORY_NAME_EN} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, curriculum: e.target.value }))} />
                  </div>
                </>
              )}

              {type === 'medical' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">Specialization</label>
                    <Input value={form.specialization || ''} maxLength={FIELD_LIMITS.SPECIALIZATION} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, specialization: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">PMDC Number</label>
                    <Input value={form.pmdcNumber || ''} maxLength={FIELD_LIMITS.PMDC_NUMBER} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, pmdcNumber: e.target.value }))} />
                  </div>
                </>
              )}

              {type === 'product' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">Brand</label>
                    <Input value={form.brand || ''} maxLength={FIELD_LIMITS.BRAND_NAME} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, brand: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">Product Category</label>
                    <Input value={form.productCategory || ''} maxLength={FIELD_LIMITS.CATEGORY_NAME_EN} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, productCategory: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">Image URL</label>
                    <Input value={form.imageUrl || ''} maxLength={FIELD_LIMITS.URL} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">Barcode</label>
                    <Input value={form.barcode || ''} maxLength={FIELD_LIMITS.BARCODE} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, barcode: e.target.value }))} />
                  </div>
                </>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Founded Year</label>
                <Input type="number" value={form.foundedYear || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, foundedYear: e.target.value }))} />
              </div>

              {type === 'school' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Total Students</label>
                  <Input type="number" value={form.totalStudents || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, totalStudents: e.target.value }))} />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={save} loading={pending}>
                {hasExistingProfile ? 'Update Profile' : 'Create Profile'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Tab: Reviews ───────────────────────────────────────────────────────────
function ReviewsTab({ entityId }: { entityId: string }) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unreplied'>('unreplied');
  const { data: reviews, isLoading } = useEntityReviews(entityId, { page, limit: 10, sort: 'newest' });

  const rows = reviews?.data ?? [];
  const filtered = filter === 'unreplied' ? rows.filter((review) => review.replies.length === 0) : rows;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">Filter:</span>
        {(['all', 'unreplied'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              filter === f ? 'bg-primary text-white' : 'border border-border bg-surface text-muted hover:text-primary'
            }`}
          >
            {f === 'unreplied' ? 'Needs Reply' : 'All Reviews'}
          </button>
        ))}
        <Link
          href={`/entities/${entityId}`}
          className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View public page <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : !filtered.length ? (
        <EmptyState
          title={filter === 'unreplied' ? 'All reviews replied!' : 'No reviews yet'}
          description={filter === 'unreplied' ? 'Great work — you\'ve replied to all current reviews.' : 'Reviews will appear here once customers share their experience.'}
        />
      ) : (
        filtered.map((review: any) => (
          <OwnerReviewCard key={review.id} review={review} entityId={entityId} />
        ))
      )}

      {(reviews?.meta?.totalPages ?? 1) > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-muted">Page {page} of {reviews?.meta?.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= (reviews?.meta?.totalPages ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

function OwnerReviewCard({ review, entityId }: { review: any; entityId: string }) {
  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const replyMut = useCreateReply(review.id);
  const toast = useToast();
  const latestReply = review.replies[review.replies.length - 1] ?? null;

  const handleReply = () => {
    if (!replyBody.trim()) return;
    replyMut.mutate(
      replyBody,
      {
        onSuccess: () => {
          toast.success('Reply posted!');
          setShowReply(false);
          setReplyBody('');
        },
        onError: () => toast.error('Failed to post reply'),
      },
    );
  };

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-sm font-bold ${ratingColor(review.rating)}`}>★ {review.rating}/5</span>
              {review.title && <span className="text-sm font-medium text-foreground">{review.title}</span>}
              <span className="text-xs text-muted">{formatRelativeTime(review.createdAt)}</span>
              {!latestReply && (
                <Badge variant="warning" className="text-[10px]">Needs reply</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted line-clamp-3">{review.body}</p>
          </div>
        </div>

        {/* Existing owner reply */}
        {latestReply && (
          <div className="mt-3 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-foreground">Your reply</span>
              <span className="text-[10px] text-muted">{formatRelativeTime(latestReply.createdAt)}</span>
            </div>
            <p className="mt-1 whitespace-pre-line">{latestReply.body}</p>
          </div>
        )}

        {/* Reply form */}
        {!latestReply && (
          <div className="mt-3">
            {showReply ? (
              <div className="space-y-2">
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={3}
                  maxLength={FIELD_LIMITS.REPLY_BODY ?? 1000}
                  placeholder="Write a professional, helpful reply..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
                <div className="flex gap-2">
                  <Button size="sm" loading={replyMut.isPending} onClick={handleReply}>Post Reply</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowReply(false); setReplyBody(''); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowReply(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Reply to this review
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Tab: Templates ─────────────────────────────────────────────────────────
function TemplatesTab() {
  const { data: templates, isLoading } = useResponseTemplates();
  const [copied, setCopied] = useState<string | null>(null);
  const toast = useToast();

  const handleCopy = (id: string, body: string) => {
    navigator.clipboard.writeText(body);
    setCopied(id);
    toast.success('Template copied!');
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="space-y-5">
      {/* How to use */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-900">
            <Info className="h-4 w-4" /> How to Use Templates
          </h3>
          <ol className="space-y-2 text-xs text-blue-800">
            <li className="flex items-start gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
              Go to the <strong>Reviews tab</strong> above and find a review that needs a reply.
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
              Come back here and <strong>copy a template</strong> that matches the review's tone (positive/negative/neutral).
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
              Paste it in the reply form and <strong>customize with specific details</strong> before posting.
            </li>
          </ol>
          <p className="mt-3 text-xs text-blue-700">
            Tip: Personalize every reply — mention the customer's specific concern for best impact.
          </p>
        </CardContent>
      </Card>

      {/* Template list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : !templates?.length ? (
        <EmptyState
          title="No templates available"
          description="Your admin team creates templates for your category. Check back soon."
        />
      ) : (
        <div className="space-y-3">
          {templates.map((tpl: any) => {
            const style = SENTIMENT_STYLES[tpl.sentiment] ?? SENTIMENT_STYLES.neutral;
            return (
              <Card key={tpl.id} className={`border ${style.border} ${style.bg}`}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}>
                          {style.label}
                        </span>
                        <h3 className="text-sm font-medium text-foreground">{tpl.name ?? tpl.titleEn}</h3>
                        {tpl.categoryKey && <Badge className="text-[10px]">{tpl.categoryKey}</Badge>}
                      </div>
                      <p className="text-sm text-muted leading-relaxed">{tpl.body ?? tpl.bodyEn}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(tpl.id, tpl.body ?? tpl.bodyEn ?? '')}
                      className={`flex-shrink-0 flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        copied === tpl.id
                          ? 'border-emerald-300 bg-emerald-100 text-emerald-700'
                          : 'border-border bg-white text-foreground hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      <Copy className="h-3 w-3" />
                      {copied === tpl.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab: Invites ───────────────────────────────────────────────────────────
function InvitesTab({ entityId }: { entityId: string }) {
  const { data: invites, isLoading } = useReviewInvites(entityId);
  const createInvite = useCreateInvite();
  const toast = useToast();
  const [inviteNote, setInviteNote] = useState('');

  return (
    <div className="space-y-5">
      {/* Explainer */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="py-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-900">
            <Info className="h-4 w-4" /> What are Invite Links?
          </h3>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Share invite links with customers after a visit or purchase. When they open the link, they go directly to your review page — making it easy to collect authentic, verified reviews.
          </p>
        </CardContent>
      </Card>

      {/* Create */}
      <Card>
        <CardContent className="py-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
            <Mail className="h-4 w-4 text-primary" /> Create New Invite Link
          </h2>
          <div className="flex gap-2">
            <Input
              placeholder="Optional note (e.g. 'Dine-in customer April 22')"
              value={inviteNote}
              maxLength={FIELD_LIMITS.INVITE_NOTE}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteNote(e.target.value)}
              className="flex-1"
            />
            <Button
              loading={createInvite.isPending}
              onClick={() =>
                createInvite.mutate(
                  { entityId, data: { note: inviteNote || undefined } },
                  {
                    onSuccess: () => { toast.success('Invite link created!'); setInviteNote(''); },
                    onError: () => toast.error('Failed to create invite'),
                  },
                )
              }
            >
              Create Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="py-5">
          <h2 className="mb-3 text-base font-semibold text-foreground">Your Invite Links</h2>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : !invites?.length ? (
            <p className="text-sm text-muted">No invite links created yet. Create one above and share it with customers.</p>
          ) : (
            <div className="space-y-2">
              {invites.map((invite: any) => {
                const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${invite.token}`;
                return (
                  <div key={invite.id} className="rounded-xl border border-border bg-surface p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted truncate">{link}</span>
                          <Badge variant={invite.status === 'active' ? 'success' : 'default'} className="text-[10px] flex-shrink-0">
                            {invite.status}
                          </Badge>
                        </div>
                        {invite.note && <p className="mt-0.5 text-xs text-muted">{invite.note}</p>}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(link);
                          toast.success('Link copied!');
                        }}
                        className="flex-shrink-0 rounded-lg border border-border p-1.5 text-muted hover:border-primary/40 hover:text-primary"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function OwnerDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { data: entity, isLoading: entityLoading } = useEntity(id);
  const { data: analytics, isLoading: analyticsLoading } = useEntityAnalytics(id);
  const { data: metrics } = useResponseMetrics(id);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  if (entityLoading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="mb-4 h-8 w-64" />
          <Skeleton className="h-60 w-full" />
        </div>
      </PublicLayout>
    );
  }

  if (!entity) {
    return (
      <PublicLayout>
        <EmptyState title="Entity not found" description="This entity does not exist." />
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Owner Dashboard</h1>
            <p className="mt-0.5 text-sm text-muted">{entity.name}</p>
          </div>
          <Link href={`/entities/${id}`} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <ExternalLink className="h-4 w-4" /> View Public Page
          </Link>
        </div>

        {/* Tab Bar */}
        <div className="flex overflow-x-auto border-b border-border gap-0">
          {TABS.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tabId
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            entityId={id}
            entity={entity}
            analytics={analytics}
            analyticsLoading={analyticsLoading}
            metrics={metrics}
          />
        )}
        {activeTab === 'reviews' && <ReviewsTab entityId={id} />}
        {activeTab === 'templates' && <TemplatesTab />}
        {activeTab === 'invites' && <InvitesTab entityId={id} />}
      </div>
    </PublicLayout>
  );
}
