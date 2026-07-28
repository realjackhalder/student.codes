'use client';

import { z } from 'zod';

export const LIBRARY_STORAGE_KEY = 'student.codes.library.v1';
const projectId = z.string().min(1);

const projectSchema = z.object({
  id: projectId,
  title: z.string().trim().min(1).max(120),
  runtimeId: z.string().min(1),
  files: z.record(z.string(), z.string()),
  entry: z.string().min(1),
  focused: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
  favorite: z.boolean(),
});

const librarySchema = z.object({
  version: z.literal(1),
  projects: z.array(projectSchema),
});

export type LibraryProject = z.infer<typeof projectSchema>;
export type Library = z.infer<typeof librarySchema>;
export type ProjectSnapshot = Pick<
  LibraryProject,
  'runtimeId' | 'files' | 'entry' | 'focused'
>;

export const emptyLibrary: Library = { version: 1, projects: [] };

export function parseLibrary(value: unknown): Library {
  const result = librarySchema.safeParse(value);
  return result.success ? result.data : emptyLibrary;
}

export function getLibraryProject(
  id: string | null,
): LibraryProject | undefined {
  if (!id || typeof window === 'undefined') return undefined;
  try {
    return parseLibrary(
      JSON.parse(localStorage.getItem(LIBRARY_STORAGE_KEY) ?? ''),
    ).projects.find((project) => project.id === id);
  } catch {
    return undefined;
  }
}

export function exportLibrary(projects: LibraryProject[]) {
  return JSON.stringify({ version: 1, projects }, null, 2);
}

export function importLibrary(
  value: unknown,
  existing: Library,
): { library: Library; imported: number; skipped: number } {
  const incoming = parseLibrary(value);
  if (incoming === emptyLibrary && value !== emptyLibrary)
    throw new Error('That file is not a valid student.codes library export.');
  const ids = new Set(existing.projects.map((project) => project.id));
  const projects = [...existing.projects];
  let imported = 0;
  let skipped = 0;
  for (const project of incoming.projects) {
    if (ids.has(project.id)) {
      skipped += 1;
      continue;
    }
    projects.push(project);
    ids.add(project.id);
    imported += 1;
  }
  return { library: { version: 1, projects }, imported, skipped };
}

export function normaliseTags(input: string | string[]) {
  const tags = (Array.isArray(input) ? input : input.split(','))
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(tags)].slice(0, 20);
}

export function createLibraryProject(
  snapshot: ProjectSnapshot,
  values: Pick<LibraryProject, 'title' | 'tags' | 'favorite'>,
): LibraryProject {
  const now = new Date().toISOString();
  return projectSchema.parse({
    ...snapshot,
    id: crypto.randomUUID(),
    title: values.title.trim(),
    tags: normaliseTags(values.tags),
    favorite: values.favorite,
    createdAt: now,
    updatedAt: now,
  });
}

export function updateLibraryProject(
  project: LibraryProject,
  snapshot: ProjectSnapshot,
  values: Pick<LibraryProject, 'title' | 'tags' | 'favorite'>,
): LibraryProject {
  return projectSchema.parse({
    ...project,
    ...snapshot,
    title: values.title.trim(),
    tags: normaliseTags(values.tags),
    favorite: values.favorite,
    updatedAt: new Date().toISOString(),
  });
}

export function upsertLibraryProject(
  library: Library,
  project: LibraryProject,
): Library {
  const index = library.projects.findIndex(({ id }) => id === project.id);
  const projects = [...library.projects];
  if (index === -1) projects.push(project);
  else projects[index] = project;
  return { version: 1, projects };
}

export function sortLibraryProjects(
  projects: LibraryProject[],
  sort: 'recent' | 'name' | 'favorites' = 'recent',
) {
  return [...projects].sort((a, b) => {
    if (sort === 'name') return a.title.localeCompare(b.title);
    if (sort === 'favorites' && a.favorite !== b.favorite)
      return Number(b.favorite) - Number(a.favorite);
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}
