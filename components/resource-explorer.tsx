'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, BookOpen, Boxes, FileText, Search, Sparkles, Filter, X, ExternalLink, Clock, Bookmark } from 'lucide-react';

type ResourceItem = {
  id: string;
  title: string;
  desc: string;
  track: 'AI' | 'Web' | 'Systems' | 'Security';
  type: 'Guide' | 'Roadmap' | 'Interactive' | 'Deep Dive' | 'Specification';
  readTime: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  url: string;
};

const libraryData: ResourceItem[] = [
  {
    id: '1',
    title: 'Model Context Protocol (MCP) in Depth',
    desc: 'The official architectural guide to building agents that connect with databases, local filesystems, and third-party APIs safely.',
    track: 'AI',
    type: 'Specification',
    readTime: '15 min read',
    level: 'Intermediate',
    tags: ['Agents', 'MCP', 'Tool Calling'],
    url: 'https://modelcontextprotocol.io',
  },
  {
    id: '2',
    title: 'React 19 Server Components & Actions',
    desc: 'Master the unified mental model of React 19: Server Actions, optimistic state, useActionState, and high-performance hydration.',
    track: 'Web',
    type: 'Guide',
    readTime: '20 min read',
    level: 'Intermediate',
    tags: ['React 19', 'Next.js 15', 'Full Stack'],
    url: 'https://react.dev',
  },
  {
    id: '3',
    title: 'Linux Kernel Internals & System Calls',
    desc: 'How Linux schedules processes, handles memory pages, executes system calls (syscalls), and isolates containers with cgroups.',
    track: 'Systems',
    type: 'Deep Dive',
    readTime: '30 min read',
    level: 'Advanced',
    tags: ['Linux', 'Kernel', 'Cgroups'],
    url: 'https://kernel.org',
  },
  {
    id: '4',
    title: 'OWASP Top 10 Web Application Security',
    desc: 'Comprehensive mitigation patterns for modern web vulnerabilities: SQLi, SSRF, broken access control, and cryptographic failures.',
    track: 'Security',
    type: 'Guide',
    readTime: '18 min read',
    level: 'Beginner',
    tags: ['OWASP', 'AppSec', 'Web'],
    url: 'https://owasp.org',
  },
  {
    id: '5',
    title: 'Vector Embeddings & RAG from Scratch',
    desc: 'A zero-framework mathematical explanation of cosine similarity, chunking strategies, dense embeddings, and cross-encoder reranking.',
    track: 'AI',
    type: 'Interactive',
    readTime: '25 min read',
    level: 'Intermediate',
    tags: ['Vector DB', 'RAG', 'Embeddings'],
    url: 'https://github.com/realjackhalder/student.codes',
  },
  {
    id: '6',
    title: 'Zero-Trust Architecture Standard Guide',
    desc: 'NIST guidelines translated for software developers: continuous verification, least-privilege identity access, and mutual TLS.',
    track: 'Security',
    type: 'Specification',
    readTime: '22 min read',
    level: 'Intermediate',
    tags: ['Zero Trust', 'mTLS', 'Identity'],
    url: 'https://csrc.nist.gov',
  },
  {
    id: '7',
    title: 'Distributed Consensus: Raft Explained',
    desc: 'Visual, step-by-step walkthrough of leader election, heartbeat intervals, log replication, and split-brain resolution in Raft clusters.',
    track: 'Systems',
    type: 'Interactive',
    readTime: '20 min read',
    level: 'Advanced',
    tags: ['Raft', 'Consensus', 'Distributed'],
    url: 'https://raft.github.io',
  },
  {
    id: '8',
    title: 'TypeScript Type Gymnastics for Production',
    desc: 'Conditional types, mapped types, template literal types, and writing rock-solid generics for scalable frontend & backend SDKs.',
    track: 'Web',
    type: 'Deep Dive',
    readTime: '16 min read',
    level: 'Intermediate',
    tags: ['TypeScript', 'Generics', 'Typing'],
    url: 'https://www.typescriptlang.org',
  },
  {
    id: '9',
    title: 'Computer Networking: A Visual Packet Path',
    desc: 'Trace a single network packet from your browser DNS query through TLS handshakes, BGP routing, TCP syn/ack, to HTTP/3 QUIC.',
    track: 'Systems',
    type: 'Roadmap',
    readTime: '24 min read',
    level: 'Beginner',
    tags: ['Networking', 'TCP/IP', 'QUIC'],
    url: 'https://github.com/realjackhalder/student.codes',
  },
  {
    id: '10',
    title: 'Prompt Engineering & Reasoning Distillation',
    desc: 'How chain-of-thought, few-shot prompting, and structured output schemas (JSON Mode) reliably guide cutting-edge frontier models.',
    track: 'AI',
    type: 'Guide',
    readTime: '14 min read',
    level: 'Beginner',
    tags: ['Prompting', 'LLM', 'Reasoning'],
    url: 'https://github.com/realjackhalder/student.codes',
  },
  {
    id: '11',
    title: 'Building Modern Design Systems with CSS Variables',
    desc: 'Architecture patterns for dark mode, fluid clamp typography, accessibility color ratios, and headless component design.',
    track: 'Web',
    type: 'Guide',
    readTime: '15 min read',
    level: 'Beginner',
    tags: ['Design Systems', 'CSS Tokens', 'UI/UX'],
    url: 'https://github.com/realjackhalder/student.codes',
  },
  {
    id: '12',
    title: 'Memory Safety & Rust Systems Foundations',
    desc: 'Why memory safety matters: buffer overflows, use-after-free exploits, the borrow checker, ownership, and concurrency without data races.',
    track: 'Systems',
    type: 'Deep Dive',
    readTime: '28 min read',
    level: 'Intermediate',
    tags: ['Rust', 'Memory Safety', 'Systems'],
    url: 'https://www.rust-lang.org',
  },
];

