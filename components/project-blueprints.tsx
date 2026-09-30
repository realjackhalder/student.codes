'use client';

import { useState } from 'react';
import { ArrowUpRight, Code, Database, Globe, Lock, Cpu, Sparkles, Star } from 'lucide-react';

type Blueprint = {
  id: string;
  category: 'ai' | 'web' | 'systems' | 'security';
  title: string;
  summary: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Capstone';
  timeEstimate: string;
  tags: string[];
  features: string[];
};

const blueprints: Blueprint[] = [
  {
    id: 'ai-agent',
    category: 'ai',
    title: 'Autonomous Multi-Tool Research Agent',
    summary: 'Construct an autonomous agent that searches the web, verifies sources with deterministic tools, and compiles structured Markdown reports with citations.',
    difficulty: 'Capstone',
    timeEstimate: '3 - 4 Weeks',
    tags: ['Python', 'MCP Protocol', 'FastAPI', 'Qdrant'],
    features: ['Tool orchestration loop', 'Evaluation benchmarks', 'Zero-shot hallucination detector'],
  },
  {
    id: 'kv-cache',
    category: 'systems',
    title: 'Distributed Key-Value Store with Raft',
    summary: 'Build a distributed in-memory cache with Raft consensus, peer discovery, write-ahead logs, and snapshotting for high fault tolerance.',
    difficulty: 'Capstone',
    timeEstimate: '4 - 5 Weeks',
    tags: ['Go / Rust', 'Distributed Systems', 'TCP', 'gRPC'],
    features: ['Leader election protocol', 'Log replication', 'Benchmark stress testing suite'],
  },
  {
    id: 'crdt-editor',
    category: 'web',
    title: 'Real-Time Multiplayer Canvas & Docs',
    summary: 'Create a local-first collaborative document editor using Conflict-free Replicated Data Types (CRDTs), WebSockets, and optimistic UI updates.',
    difficulty: 'Intermediate',
    timeEstimate: '2 - 3 Weeks',
    tags: ['Next.js 15', 'TypeScript', 'WebSockets', 'Tailwind'],
    features: ['Conflict-free merging', 'Multiplayer live cursor tracking', 'IndexedDB offline fallback'],
  },
  {
    id: 'zero-trust-proxy',
    category: 'security',
    title: 'Zero-Trust Reverse Proxy & WAF',
    summary: 'A secure API gateway with rate-limiting token buckets, JWT token verification, IP reputation lookups, and real-time security alerts.',
    difficulty: 'Intermediate',
    timeEstimate: '2 - 3 Weeks',
    tags: ['Docker', 'TypeScript', 'Redis', 'OWASP Rules'],
    features: ['Dynamic sliding-window limiter', 'JWT signature rotation', 'Audit log streaming'],
  },
  {
    id: 'wasm-compiler',
    category: 'systems',
    title: 'Tiny Lisp-to-WebAssembly Compiler',
    summary: 'Write a lexer, parser, and code generator that translates a simple functional programming language directly into WebAssembly binary bytecode (.wasm).',
    difficulty: 'Capstone',
    timeEstimate: '3 - 4 Weeks',
    tags: ['TypeScript / Rust', 'Compilers', 'WASM', 'ASTs'],
    features: ['Recursive descent parser', 'WASM binary emitter', 'Interactive browser REPL'],
  },
  {
    id: 'vector-engine',
    category: 'ai',
    title: 'Vector Similarity Search Engine from Scratch',
    summary: 'Implement HNSW (Hierarchical Navigable Small World) graph indexing for million-scale high-dimensional embedding similarity search without external libraries.',
    difficulty: 'Intermediate',
    timeEstimate: '2 - 3 Weeks',
    tags: ['Python / C++', 'Math & Linear Algebra', 'Algorithms'],
    features: ['Cosine & Euclidean metrics', 'HNSW approximate nearest neighbors', 'Fast quantization'],
  },
];

export function ProjectBlueprints() {
  const [filter, setFilter] = useState<'all' | 'ai' | 'web' | 'systems' | 'security'>('all');
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);

  const filtered = blueprints.filter(
    (b) => filter === 'all' || b.category === filter
  );

  return (
    <section className="section" id="blueprints">
      <div className="section-heading">
        <div>
          <span className="kicker">PORTFOLIO BLUEPRINTS</span>
          <h2>Build Projects That Matter</h2>
        </div>
        <p>
          Move past cookie-cutter todo apps. These production-grade blueprints simulate real engineering
          challenges with explicit architectures and portfolio-worthy deliverables.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="blueprint-filters" role="tablist">
        {(['all', 'ai', 'web', 'systems', 'security'] as const).map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={filter === cat}
            className={`blueprint-filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? 'All Disciplines' : cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Grid of Blueprints */}
      <div className="blueprints-grid">
        {filtered.map((b) => (
          <article className="blueprint-card" key={b.id}>
            <div className="blueprint-top">
              <span className={`diff-badge diff-${b.difficulty.toLowerCase()}`}>
                {b.difficulty}
              </span>
              <span className="time-badge">{b.timeEstimate}</span>
            </div>

            <h3 className="blueprint-title">{b.title}</h3>
            <p className="blueprint-summary">{b.summary}</p>

            <div className="blueprint-features">
              <span className="features-label">KEY DELIVERABLES</span>
              <ul>
                {b.features.map((feat) => (
                  <li key={feat}>✓ {feat}</li>
                ))}
              </ul>
            </div>

            <div className="blueprint-tags">
              {b.tags.map((t) => (
                <span key={t} className="tech-tag">{t}</span>
              ))}
            </div>

            <div className="blueprint-foot">
              <button
                className="blueprint-link-btn"
                onClick={() => setSelectedBlueprint(b)}
              >
                <span>Inspect Blueprint</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Detailed Blueprint Modal Drawer */}
      {selectedBlueprint && (
        <div className="modal-backdrop" onClick={() => setSelectedBlueprint(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge-pill">{selectedBlueprint.category.toUpperCase()} // {selectedBlueprint.difficulty}</span>
                <h3 className="modal-title">{selectedBlueprint.title}</h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedBlueprint(null)}>✕</button>
            </div>

            <div className="modal-body">
              <p className="modal-summary">{selectedBlueprint.summary}</p>
              
              <div className="modal-section">
                <h4>Suggested Architecture Breakdown</h4>
                <div className="arch-steps">
                  <div className="arch-step">
                    <span className="step-num">Step 1</span>
                    <p>Scaffold core repository, define strict schemas, and setup integration test suite with CI.</p>
                  </div>
                  <div className="arch-step">
                    <span className="step-num">Step 2</span>
                    <p>Implement core state logic, edge cases, and deterministic error handling.</p>
                  </div>
                  <div className="arch-step">
                    <span className="step-num">Step 3</span>
                    <p>Benchmark memory usage, add telemetry logging, and deploy an automated demo on GitHub.</p>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <span className="time-est">Estimated Duration: {selectedBlueprint.timeEstimate}</span>
                <a
                  href="https://github.com/realjackhalder/student.codes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button accent small"
                >
                  View Starter Template on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
