'use client';

import { useCallback } from 'react';
import {
  CHALLENGE_PROGRESS_STORAGE_KEY,
  emptyChallengeProgress,
  parseChallengeProgress,
} from '~/lib/challenge-progress';
import { useLocalStorage } from './local-storage';

export function useChallengeProgress() {
  const [progress, setProgress] = useLocalStorage(
    CHALLENGE_PROGRESS_STORAGE_KEY,
    emptyChallengeProgress,
    {
      deserializer: (value) => parseChallengeProgress(JSON.parse(value)),
      initializeWithValue: false,
    },
  );

  const markComplete = useCallback(
    (challengeId: string) =>
      setProgress((current) => ({
        ...current,
        completed: {
          ...current.completed,
          [challengeId]:
            current.completed[challengeId] ?? new Date().toISOString(),
        },
      })),
    [setProgress],
  );

  return { progress, markComplete };
}
