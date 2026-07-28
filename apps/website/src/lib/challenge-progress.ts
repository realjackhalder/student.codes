import { z } from 'zod';

export const CHALLENGE_PROGRESS_STORAGE_KEY =
  'student.codes.challenge-progress.v1';

const progressSchema = z.object({
  version: z.literal(1),
  completed: z.record(z.string(), z.string().datetime()),
});

export type ChallengeProgress = z.infer<typeof progressSchema>;
export const emptyChallengeProgress: ChallengeProgress = {
  version: 1,
  completed: {},
};

export function parseChallengeProgress(value: unknown): ChallengeProgress {
  const result = progressSchema.safeParse(value);
  return result.success ? result.data : emptyChallengeProgress;
}
