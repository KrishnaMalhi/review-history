'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import type { BlogCategory, BlogTag } from '@/hooks/use-api';
import { FIELD_LIMITS } from '@shared/field-limits';

type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface BlogEditorValues {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  categoryId: string;
  tagIds: string[];
  status: BlogStatus;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string;
  ogImageUrl: string;
  canonicalUrl: string;
}

export interface BlogEditorPayload {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  status: BlogStatus;
  isPublished: boolean;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  ogImageUrl?: string;
  canonicalUrl?: string;
  categoryId?: string;
  tagIds?: string[];
}

interface BlogEditorFormProps {
  mode: 'create' | 'edit';
  categories: BlogCategory[];
  tags: BlogTag[];
  initialValues?: Partial<BlogEditorValues>;
  submitting?: boolean;
  onSubmit: (payload: BlogEditorPayload) => Promise<void> | void;
  onCancel: () => void;
}

const stopwords = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'you', 'our', 'are', 'was', 'were',
  'into', 'onto', 'about', 'how', 'what', 'why', 'when', 'where', 'who', 'will', 'can', 'should',
  'could', 'would', 'not', 'but', 'all', 'any', 'each', 'few', 'more', 'most', 'other', 'some',
  'such', 'than', 'then', 'use', 'using',
]);

const emptyValues: BlogEditorValues = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featuredImage: '',
  categoryId: '',
  tagIds: [],
  status: 'DRAFT',
  publishedAt: '',
  seoTitle: '',
  seoDescription: '',
  keywords: '',
  ogImageUrl: '',
  canonicalUrl: '',
};

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeKeywords(value: string) {
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function extractKeywords(sources: string[], limit = 10) {
  const text = sources.join(' ').toLowerCase();
  const tokens = text
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && token.length > 2 && !stopwords.has(token));
  const counts = new Map<string, number>();
  tokens.forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token)
    .slice(0, limit);
}

function withAutoPublishedAt(status: BlogStatus, publishedAt: string) {
  if (status === 'PUBLISHED' && !publishedAt) {
    return new Date().toISOString().slice(0, 10);
  }
  return publishedAt;
}

