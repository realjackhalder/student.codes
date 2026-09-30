'use client';

import { useState } from 'react';
import { ArrowRight, BrainCircuit, Code2, Cpu, ShieldAlert, CheckCircle2, ChevronRight, Terminal, Layers } from 'lucide-react';

const tracks = [
  {
    id: 'ai',
    number: '01',
    label: 'Artificial Intelligence',
    title: 'Autonomous AI & Agentic Systems',
    tagline: 'Engineer intelligence. Build agents that reason, plan, and execute.',
    description: 'Learn foundational machine learning, prompt engineering, model evaluation, vector retrieval (RAG), and autonomous agent frameworks with tool-calling capabilities.',
    colorClass: 'track-ai',
    accentColor: '#c9fa65',
    icon: BrainCircuit,
    estimatedTime: '12 - 16 Weeks',
    difficulty: 'Intermediate',
    prerequisites: 'Basic Python & Logic',
    competencies: [
      { name: 'LLM Foundations & Context Windows', level: '95%' },
      { name: 'Agent Workflows & Tool Calling (MCP)', level: '90%' },
      { name: 'Vector Databases, Embeddings & RAG', level: '85%' },
      { name: 'Model Evaluation, Alignment & Red-Teaming', level: '80%' },
    ],
    toolchain: ['Python 3.12', 'PyTorch', 'LangChain', 'FastAPI', 'Qdrant', 'Claude / Gemini APIs'],
    capstone: {
      name: 'Autonomous Research & Code Synthesis Agent',
      desc: 'An end-to-end agentic workflow that reads academic papers, writes verifiable code examples, tests them in an isolated container, and publishes documentation.',
    },
  },
  {
    id: 'fullstack',
    number: '02',
    label: 'Modern Web Engineering',
    title: 'Full-Stack & Design Systems',
    tagline: 'Craft resilient, accessible, and ultra-performant web applications.',
    description: 'Go beyond basic HTML/CSS. Master React 19 server components, Next.js 15 App Router, TypeScript type gymnastics, state machines, micro-interactions, and accessibility standards.',
    colorClass: 'track-web',
    accentColor: '#38bdf8',
    icon: Code2,
    estimatedTime: '10 - 14 Weeks',
    difficulty: 'Beginner to Intermediate',
    prerequisites: 'None (Zero to Hero)',
    competencies: [
      { name: 'React 19 & Server-Driven Architecture', level: '95%' },
      { name: 'TypeScript Strict Mode & Generics', level: '90%' },
      { name: 'Design Tokens, CSS Architecture & a11y', level: '88%' },
      { name: 'Edge Caching, Optimistic UI & Web Vitals', level: '85%' },
    ],
    toolchain: ['TypeScript', 'Next.js 15', 'React 19', 'Tailwind CSS', 'PostgreSQL', 'Prisma / Drizzle'],
    capstone: {
      name: 'Real-Time Collaborative Canvas & Docs',
      desc: 'A multiplayer document editor with conflict-free replicated data types (CRDTs), live cursor tracking, optimistic updates, and version history.',
    },
  },
  {
    id: 'systems',
    number: '03',
    label: 'Systems & Infrastructure',
    title: 'Cloud Infrastructure & Distributed Systems',
    tagline: 'Understand what happens between the silicon, network, and cloud.',
    description: 'Deep dive into operating systems, Linux kernel internals, TCP/IP networking, containerization, Kubernetes orchestration, and high-throughput systems written in Rust and Go.',
    colorClass: 'track-sys',
    accentColor: '#a78bfa',
    icon: Cpu,
    estimatedTime: '14 - 18 Weeks',
    difficulty: 'Advanced',
    prerequisites: 'Command line familiarity',
    competencies: [
      { name: 'Linux Kernel Primitives & Memory Model', level: '92%' },
      { name: 'Docker, Containerd & cgroups Internals', level: '90%' },
      { name: 'Distributed Consensus & Event Streams', level: '86%' },
      { name: 'Observability, Prometheus & OpenTelemetry', level: '84%' },
    ],
    toolchain: ['Linux', 'Docker', 'Kubernetes', 'Go / Rust', 'Terraform', 'Kafka / Redis'],
    capstone: {
      name: 'High-Throughput Distributed Key-Value Store',
      desc: 'A fault-tolerant distributed cache supporting Raft consensus, write-ahead logging (WAL), memory compaction, and custom binary RPC protocols.',
    },
  },
  {
    id: 'security',
    number: '04',
    label: 'Cyber Defense',
    title: 'Cybersecurity, Cryptography & Zero Trust',
    tagline: 'Defend infrastructure and discover vulnerabilities before attackers do.',
    description: 'Study offensive and defensive security: network packet analysis, web application exploit mitigation (OWASP Top 10), identity governance, cryptographic protocols, and incident response.',
    colorClass: 'track-sec',
    accentColor: '#f87171',
    icon: ShieldAlert,
    estimatedTime: '12 - 16 Weeks',
    difficulty: 'Intermediate to Advanced',
    prerequisites: 'Basic networking & Python',
    competencies: [
      { name: 'Network Packet Analysis & Wireshark', level: '92%' },
      { name: 'AppSec, Penetration Testing & OWASP', level: '90%' },
      { name: 'Modern Cryptography (TLS 1.3, Zero-Knowledge)', level: '84%' },
      { name: 'Zero-Trust Architecture & Identity Isolation', level: '88%' },
    ],
    toolchain: ['Wireshark', 'Burp Suite', 'Python', 'Nmap', 'Suricata', 'Linux Hardening'],
    capstone: {
      name: 'Automated Vulnerability Scanner & Defense Gateway',
      desc: 'A security analysis tool that inspects web servers for TLS misconfigurations, exposed endpoints, and vulnerable dependencies, generating compliance reports.',
    },
  },
];

