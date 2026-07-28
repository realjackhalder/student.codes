'use client';

import { Button } from '@evaluate/components/button';
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@evaluate/components/dialog';
import { Input } from '@evaluate/components/input';
import { Say, useSay } from '@sayable/react';
import { BookmarkIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Runtime } from 'piston.ts';
import { useId, useState } from 'react';
import { folderToOptions, useExplorer } from '~/components/explorer/use';
import { useLibrary } from '~/hooks/library';

export function SaveToLibraryButton({
  runtime,
}: {
  runtime: typeof Runtime._output;
}) {
  const explorer = useExplorer();
  const say = useSay();
  const { saveProject } = useLibrary();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(`${runtime.name} project`);
  const [tags, setTags] = useState('');
  const titleId = useId();
  const tagsId = useId();

  function save() {
    const options = folderToOptions(explorer);
    const project = saveProject(
      { runtimeId: runtime.id, ...options },
      { title, tags: tags.split(','), favorite: false },
      params.get('library') ?? undefined,
    );
    setOpen(false);
    router.replace(`${pathname}?library=${project.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="secondary"
        className="aspect-square p-0"
        onClick={() => setOpen(true)}
        title={say`Save to library`}
      >
        <BookmarkIcon className="size-4" />
        <span className="sr-only">
          <Say>Save to library</Say>
        </span>
      </Button>
      <DialogBody>
        <DialogHeader>
          <DialogTitle>
            <Say>Save to library</Say>
          </DialogTitle>
          <DialogDescription>
            <Say>Save this project only in the current browser.</Say>
          </DialogDescription>
        </DialogHeader>
        <label className="grid gap-1 text-sm" htmlFor={titleId}>
          <Say>Project name</Say>
          <Input
            id={titleId}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            autoFocus
          />
        </label>
        <label className="grid gap-1 text-sm" htmlFor={tagsId}>
          <Say>Tags (comma separated)</Say>
          <Input
            id={tagsId}
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
        </label>
        <DialogFooter>
          <Button type="button" onClick={save} disabled={!title.trim()}>
            <Say>Save project</Say>
          </Button>
        </DialogFooter>
      </DialogBody>
    </Dialog>
  );
}
