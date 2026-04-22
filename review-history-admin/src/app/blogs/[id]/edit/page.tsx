'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { useToast } from '@/components/shared/toast';
import { Button, Skeleton } from '@/components/ui';
import { BlogEditorForm, type BlogEditorValues } from '@/app/blogs/_components/blog-editor-form';
import { useAdminBlog, useAdminBlogCategories, useAdminBlogTags, useUpdateBlog } from '@/hooks/use-api';

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();
  const blogId = params.id;
  const router = useRouter();
  const toast = useToast();

  const blogQuery = useAdminBlog(blogId);
  const categoriesQuery = useAdminBlogCategories();
  const tagsQuery = useAdminBlogTags();
  const updateBlog = useUpdateBlog();

  const initialValues = useMemo<Partial<BlogEditorValues>>(() => {
    const blog = blogQuery.data;
    if (!blog) return {};
    return {
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || '',
      content: blog.content,
      featuredImage: blog.featuredImage || blog.coverImage || '',
      categoryId: blog.categoryId || blog.category?.id || '',
      tagIds: blog.tags?.map((tag) => tag.id) || [],
      status: (blog.status || (blog.isPublished ? 'PUBLISHED' : 'DRAFT')) as BlogEditorValues['status'],
      publishedAt: blog.publishedAt ? new Date(blog.publishedAt).toISOString().slice(0, 10) : '',
      seoTitle: blog.seoTitle || '',
      seoDescription: blog.seoDescription || '',
      keywords: (blog.keywords || []).join(', '),
      ogImageUrl: blog.ogImageUrl || '',
      canonicalUrl: blog.canonicalUrl || '',
    };
  }, [blogQuery.data]);

  if (blogQuery.isLoading || categoriesQuery.isLoading || tagsQuery.isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-56 rounded-lg" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </AdminLayout>
    );
  }

  if (!blogQuery.data) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-foreground">Blog not found</h2>
          <p className="mt-1 text-sm text-muted">The requested blog post does not exist.</p>
          <Button className="mt-4" variant="outline" onClick={() => router.push('/blogs')}>
            Back to List
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Blog Post</h1>
            <p className="text-sm text-muted">Update blog content and SEO settings.</p>
          </div>
          <Button variant="outline" onClick={() => router.push(`/blogs/${blogId}`)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to View
          </Button>
        </div>

        <BlogEditorForm
          mode="edit"
          categories={categoriesQuery.data || []}
          tags={tagsQuery.data || []}
          initialValues={initialValues}
          submitting={updateBlog.isPending}
          onCancel={() => router.push(`/blogs/${blogId}`)}
          onSubmit={async (payload) => {
            try {
              await updateBlog.mutateAsync({ id: blogId, ...payload });
              toast.success('Blog post updated');
              router.push('/blogs');
            } catch (error: any) {
              const message = error?.response?.data?.error?.message || error?.response?.data?.message || 'Failed to update blog';
              toast.error(message);
            }
          }}
        />
      </div>
    </AdminLayout>
  );
}