export function TrackSelector() {
  const [activeTrackId, setActiveTrackId] = useState('ai');
  const activeTrack = tracks.find((t) => t.id === activeTrackId) || tracks[0];
  const Icon = activeTrack.icon;

  return (
    <section className="section" id="tracks">
      <div className="section-heading">
        <div>
          <span className="kicker">CURRICULUM DISCIPLINES</span>
          <h2>Explore Core Tracks</h2>
        </div>
        <p>
          Four comprehensive, production-grade learning tracks tailored for modern students.
          Select a discipline below to inspect competencies, toolchains, and real capstones.
        </p>
      </div>

      {/* Track Selector Tabs */}
      <div className="track-tab-bar" role="tablist" aria-label="Learning track tabs">
        {tracks.map((track) => {
          const TabIcon = track.icon;
          const isActive = track.id === activeTrackId;
          return (
            <button
              key={track.id}
              role="tab"
              aria-selected={isActive}
              className={`track-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTrackId(track.id)}
            >
              <span className="track-tab-number">{track.number}</span>
              <span className="track-tab-icon"><TabIcon size={16} /></span>
              <span className="track-tab-label">{track.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Track Showcase Card */}
      <div className={`track-detail-card ${activeTrack.colorClass}`}>
        <div className="track-detail-header">
          <div className="track-detail-meta">
            <span className="badge-pill">{activeTrack.number} // {activeTrack.label}</span>
            <span className="badge-pill subtle">Est. {activeTrack.estimatedTime}</span>
            <span className="badge-pill subtle">{activeTrack.difficulty}</span>
          </div>
          <div className="track-detail-icon-wrap">
            <Icon size={32} />
          </div>
        </div>

        <div className="track-detail-body">
          <h3 className="track-title">{activeTrack.title}</h3>
          <p className="track-tagline">{activeTrack.tagline}</p>
          <p className="track-desc">{activeTrack.description}</p>

          <div className="track-grid-details">
            {/* Competency Breakdown */}
            <div className="track-competencies">
              <span className="detail-subhead">CORE COMPETENCIES</span>
              <ul className="competency-list">
                {activeTrack.competencies.map((c) => (
                  <li key={c.name} className="competency-item">
                    <div className="comp-info">
                      <CheckCircle2 size={16} className="comp-icon" />
                      <span>{c.name}</span>
                    </div>
                    <div className="comp-bar-bg">
                      <div className="comp-bar-fill" style={{ width: c.level }}></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Toolchain & Capstone */}
            <div className="track-side-info">
              <div className="toolchain-box">
                <span className="detail-subhead">RECOMMENDED 2026 TOOLCHAIN</span>
                <div className="toolchain-tags">
                  {activeTrack.toolchain.map((tool) => (
                    <span key={tool} className="tool-tag">{tool}</span>
                  ))}
                </div>
              </div>

              <div className="capstone-box">
                <span className="detail-subhead">TARGET CAPSTONE PROJECT</span>
                <h4 className="capstone-name">{activeTrack.capstone.name}</h4>
                <p className="capstone-desc">{activeTrack.capstone.desc}</p>
              </div>
            </div>
          </div>

          <div className="track-footer-actions">
            <a href="#resources" className="button accent">
              Browse {activeTrack.label} Resources <ArrowRight size={15} />
            </a>
            <a href="#playground" className="button outline">
              Test in Playground <Terminal size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
