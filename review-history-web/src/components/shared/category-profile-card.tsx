'use client';

import { Building2, GraduationCap, Stethoscope, Package, Globe, Phone, Clock, Users, DollarSign, Briefcase } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import type { EmployerProfile, SchoolProfile, MedicalProfile, ProductProfile, CategoryProfile } from '@/types';

function EmployerCard({ profile }: { profile: EmployerProfile }) {
  return (
    <Card>
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Employer Profile</h3>
          {profile.isVerified && <Badge variant="success">Verified</Badge>}
        </div>
        {profile.description && <p className="text-sm text-muted leading-relaxed">{profile.description}</p>}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {profile.industry && (
            <div className="flex items-center gap-1.5 text-muted">
              <Briefcase className="h-3.5 w-3.5" /> {profile.industry}
            </div>
          )}
          {profile.employerSize && (
            <div className="flex items-center gap-1.5 text-muted">
              <Users className="h-3.5 w-3.5" /> {profile.employerSize}
            </div>
          )}
          {profile.foundedYear && (
            <div className="flex items-center gap-1.5 text-muted">
              <Clock className="h-3.5 w-3.5" /> Founded {profile.foundedYear}
            </div>
          )}
          {profile.websiteUrl && (
            <div className="flex items-center gap-1.5 text-muted">
              <Globe className="h-3.5 w-3.5" />
              <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                Website
              </a>
            </div>
          )}
        </div>
        {profile.benefits.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.benefits.map((b) => (
              <Badge key={b} variant="info">{b}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SchoolCard({ profile }: { profile: SchoolProfile }) {
  return (
    <Card>
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">School Profile</h3>
        </div>
        {profile.description && <p className="text-sm text-muted leading-relaxed">{profile.description}</p>}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {profile.schoolType && (
            <div className="flex items-center gap-1.5 text-muted">
              <GraduationCap className="h-3.5 w-3.5" /> {profile.schoolType}
            </div>
          )}
          {profile.curriculum && (
            <div className="flex items-center gap-1.5 text-muted">
              <Briefcase className="h-3.5 w-3.5" /> {profile.curriculum}
            </div>
          )}
          {profile.totalStudents && (
            <div className="flex items-center gap-1.5 text-muted">
              <Users className="h-3.5 w-3.5" /> {profile.totalStudents} students
            </div>
          )}
          {(profile.feeRangeMin || profile.feeRangeMax) && (
            <div className="flex items-center gap-1.5 text-muted">
              <DollarSign className="h-3.5 w-3.5" />
              Rs. {profile.feeRangeMin?.toLocaleString() ?? '?'} - {profile.feeRangeMax?.toLocaleString() ?? '?'}
            </div>
          )}
        </div>
        {profile.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.facilities.map((f) => (
              <Badge key={f} variant="info">{f}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MedicalCard({ profile }: { profile: MedicalProfile }) {
  return (
    <Card>
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Doctor / Medical Profile</h3>
        </div>
        {profile.description && <p className="text-sm text-muted leading-relaxed">{profile.description}</p>}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {profile.specialization && (
            <div className="flex items-center gap-1.5 text-muted">
              <Stethoscope className="h-3.5 w-3.5" /> {profile.specialization}
            </div>
          )}
          {profile.qualifications && (
            <div className="flex items-center gap-1.5 text-muted">
              <GraduationCap className="h-3.5 w-3.5" /> {profile.qualifications}
            </div>
          )}
          {profile.experienceYears && (
            <div className="flex items-center gap-1.5 text-muted">
              <Clock className="h-3.5 w-3.5" /> {profile.experienceYears} years exp.
            </div>
          )}
          {profile.consultationFee && (
            <div className="flex items-center gap-1.5 text-muted">
              <DollarSign className="h-3.5 w-3.5" /> Rs. {profile.consultationFee.toLocaleString()}
            </div>
          )}
          {profile.pmdcNumber && (
            <div className="flex items-center gap-1.5 text-muted">
              <Phone className="h-3.5 w-3.5" /> PMDC: {profile.pmdcNumber}
            </div>
          )}
          {profile.hospitalAffiliation && (
            <div className="flex items-center gap-1.5 text-muted">
              <Building2 className="h-3.5 w-3.5" /> {profile.hospitalAffiliation}
            </div>
          )}
        </div>
        {profile.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.services.map((s) => (
              <Badge key={s} variant="info">{s}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProductCard({ profile }: { profile: ProductProfile }) {
  return (
    <Card>
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Product Profile</h3>
        </div>
        {profile.description && <p className="text-sm text-muted leading-relaxed">{profile.description}</p>}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {profile.brand && (
            <div className="text-muted">Brand: <span className="text-foreground font-medium">{profile.brand}</span></div>
          )}
          {profile.productCategory && (
            <div className="text-muted">Category: <span className="text-foreground font-medium">{profile.productCategory}</span></div>
          )}
          {profile.barcode && (
            <div className="text-muted">Barcode: <span className="text-foreground font-medium">{profile.barcode}</span></div>
          )}
        </div>
        {profile.variants.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.variants.map((v) => (
              <Badge key={v}>{v}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function hasKey<K extends string>(obj: unknown, key: K): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}

export function CategoryProfileCard({ profile }: { profile: CategoryProfile | undefined }) {
  if (!profile) return null;

  if (hasKey(profile, 'industry') || hasKey(profile, 'employerSize') || hasKey(profile, 'benefits')) {
    return <EmployerCard profile={profile as EmployerProfile} />;
  }
  if (hasKey(profile, 'schoolType') || hasKey(profile, 'curriculum') || hasKey(profile, 'facilities')) {
    return <SchoolCard profile={profile as SchoolProfile} />;
  }
  if (hasKey(profile, 'specialization') || hasKey(profile, 'pmdcNumber') || hasKey(profile, 'services')) {
    return <MedicalCard profile={profile as MedicalProfile} />;
  }
  if (hasKey(profile, 'brand') || hasKey(profile, 'barcode') || hasKey(profile, 'variants')) {
    return <ProductCard profile={profile as ProductProfile} />;
  }

  return null;
}
