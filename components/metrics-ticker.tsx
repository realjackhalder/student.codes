'use client';

import { ShieldCheck, BookOpen, Layers, Terminal, Sparkles, Users } from 'lucide-react';

const metrics = [
  {
    icon: ShieldCheck,
    value: '100% Free',
    label: 'Open Education',
    detail: 'Zero paywalls, zero ads, open to every student',
  },
  {
    icon: Layers,
    value: '4 Core Tracks',
    label: 'Modern Curriculum',
    detail: 'AI Systems, Full-Stack, Cloud Infra, Cybersecurity',
  },
  {
    icon: BookOpen,
    value: '48+ Blueprints',
    label: 'Production Guides',
    detail: 'Step-by-step architectures with runnable code',
  },
  {
    icon: Terminal,
    value: 'MIT Licensed',
    label: 'Community Owned',
    detail: 'Publicly maintained on GitHub by students',
  },
];

export function MetricsTicker() {
  return (
    <section className="metrics-section" aria-label="Platform metrics">
      <div className="metrics-grid">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div className="metric-card" key={m.label}>
              <div className="metric-header">
                <span className="metric-icon">
                  <Icon size={18} />
                </span>
                <span className="metric-label">{m.label}</span>
              </div>
              <div className="metric-value">{m.value}</div>
              <p className="metric-detail">{m.detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
