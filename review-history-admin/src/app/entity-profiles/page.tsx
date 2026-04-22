'use client';

import { useState } from 'react';
import { Building2, GraduationCap, Stethoscope, Package, CheckCircle, ExternalLink } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Badge, Skeleton } from '@/components/ui';
import {
  useAdminEmployerProfiles,
  useAdminSchoolProfiles,
  useAdminMedicalProfiles,
  useAdminProductProfiles,
  useVerifyEmployer,
} from '@/hooks/use-api';
import type { AdminEntityProfile } from '@/hooks/use-api';
import type { PaginatedResponse } from '@/types';
import { useToast } from '@/components/shared/toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type ProfileTab = 'employer' | 'school' | 'medical' | 'product';

const tabs: { key: ProfileTab; label: string; icon: React.ElementType }[] = [
  { key: 'employer', label: 'Employers', icon: Building2 },
  { key: 'school', label: 'Schools', icon: GraduationCap },
  { key: 'medical', label: 'Doctors & Hospitals', icon: Stethoscope },
  { key: 'product', label: 'Products', icon: Package },
];

function ProfileList({
  data,
  isLoading,
  tab,
  page,
  setPage,
  onVerify,
  verifyPending,
}: {
  data: PaginatedResponse<AdminEntityProfile> | undefined;
  isLoading: boolean;
  tab: ProfileTab;
  page: number;
  setPage: (p: number) => void;
  onVerify?: (entityId: string) => void;
  verifyPending?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted">No {tab} profiles found.</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {data.data.map((profile) => (
          <Card key={profile.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {profile.entityName}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  {profile.description && (
                    <span className="max-w-xs truncate">{profile.description}</span>
                  )}
                  <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                  {tab === 'employer' && (
                    profile.isVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="warning">Unverified</Badge>
                    )
                  )}
                  {tab === 'employer' && profile.industry && (
                    <Badge variant="default">{profile.industry}</Badge>
                  )}
                  {tab === 'school' && profile.schoolType && (
                    <Badge variant="default">{profile.schoolType}</Badge>
                  )}
                  {tab === 'medical' && profile.specialization && (
                    <Badge variant="default">{profile.specialization}</Badge>
                  )}
                  {tab === 'product' && profile.brand && (
                    <Badge variant="default">{profile.brand}</Badge>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {tab === 'employer' && !profile.isVerified && onVerify && (
                  <button
                    onClick={() => onVerify(profile.entityId)}
                    disabled={verifyPending}
                    className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Verify
                  </button>
                )}
                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-light"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Website
                  </a>
                )}
                <Link
                  href={`/entity-profiles/${tab}/${profile.entityId}`}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-light"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Details
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {data.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= data.meta.totalPages}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

export default function EntityProfilesPage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('employer');
  const [pages, setPages] = useState({ employer: 1, school: 1, medical: 1, product: 1 });
  const toast = useToast();

  const employers = useAdminEmployerProfiles({ page: pages.employer, pageSize: 20 });
  const schools = useAdminSchoolProfiles({ page: pages.school, pageSize: 20 });
  const medical = useAdminMedicalProfiles({ page: pages.medical, pageSize: 20 });
  const products = useAdminProductProfiles({ page: pages.product, pageSize: 20 });
  const verifyEmployer = useVerifyEmployer();

  const handleVerify = (entityId: string) => {
    verifyEmployer.mutate(entityId, {
      onSuccess: () => toast.success('Employer verified successfully'),
      onError: () => toast.error('Failed to verify employer'),
    });
  };

  const dataMap = {
    employer: { data: employers.data, isLoading: employers.isLoading },
    school: { data: schools.data, isLoading: schools.isLoading },
    medical: { data: medical.data, isLoading: medical.isLoading },
    product: { data: products.data, isLoading: products.isLoading },
  };

  const setPageForTab = (p: number) => setPages((prev) => ({ ...prev, [activeTab]: p }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/20">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Entity Profiles</h1>
            <p className="text-sm text-muted">Manage employer, school, medical, and product profiles</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-surface p-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                activeTab === key
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Profile List */}
        <ProfileList
          data={dataMap[activeTab].data}
          isLoading={dataMap[activeTab].isLoading}
          tab={activeTab}
          page={pages[activeTab]}
          setPage={setPageForTab}
          onVerify={activeTab === 'employer' ? handleVerify : undefined}
          verifyPending={verifyEmployer.isPending}
        />
      </div>
    </AdminLayout>
  );
}
