'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicLayout } from '@/components/layout';
import { Button, Card, CardContent, Skeleton } from '@/components/ui';
import { useCategories, useCities, useSetOnboardingPreferences } from '@/hooks/use-api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/shared/toast';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: cities, isLoading: cityLoading } = useCities();
  const setPrefs = useSetOnboardingPreferences();
  const toast = useToast();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  if (!isAuthenticated) {
    router.replace('/auth/login');
    return null;
  }

  const toggleCategory = (key: string) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleComplete = () => {
    setPrefs.mutate(
      { categoryKeys: selectedCategories, selectedCityId: selectedCity },
      {
        onSuccess: () => {
          toast.success('Preferences saved!');
          router.push('/feed');
        },
        onError: () => toast.error('Failed to save preferences'),
      },
    );
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Welcome to ReviewHistory</h1>
          <p className="mt-2 text-muted">Let&apos;s personalize your experience</p>
          <div className="mt-4 flex justify-center gap-2">
            <div className={cn('h-2 w-16 rounded-full', step >= 1 ? 'bg-primary' : 'bg-gray-200')} />
            <div className={cn('h-2 w-16 rounded-full', step >= 2 ? 'bg-primary' : 'bg-gray-200')} />
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardContent className="py-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                What categories interest you?
              </h2>
              {catLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {categories?.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => toggleCategory(cat.key)}
                      className={cn(
                        'rounded-lg border p-3 text-left text-sm font-medium transition-colors',
                        selectedCategories.includes(cat.key)
                          ? 'border-primary bg-primary-light text-primary-dark'
                          : 'border-border text-muted hover:bg-surface',
                      )}
                    >
                      <span className="mr-1">{cat.icon}</span> {cat.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <Button
                  disabled={selectedCategories.length === 0}
                  onClick={() => setStep(2)}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="py-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Select your city</h2>
              {cityLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-80 overflow-y-auto">
                  {cities?.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => setSelectedCity(city.id)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                        selectedCity === city.id
                          ? 'border-primary bg-primary-light text-primary-dark'
                          : 'border-border text-muted hover:bg-surface',
                      )}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setSelectedCity(null); handleComplete(); }}>
                    Skip
                  </Button>
                  <Button loading={setPrefs.isPending} onClick={handleComplete}>
                    Complete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PublicLayout>
  );
}
