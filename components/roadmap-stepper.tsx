'use client';

import { useState } from 'react';
import { Check, CheckCircle2, ChevronRight, Circle, Layers, Flag, Sparkles } from 'lucide-react';

type Phase = {
  id: string;
  number: string;
  name: string;
  duration: string;
  deliverable: string;
  description: string;
  milestones: string[];
};

const phases: Phase[] = [
  {
    id: 'p1',
    number: '01',
    name: 'Computational Foundations',
    duration: 'Weeks 1 – 4',
    deliverable: 'CLI Developer Portfolio & Linux Dotfiles',
    description: 'Establish terminal muscle memory, version control fundamentals, and foundational algorithmic thinking in Python or TypeScript.',
    milestones: [
      'Master POSIX shell navigation, pipes, grep, and script automation',
      'Configured Git SSH keys, semantic branch workflows, and PR etiquette',
      'Data structures: arrays, hash maps, queues, and tree traversal algorithms',
      'Build and publish an interactive CLI utility on GitHub',
    ],
  },
  {
    id: 'p2',
    number: '02',
    name: 'Architecture & Full-Stack Systems',
    duration: 'Weeks 5 – 12',
    deliverable: 'Production Web App with Relational Database',
    description: 'Transition from isolated scripts to scalable client-server applications with persistent storage and robust type systems.',
    milestones: [
      'Model relational data schemas with PostgreSQL and migration tools',
      'Construct authenticated API endpoints with input validation schemas (Zod)',
      'Design accessible, responsive UI with server components and edge rendering',
      'Deploy containerized service behind HTTPS reverse proxy with CI/CD',
    ],
  },
  {
    id: 'p3',
    number: '03',
    name: 'AI Integration & Production Engineering',
    duration: 'Weeks 13 – 24',
    deliverable: 'Autonomous Agentic Workflow or Microservice',
    description: 'Integrate frontier AI models with deterministic tool calling, vector search indexes, and resilient distributed cache layers.',
    milestones: [
      'Implement Model Context Protocol (MCP) clients for tool orchestration',
      'Build semantic search retrieval pipeline using vector embeddings & Qdrant',
      'Implement rate limiters, token budget controls, and fallback circuits',
      'Instrument distributed tracing, structured logging, and health probes',
    ],
  },
  {
    id: 'p4',
    number: '04',
    name: 'Open-Source & Career Defense',
    duration: 'Weeks 25+',
    deliverable: 'Open-Source PR Merged & Capstone Project',
    description: 'Refine software for external review, conduct peer code reviews, and contribute production patches to prominent open-source repositories.',
    milestones: [
      'Contribute an approved documentation or bug fix PR to an open-source repo',
      'Write an in-depth technical post-mortem and system architecture writeup',
      'Conduct a live technical demo and code defense before mentors or peers',
      'Publish a comprehensive resume highlighting verified production outcomes',
    ],
  },
];

export function RoadmapStepper() {
  const [activePhaseId, setActivePhaseId] = useState('p1');
  const [checkedMilestones, setCheckedMilestones] = useState<Record<string, boolean>>({
    'Master POSIX shell navigation, pipes, grep, and script automation': true,
    'Configured Git SSH keys, semantic branch workflows, and PR etiquette': true,
  });

  const activePhase = phases.find((p) => p.id === activePhaseId) || phases[0];

  const toggleMilestone = (m: string) => {
    setCheckedMilestones((prev) => ({
      ...prev,
      [m]: !prev[m],
    }));
  };

  const totalCompleted = Object.values(checkedMilestones).filter(Boolean).length;
  const totalMilestones = phases.reduce((acc, p) => acc + p.milestones.length, 0);
  const progressPct = Math.round((totalCompleted / totalMilestones) * 100);

  return (
    <section className="roadmap-wrapper" id="roadmap">
      <div className="roadmap-inner">
        <div className="roadmap-intro">
          <span className="kicker">PROGRESSIVE ROADMAP</span>
          <h2>The Four Milestones</h2>
          <p>
            You do not need to memorize every framework. Follow this 4-phase trajectory from raw beginner to capable software contributor.
          </p>

          {/* Progress Tracker Card */}
          <div className="roadmap-progress-card">
            <div className="progress-header">
              <span className="progress-label">YOUR CHECKLIST PROGRESS</span>
              <span className="progress-percent">{progressPct}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }}></div>
            </div>
            <span className="progress-count">
              {totalCompleted} of {totalMilestones} curriculum milestones completed
            </span>
          </div>
        </div>

        {/* Stepper Interactive Container */}
        <div className="stepper-container">
          {/* Phase Tabs */}
          <div className="phase-tabs" role="tablist">
            {phases.map((phase) => {
              const isSelected = phase.id === activePhaseId;
              return (
                <button
                  key={phase.id}
                  role="tab"
                  aria-selected={isSelected}
                  className={`phase-tab-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setActivePhaseId(phase.id)}
                >
                  <span className="phase-tab-num">{phase.number}</span>
                  <span className="phase-tab-name">{phase.name}</span>
                  <span className="phase-tab-dur">{phase.duration}</span>
                </button>
              );
            })}
          </div>

          {/* Active Phase Details */}
          <div className="phase-detail-card">
            <div className="phase-card-top">
              <div>
                <span className="phase-eyebrow">PHASE {activePhase.number} · {activePhase.duration}</span>
                <h3 className="phase-title">{activePhase.name}</h3>
              </div>
              <div className="deliverable-badge">
                <Flag size={14} />
                <span>Deliverable: {activePhase.deliverable}</span>
              </div>
            </div>

            <p className="phase-description">{activePhase.description}</p>

            <div className="milestone-checklist">
              <span className="checklist-subhead">INTERACTIVE CHECKLIST (CLICK TO TRACK)</span>
              <div className="milestone-items">
                {activePhase.milestones.map((milestone) => {
                  const isChecked = !!checkedMilestones[milestone];
                  return (
                    <div
                      key={milestone}
                      className={`milestone-item ${isChecked ? 'completed' : ''}`}
                      onClick={() => toggleMilestone(milestone)}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          toggleMilestone(milestone);
                        }
                      }}
                    >
                      <div className={`checkbox-box ${isChecked ? 'checked' : ''}`}>
                        {isChecked && <Check size={14} />}
                      </div>
                      <span className="milestone-text">{milestone}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
