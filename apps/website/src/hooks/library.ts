'use client';

import { useCallback } from 'react';
import {
  createLibraryProject,
  emptyLibrary,
  LIBRARY_STORAGE_KEY,
  type LibraryProject,
  type ProjectSnapshot,
  parseLibrary,
  updateLibraryProject,
  upsertLibraryProject,
} from '~/lib/library';
import { useLocalStorage } from './local-storage';

export function useLibrary() {
  const [library, setLibrary] = useLocalStorage(
    LIBRARY_STORAGE_KEY,
    emptyLibrary,
    {
      deserializer: (value) => parseLibrary(JSON.parse(value)),
      initializeWithValue: false,
    },
  );

  const saveProject = useCallback(
    (
      snapshot: ProjectSnapshot,
      values: Pick<LibraryProject, 'title' | 'tags' | 'favorite'>,
      id?: string,
    ) => {
      const existing = id
        ? library.projects.find((project) => project.id === id)
        : undefined;
      const project = existing
        ? updateLibraryProject(existing, snapshot, values)
        : createLibraryProject(snapshot, values);
      setLibrary((current) => upsertLibraryProject(current, project));
      return project;
    },
    [library.projects, setLibrary],
  );

  return { library, setLibrary, saveProject };
}
