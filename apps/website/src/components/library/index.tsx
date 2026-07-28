'use client';

import { Button } from '@evaluate/components/button';
import { Input } from '@evaluate/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@evaluate/components/select';
import { Say, useSay } from '@sayable/react';
import {
  DownloadIcon,
  PencilIcon,
  StarIcon,
  Trash2Icon,
  UploadIcon,
} from 'lucide-react';
import { compress } from 'piston.ts/evaluate';
import type { Dispatch, SetStateAction } from 'react';
import { useMemo, useRef, useState } from 'react';
import { LocalisedLink } from '~/components/localised-link';
import { useLibrary } from '~/hooks/library';
import {
  exportLibrary,
  importLibrary,
  type Library as LibraryData,
  type LibraryProject as LibraryProjectData,
  sortLibraryProjects,
} from '~/lib/library';

type Sort = 'recent' | 'name' | 'favorites';

function download(filename: string, content: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function Library() {
  const say = useSay();
  const { library, setLibrary } = useLibrary();
  const fileInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('recent');
  const [message, setMessage] = useState('');
  const projects = useMemo(
    () =>
      sortLibraryProjects(library.projects, sort).filter((project) =>
        `${project.title} ${project.tags.join(' ')}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [library.projects, query, sort],
  );

  async function importProjects(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 5_000_000)
        throw new Error(say`Imports must be smaller than 5 MB.`);
      const result = importLibrary(JSON.parse(await file.text()), library);
      setLibrary(result.library);
      setMessage(
        say`Imported ${result.imported} project(s); skipped ${result.skipped} duplicate(s).`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : say`Could not import that file.`,
      );
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  return (
    <div className="container space-y-6 py-10">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl text-primary">
          <Say>My library</Say>
        </h1>
        <p className="text-muted-foreground">
          <Say>Projects are stored only in this browser.</Say>
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          aria-label={say`Search saved projects`}
          placeholder={say`Search projects or tags`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select value={sort} onValueChange={(value: Sort) => setSort(value)}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">
              <Say>Last updated</Say>
            </SelectItem>
            <SelectItem value="name">
              <Say>Name</Say>
            </SelectItem>
            <SelectItem value="favorites">
              <Say>Favorites first</Say>
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          onClick={() =>
            download(
              'student-codes-library.json',
              exportLibrary(library.projects),
            )
          }
        >
          <DownloadIcon className="size-4" />
          <Say>Export</Say>
        </Button>
        <Button variant="secondary" onClick={() => fileInput.current?.click()}>
          <UploadIcon className="size-4" />
          <Say>Import</Say>
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(event) => importProjects(event.target.files?.[0])}
        />
      </div>
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
      {projects.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <Say>
            No saved projects yet. Open a playground and select Save to library.
          </Say>
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((project) => (
            <LibraryProject
              key={project.id}
              project={project}
              setLibrary={setLibrary}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LibraryProject({
  project,
  setLibrary,
}: {
  project: LibraryProjectData;
  setLibrary: Dispatch<SetStateAction<LibraryData>>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [tags, setTags] = useState(project.tags.join(', '));
  const hash = compress({
    files: project.files,
    entry: project.entry,
    focused: project.focused,
  });
  const href = `/playgrounds/${encodeURIComponent(project.runtimeId)}?library=${project.id}#${hash}`;
  function update(values: Partial<typeof project>) {
    setLibrary((current) => ({
      ...current,
      projects: current.projects.map((item) =>
        item.id === project.id
          ? { ...item, ...values, updatedAt: new Date().toISOString() }
          : item,
      ),
    }));
  }
  if (editing)
    return (
      <article className="rounded-xl border bg-card p-5 space-y-2">
        <Input
          aria-label="Project name"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Input
          aria-label="Project tags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
        />
        <div className="flex gap-2">
          <Button
            onClick={() => {
              update({
                title: title.trim() || project.title,
                tags: tags
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              });
              setEditing(false);
            }}
          >
            Save details
          </Button>
          <Button variant="secondary" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </article>
    );
  return (
    <article className="rounded-xl border bg-card p-5">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold">{project.title}</h2>
          <p className="text-muted-foreground text-sm">{project.runtimeId}</p>
          <p className="mt-2 text-muted-foreground text-xs">
            {project.tags.join(' · ') || 'No tags'}
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          title="Edit project details"
          onClick={() => setEditing(true)}
        >
          <PencilIcon className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          title={project.favorite ? 'Remove favorite' : 'Add favorite'}
          onClick={() => update({ favorite: !project.favorite })}
        >
          <StarIcon
            className={project.favorite ? 'size-4 fill-current' : 'size-4'}
          />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          title="Delete project"
          onClick={() => {
            if (confirm(`Delete “${project.title}”?`))
              setLibrary((current) => ({
                ...current,
                projects: current.projects.filter(
                  (item) => item.id !== project.id,
                ),
              }));
          }}
        >
          <Trash2Icon className="size-4" />
        </Button>
      </div>
      <div className="mt-4 flex gap-2">
        <Button asChild className="flex-1">
          <LocalisedLink href={href}>Open project</LocalisedLink>
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            setLibrary((current) => ({
              ...current,
              projects: [
                ...current.projects,
                {
                  ...project,
                  id: crypto.randomUUID(),
                  title: `${project.title} copy`,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
            }))
          }
        >
          Duplicate
        </Button>
      </div>
    </article>
  );
}
