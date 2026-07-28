'use client';

import { useSay } from '@sayable/react';
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  Code2Icon,
  RocketIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { useState } from 'react';

export type PublishingEnvironment = 'dev' | 'uat' | 'prod';

type EnvironmentPipelineProps = {
  initialEnvironment: PublishingEnvironment;
};

const environmentStyles = {
  dev: {
    border: 'border-blue-500/45',
    background: 'bg-blue-500/8',
    text: 'text-blue-500',
    Icon: Code2Icon,
  },
  uat: {
    border: 'border-amber-500/45',
    background: 'bg-amber-500/8',
    text: 'text-amber-500',
    Icon: ClipboardCheckIcon,
  },
  prod: {
    border: 'border-emerald-500/45',
    background: 'bg-emerald-500/8',
    text: 'text-emerald-500',
    Icon: RocketIcon,
  },
} satisfies Record<
  PublishingEnvironment,
  {
    border: string;
    background: string;
    text: string;
    Icon: typeof Code2Icon;
  }
>;

export function EnvironmentPipeline({
  initialEnvironment,
}: EnvironmentPipelineProps) {
  const say = useSay();
  const [selected, setSelected] =
    useState<PublishingEnvironment>(initialEnvironment);
  const environments = [
    {
      id: 'dev' as const,
      name: say`Development`,
      shortName: 'DEV',
      purpose: say`Build and integrate changes quickly`,
      audience: say`Developers and automated tests`,
      stability: say`Changes frequently`,
      data: say`Seeded, fake, or disposable data`,
      deployment: say`Automatic after an accepted change`,
      advantage: say`Fast feedback makes experimentation inexpensive.`,
      gate: say`Code review and automated checks pass`,
      branch: 'develop',
    },
    {
      id: 'uat' as const,
      name: say`User Acceptance Testing`,
      shortName: 'UAT',
      purpose: say`Validate that the release solves the business need`,
      audience: say`QA, product owners, and selected users`,
      stability: say`Production-like release candidate`,
      data: say`Masked or representative test data`,
      deployment: say`Promoted from a tested release candidate`,
      advantage: say`Stakeholders catch requirement gaps before customers do.`,
      gate: say`Business acceptance and regression tests pass`,
      branch: 'release/uat',
    },
    {
      id: 'prod' as const,
      name: say`Production`,
      shortName: 'PROD',
      purpose: say`Deliver the approved product to real customers`,
      audience: say`Customers and operations teams`,
      stability: say`Stable, monitored, and recoverable`,
      data: say`Real customer data with strict access controls`,
      deployment: say`Approved release with rollback available`,
      advantage: say`Guardrails protect customer trust while delivering value.`,
      gate: say`Final approval, observability, and rollback are ready`,
      branch: 'main',
    },
  ];
  const active = environments.find(
    (environment) => environment.id === selected,
  )!;
  const activeStyle = environmentStyles[active.id];
  const ActiveIcon = activeStyle.Icon;

  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <header className="border-b p-5">
        <p className="flex items-center gap-2 font-medium text-primary text-sm">
          <ShieldCheckIcon aria-hidden="true" className="size-4" />
          {say`Publishing environments`}
        </p>
        <h2 className="mt-1 font-semibold text-2xl">
          {say`Promote one tested release through three environments`}
        </h2>
        <p className="mt-2 max-w-3xl text-muted-foreground text-sm">
          {say`Development optimizes feedback, UAT validates business expectations, and Production protects real users. Select a stage to compare its purpose and guardrails.`}
        </p>
      </header>

      <div className="grid items-stretch gap-3 p-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:p-5">
        {environments.map((environment, index) => {
          const style = environmentStyles[environment.id];
          const Icon = style.Icon;
          const isSelected = environment.id === selected;
          return (
            <div className="contents" key={environment.id}>
              <button
                aria-pressed={isSelected}
                className={`rounded-xl border p-4 text-left transition-[border-color,background-color,transform,box-shadow] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring ${
                  isSelected
                    ? `${style.border} ${style.background} shadow-sm`
                    : 'bg-background hover:border-foreground/25'
                }`}
                onClick={() => setSelected(environment.id)}
                type="button"
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-lg ${style.background} ${style.text}`}
                >
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className={`mt-4 block font-semibold ${style.text}`}>
                  {environment.shortName}
                </span>
                <span className="mt-1 block font-medium">
                  {environment.name}
                </span>
                <span className="mt-2 block text-muted-foreground text-sm">
                  {environment.purpose}
                </span>
                <code className="mt-3 block w-fit rounded-md bg-muted px-2 py-1 text-xs">
                  {environment.branch}
                </code>
              </button>
              {index < environments.length - 1 && (
                <div className="flex items-center justify-center text-muted-foreground">
                  <ArrowRightIcon
                    aria-hidden="true"
                    className="size-5 rotate-90 md:rotate-0"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        aria-live="polite"
        className={`border-t p-5 ${activeStyle.background}`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-background ${activeStyle.text}`}
          >
            <ActiveIcon aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className={`font-semibold ${activeStyle.text}`}>{active.name}</p>
            <p className="mt-1 text-sm">{active.advantage}</p>
          </div>
        </div>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            [say`Who uses it`, active.audience],
            [say`Expected stability`, active.stability],
            [say`Data`, active.data],
            [say`Promotion gate`, active.gate],
          ].map(([term, description]) => (
            <div key={term}>
              <dt className="font-medium">{term}</dt>
              <dd className="mt-1 text-muted-foreground">{description}</dd>
            </div>
          ))}
        </dl>
      </div>

      <details className="group border-t">
        <summary className="cursor-pointer list-none px-5 py-4 font-medium text-sm">
          {say`Compare all environments`}
        </summary>
        <div className="overflow-x-auto border-t">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">{say`Environment`}</th>
                <th className="px-4 py-3 font-medium">{say`Audience`}</th>
                <th className="px-4 py-3 font-medium">{say`Data`}</th>
                <th className="px-4 py-3 font-medium">{say`Deployment`}</th>
              </tr>
            </thead>
            <tbody>
              {environments.map((environment) => (
                <tr className="border-t" key={environment.id}>
                  <th className="px-4 py-3 font-medium">
                    {environment.shortName}
                  </th>
                  <td className="px-4 py-3 text-muted-foreground">
                    {environment.audience}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {environment.data}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {environment.deployment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <p className="flex items-start gap-2 border-t px-5 py-4 text-muted-foreground text-xs">
        <CheckCircle2Icon
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-primary"
        />
        {say`Promote the same reviewed artifact forward instead of rebuilding different code for each environment.`}
      </p>
    </section>
  );
}
