'use client';

import { toast } from '@evaluate/components/toast';
import { useEventListener } from '@evaluate/hooks/event-listener';
import { useSay } from '@sayable/react';
import { useSearchParams } from 'next/navigation';
import {
  ExecuteOptions,
  type FilesOptions,
  getRuntimeExamples,
  type Runtime,
} from 'piston.ts';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { File, Folder } from 'virtual-file-explorer-backend';
import { useHashFragment } from '~/hooks/hash-fragment';
import { getChallenge } from '~/lib/challenges';
import { getLibraryProject } from '~/lib/library';
import { decodeSharedProject, makeSharedUrl } from '~/lib/share';

export const ExplorerContext = //
  createContext<Folder<true>>(null!);
ExplorerContext.displayName = 'ExplorerContext';

export const ExplorerConsumer = ExplorerContext.Consumer;

export function ExplorerProvider({
  runtime,
  children,
}: React.PropsWithChildren<{
  runtime: typeof Runtime._output;
}>) {
  const say = useSay();

  const [hash, setHash] = useHashFragment();
  const searchParams = useSearchParams();
  const invalidShareToast = useRef<string | undefined>(undefined);
  const example = useMemo(
    () => getRuntimeExamples(runtime.id)?.[0],
    [runtime.id],
  );

  useEffect(() => {
    const invalid =
      hash &&
      !getLibraryProject(searchParams.get('library')) &&
      !decodeSharedProject(hash);
    if (invalid && invalidShareToast.current !== hash) {
      invalidShareToast.current = hash;
      toast.error(say`This shared playground link is invalid or too large.`);
    }
    if (!invalid) invalidShareToast.current = undefined;
  }, [hash, say, searchParams]);

  const root = useMemo(() => {
    let root: Folder<true>;
    const project = getLibraryProject(searchParams.get('library'));
    const challenge = getChallenge(searchParams.get('challenge'));
    if (project?.runtimeId === runtime.id) root = optionsToFolder(project);
    else if (challenge?.runtimeId === runtime.id)
      root = optionsToFolder(challenge.starter);
    else if (hash) {
      const shared = decodeSharedProject(hash);
      if (shared) root = optionsToFolder(shared);
      else
        root = example
          ? optionsToFolder(example)
          : new Folder<true>('::root::');
    } else if (example) root = optionsToFolder(example);
    else root = new Folder<true>('::root::');

    if (!root.children.some((c) => c.name === '::args::'))
      new File('::args::').parent = root;
    if (!root.children.some((c) => c.name === '::input::'))
      new File('::input::').parent = root;

    root.select().expand();
    return root;
  }, [hash, example, runtime.id, searchParams]);

  const saveAndCopyUrl = useCallback(
    (e: Event) => {
      e.preventDefault();
      const url = makeSharedUrl(folderToOptions(root));
      setHash(new URL(url).hash.slice(1));
      navigator.clipboard
        .writeText(url)
        .then(() => toast.info(say`Share link copied to clipboard`))
        .catch(() => toast.error(say`Could not copy the share link`));
    },
    [say, setHash, root],
  );
  useEventListener('copy-url' as never, saveAndCopyUrl);

  return (
    <DndProvider backend={HTML5Backend}>
      <ExplorerContext.Provider value={root}>
        {children}
      </ExplorerContext.Provider>
    </DndProvider>
  );
}

export function useExplorer() {
  const context = useContext(ExplorerContext);
  if (context) return context;
  throw new Error('useExplorer must be used within a ExplorerProvider');
}

export function useWatch(
  item: Folder | File | null,
  events: string[],
  callback?: () => unknown,
) {
  const [, setTick] = useState(0);
  const update = useCallback(() => {
    if (callback) callback();
    else setTick((t) => t + 1);
  }, [callback]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Rest of the deps
  useEffect(() => {
    for (const e of events) item?.changes.on(e, update);
    return () => {
      for (const e of events) item?.changes.off(e, update);
    };
  }, [item, update, ...events]);
}

//

export function folderToOptions(folder: Folder) {
  const files: Record<string, string> = {};
  let entry: string | undefined;
  let focused: string | undefined;

  for (const file of folder.descendants //
    .filter((f): f is File => f.type === 'file')) {
    if (Reflect.get(file, 'entry')) entry = file.path;
    if (file.focused) focused = file.path;
    files[file.path] = file.content;
  }

  return ExecuteOptions.parse({ files, entry, focused });
}

function optionsToFolder(
  options: typeof FilesOptions._output & { focused?: string },
) {
  const root = new Folder<true>('::root::');

  for (const [path, content] of Object.entries(options.files)) {
    let parent = root;

    for (const name of path.split('/').slice(0, -1)) {
      const child = parent.children.find((c) => c.name === name);

      if (child instanceof File) {
        throw new Error('Invalid state');
      } else if (child instanceof Folder) {
        parent = child;
      } else {
        const newParent = new Folder(name);
        newParent.parent = parent;
        parent = newParent;
      }
    }

    if (!path.endsWith('/')) {
      const name = path.split('/').pop();
      const file = new File(name!);
      file.content = content;
      file.parent = parent;

      if (path === options.entry) Reflect.set(file, 'entry', true);
      if (path === (options.focused ?? options.entry))
        file.opened = file.focused = true;
    }
  }

  return root;
}