export function ResourceExplorer() {
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const tracks = ['All', 'AI', 'Web', 'Systems', 'Security'];
  const types = ['All', 'Guide', 'Deep Dive', 'Interactive', 'Specification', 'Roadmap'];

  const filteredResources = useMemo(() => {
    return libraryData.filter((item) => {
      const matchesTrack = selectedTrack === 'All' || item.track === selectedTrack;
      const matchesType = selectedType === 'All' || item.type === selectedType;
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTrack && matchesType && matchesSearch;
    });
  }, [selectedTrack, selectedType, searchQuery]);

  return (
    <section className="resource-section" id="resources">
      <div className="resource-inner">
        <div className="resource-heading">
          <div>
            <span className="kicker">OFFICIAL KNOWLEDGE BASE</span>
            <h2>Curated Resource Library</h2>
            <p className="resource-subtitle">
              High-signal tutorials, official standards, and deep technical explainers vetted for clarity and accuracy.
            </p>
          </div>

          <div className="search-wrap">
            <div className="search">
              <Search size={18} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, tools, or keywords..."
                aria-label="Search resources"
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <span className="search-count">
              Showing {filteredResources.length} of {libraryData.length} documents
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="filters-container">
          <div className="track-filters" role="tablist" aria-label="Filter by track">
            <span className="filter-group-label">DISCIPLINE:</span>
            {tracks.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={selectedTrack === t}
                className={`filter-btn ${selectedTrack === t ? 'active' : ''}`}
                onClick={() => setSelectedTrack(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="type-filters" role="tablist" aria-label="Filter by format">
            <span className="filter-group-label">FORMAT:</span>
            {types.map((type) => (
              <button
                key={type}
                role="tab"
                aria-selected={selectedType === type}
                className={`filter-pill-btn ${selectedType === type ? 'active' : ''}`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Cards Grid */}
        <div className="resource-grid">
          {filteredResources.map((item) => (
            <article className="resource-card" key={item.id}>
              <div className="resource-meta">
                <span className={`area area-${item.track.toLowerCase()}`}>{item.track}</span>
                <span className="resource-type">{item.type}</span>
                <span className="resource-time">
                  <Clock size={12} /> {item.readTime}
                </span>
              </div>

              <h3 className="resource-title">{item.title}</h3>
              <p className="resource-desc">{item.desc}</p>

              <div className="resource-tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>

              <div className="resource-foot">
                <span className={`level-badge level-${item.level.toLowerCase()}`}>{item.level}</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-action-btn"
                  aria-label={`Open ${item.title}`}
                >
                  <span>Read Document</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="empty-state">
            <p className="empty-title">No matching resources found.</p>
            <p className="empty-desc">Try resetting your filters or adjusting your search keyword.</p>
            <button
              className="button dark small"
              onClick={() => {
                setSelectedTrack('All');
                setSelectedType('All');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