export function BlogEditorForm({
  mode,
  categories,
  tags,
  initialValues,
  submitting = false,
  onSubmit,
  onCancel,
}: BlogEditorFormProps) {
  const [values, setValues] = useState<BlogEditorValues>({ ...emptyValues, ...initialValues });
  const [canonicalTouched, setCanonicalTouched] = useState(Boolean(initialValues?.canonicalUrl));

  useEffect(() => {
    setValues({ ...emptyValues, ...initialValues });
    setCanonicalTouched(Boolean(initialValues?.canonicalUrl));
  }, [initialValues]);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  useEffect(() => {
    if (!values.slug || canonicalTouched) return;
    const path = `/blogs/${values.slug}`;
    const nextCanonical = baseUrl ? `${baseUrl}${path}` : path;
    setValues((prev) => ({ ...prev, canonicalUrl: nextCanonical }));
  }, [values.slug, canonicalTouched, baseUrl]);

  const selectedTagNames = useMemo(
    () => tags.filter((tag) => values.tagIds.includes(tag.id)).map((tag) => tag.name),
    [tags, values.tagIds],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title: values.title.trim(),
      slug: values.slug.trim() || undefined,
      excerpt: values.excerpt.trim() || undefined,
      content: values.content,
      featuredImage: values.featuredImage.trim() || undefined,
      status: values.status,
      isPublished: values.status === 'PUBLISHED',
      publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : undefined,
      seoTitle: values.seoTitle.trim() || undefined,
      seoDescription: values.seoDescription.trim() || undefined,
      keywords: normalizeKeywords(values.keywords),
      ogImageUrl: values.ogImageUrl.trim() || undefined,
      canonicalUrl: values.canonicalUrl.trim() || undefined,
      categoryId: values.categoryId || undefined,
      tagIds: values.tagIds,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
        <Input
          label="Title"
          value={values.title}
          maxLength={FIELD_LIMITS.BLOG_TITLE}
          onChange={(e) =>
            setValues((prev) => ({
              ...prev,
              title: e.target.value,
              slug: generateSlug(e.target.value),
            }))
          }
          required
        />
        <Input
          label="Slug"
          value={values.slug}
          maxLength={FIELD_LIMITS.BLOG_SLUG}
          readOnly
          required
        />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Excerpt</span>
          <textarea
            value={values.excerpt}
            maxLength={FIELD_LIMITS.BLOG_EXCERPT}
            rows={3}
            onChange={(e) => setValues((prev) => ({ ...prev, excerpt: e.target.value }))}
            className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Content</span>
          <textarea
            value={values.content}
            maxLength={FIELD_LIMITS.BLOG_CONTENT}
            rows={12}
            onChange={(e) => setValues((prev) => ({ ...prev, content: e.target.value }))}
            className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </label>
        <Input
          label="Featured Image URL"
          value={values.featuredImage}
          maxLength={FIELD_LIMITS.URL}
          onChange={(e) => setValues((prev) => ({ ...prev, featuredImage: e.target.value }))}
          placeholder="https://..."
        />
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Publishing</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Category"
            value={values.categoryId}
            onChange={(e) => setValues((prev) => ({ ...prev, categoryId: e.target.value }))}
            options={[{ value: '', label: 'Select a category' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
          <Select
            label="Status"
            value={values.status}
            onChange={(e) =>
              setValues((prev) => {
                const nextStatus = e.target.value as BlogStatus;
                return {
                  ...prev,
                  status: nextStatus,
                  publishedAt: withAutoPublishedAt(nextStatus, prev.publishedAt),
                };
              })
            }
            options={[
              { value: 'DRAFT', label: 'Draft' },
              { value: 'PUBLISHED', label: 'Published' },
              { value: 'ARCHIVED', label: 'Archived' },
            ]}
          />
        </div>
        <Input
          label="Published Date"
          type="date"
          value={values.publishedAt}
          onChange={(e) => setValues((prev) => ({ ...prev, publishedAt: e.target.value }))}
        />
        <div>
          <p className="mb-1.5 text-sm font-medium text-foreground">Tags</p>
          <div className="max-h-40 overflow-y-auto rounded-xl border border-border p-2">
            <div className="grid grid-cols-2 gap-2">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-surface">
                  <input
                    type="checkbox"
                    checked={values.tagIds.includes(tag.id)}
                    onChange={(e) => {
                      setValues((prev) => ({
                        ...prev,
                        tagIds: e.target.checked
                          ? [...prev.tagIds, tag.id]
                          : prev.tagIds.filter((id) => id !== tag.id),
                      }));
                    }}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">{tag.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">SEO</h2>
        <Input
          label="SEO Title"
          value={values.seoTitle}
          maxLength={FIELD_LIMITS.TEMPLATE_TITLE}
          onChange={(e) => setValues((prev) => ({ ...prev, seoTitle: e.target.value }))}
        />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">SEO Description</span>
          <textarea
            value={values.seoDescription}
            maxLength={FIELD_LIMITS.SEO_DESCRIPTION}
            rows={3}
            onChange={(e) => setValues((prev) => ({ ...prev, seoDescription: e.target.value }))}
            className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <Input
          label="SEO Keywords"
          value={values.keywords}
          maxLength={FIELD_LIMITS.BLOG_KEYWORDS}
          onChange={(e) => setValues((prev) => ({ ...prev, keywords: e.target.value }))}
          placeholder="keyword1, keyword2, keyword3"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            const suggested = extractKeywords([values.title, values.excerpt, values.seoTitle, ...selectedTagNames]);
            const merged = Array.from(new Set([...normalizeKeywords(values.keywords), ...suggested]));
            setValues((prev) => ({ ...prev, keywords: merged.join(', ') }));
          }}
        >
          Auto-suggest Keywords
        </Button>
        <Input
          label="OG Image URL"
          value={values.ogImageUrl}
          maxLength={FIELD_LIMITS.URL}
          onChange={(e) => setValues((prev) => ({ ...prev, ogImageUrl: e.target.value }))}
          placeholder="https://..."
        />
        <Input
          label="Canonical URL"
          value={values.canonicalUrl}
          maxLength={FIELD_LIMITS.URL}
          onChange={(e) => {
            setCanonicalTouched(true);
            setValues((prev) => ({ ...prev, canonicalUrl: e.target.value }));
          }}
          placeholder="https://www.example.com/blogs/your-post"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} disabled={submitting || !values.title.trim() || !values.content.trim()}>
          {mode === 'create' ? 'Create Post' : 'Update Post'}
        </Button>
      </div>
    </form>
  );
}
