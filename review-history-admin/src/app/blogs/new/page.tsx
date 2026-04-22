'use client';

import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/admin-layout';
import { useToast } from '@/components/shared/toast';
import { Button, Skeleton } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { BlogEditorForm } from '@/app/blogs/_components/blog-editor-form';
import { useAdminBlogCategories, useAdminBlogTags, useCreateBlog } from '@/hooks/use-api';

export default function NewBlogPage() {
  const router = useRouter();
  const toast = useToast();
  const categoriesQuery = useAdminBlogCategories();
  const tagsQuery = useAdminBlogTags();
  const createBlog = useCreateBlog();

  if (categoriesQuery.isLoading || tagsQuery.isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-56 rounded-lg" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Blog Post</h1>
            <p className="text-sm text-muted">Write and publish a new article.</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/blogs')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
        </div>

        <BlogEditorForm
          mode="create"
          categories={categoriesQuery.data || []}
          tags={tagsQuery.data || []}
          submitting={createBlog.isPending}
          onCancel={() => router.push('/blogs')}
          onSubmit={async (payload) => {
            try {
              await createBlog.mutateAsync(payload);
              toast.success('Blog post created');
              router.push('/blogs');
            } catch (error: any) {
              const message = error?.response?.data?.error?.message || error?.response?.data?.message || 'Failed to create blog';
              toast.error(message);
            }
          }}
        />
      </div>
    </AdminLayout>
  );
}
