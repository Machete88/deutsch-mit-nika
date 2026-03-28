import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useSettings } from '@/lib/settings-context';

/**
 * Onboarding Guard — redirects to onboarding if not completed.
 * Must be placed inside all providers (SettingsProvider etc.)
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { settings, isLoading } = useSettings();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!settings.hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding' as never);
    }
  }, [isLoading, settings.hasCompletedOnboarding, segments]);

  return <>{children}</>;
}
