'use client';

import { StarRating } from '@/components/ui';

interface RatingFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

function RatingField({ label, value, onChange }: RatingFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <StarRating value={value} onChange={onChange} size="sm" />
    </div>
  );
}

export function WorkplaceReviewFields({
  values,
  onChange,
}: {
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
}) {
  const fields = [
    { key: 'workCulture', label: 'Work Culture' },
    { key: 'salaryFairness', label: 'Salary & Benefits' },
    { key: 'management', label: 'Management Quality' },
    { key: 'growthOpportunities', label: 'Growth Opportunities' },
    { key: 'workLifeBalance', label: 'Work-Life Balance' },
  ];

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-surface/50 p-4">
      <h3 className="text-sm font-semibold text-gray-800">Workplace-Specific Ratings</h3>
      {fields.map((f) => (
        <RatingField
          key={f.key}
          label={f.label}
          value={values[f.key] || 0}
          onChange={(v) => onChange(f.key, v)}
        />
      ))}
    </div>
  );
}

export function SchoolReviewFields({
  values,
  onChange,
}: {
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
}) {
  const fields = [
    { key: 'teachingQuality', label: 'Teaching Quality' },
    { key: 'discipline', label: 'Discipline & Safety' },
    { key: 'environment', label: 'Campus Environment' },
    { key: 'extracurricular', label: 'Extracurricular Activities' },
    { key: 'valueForMoney', label: 'Value for Money' },
  ];

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-surface/50 p-4">
      <h3 className="text-sm font-semibold text-gray-800">School-Specific Ratings</h3>
      {fields.map((f) => (
        <RatingField
          key={f.key}
          label={f.label}
          value={values[f.key] || 0}
          onChange={(v) => onChange(f.key, v)}
        />
      ))}
    </div>
  );
}

export function MedicalReviewFields({
  values,
  onChange,
}: {
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
}) {
  const fields = [
    { key: 'treatmentEffectiveness', label: 'Treatment Effectiveness' },
    { key: 'doctorBehavior', label: 'Doctor Behavior' },
    { key: 'staffBehavior', label: 'Staff Behavior' },
    { key: 'waitingTime', label: 'Waiting Time' },
    { key: 'cleanliness', label: 'Cleanliness & Hygiene' },
  ];

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-surface/50 p-4">
      <h3 className="text-sm font-semibold text-gray-800">Medical-Specific Ratings</h3>
      {fields.map((f) => (
        <RatingField
          key={f.key}
          label={f.label}
          value={values[f.key] || 0}
          onChange={(v) => onChange(f.key, v)}
        />
      ))}
    </div>
  );
}

export function ProductReviewFields({
  values,
  onChange,
}: {
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
}) {
  const fields = [
    { key: 'taste', label: 'Taste / Quality' },
    { key: 'packaging', label: 'Packaging' },
    { key: 'valueForMoney', label: 'Value for Money' },
    { key: 'freshness', label: 'Freshness' },
    { key: 'availability', label: 'Availability' },
  ];

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-surface/50 p-4">
      <h3 className="text-sm font-semibold text-gray-800">Product-Specific Ratings</h3>
      {fields.map((f) => (
        <RatingField
          key={f.key}
          label={f.label}
          value={values[f.key] || 0}
          onChange={(v) => onChange(f.key, v)}
        />
      ))}
    </div>
  );
}
