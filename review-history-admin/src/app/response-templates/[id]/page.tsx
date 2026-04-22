'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, Button, Badge, Skeleton } from '@/components/ui';
import { useAdminResponseTemplate } from '@/hooks/use-api';

export default function ResponseTemplateDetailPage() {
  const params = useParams();
  const id = String(params.id || '');
  const { data: template, isLoading } = useAdminResponseTemplate(id);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Template Details</h1>
            <p className="text-sm text-muted">View response template content and targeting</p>
          </div>
          <Link href="/response-templates">
            <Button variant="outline">Back to Templates</Button>
          </Link>
        </div>

        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : !template ? (
          <Card className="p-8 text-center text-muted">Template not found</Card>
        ) : (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{template.titleEn}</h2>
                <Badge variant="info">{template.sentiment}</Badge>
                {template.categoryKey && <Badge>{template.categoryKey}</Badge>}
                {!template.isActive && <Badge variant="warning">Inactive</Badge>}
              </div>
              <section>
                <h3 className="text-sm font-semibold text-foreground">Body (EN)</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-muted">{template.bodyEn}</p>
              </section>
              {template.bodyUr && (
                <section>
                  <h3 className="text-sm font-semibold text-foreground">Body (UR)</h3>
                  <p className="mt-1 whitespace-pre-line text-sm text-muted">{template.bodyUr}</p>
                </section>
              )}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoItem label="Sort Order" value={template.sortOrder ?? 0} />
                <InfoItem label="Created At" value={new Date(template.createdAt).toLocaleString()} />
                <InfoItem label="Updated At" value={template.updatedAt ? new Date(template.updatedAt).toLocaleString() : '-'} />
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
