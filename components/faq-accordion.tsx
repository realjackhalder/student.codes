'use client';

import { useState } from 'react';
import { ChevronDown, Search, HelpCircle, Sparkles } from 'lucide-react';

type FAQItem = {
  id: string;
  category: 'general' | 'curriculum' | 'career' | 'opensource';
  q: string;
  a: string;
};

const faqs: FAQItem[] = [
  {
    id: 'f1',
    category: 'general',
    q: 'What is Student + Codes and who is it intended for?',
    a: 'Student + Codes is an open-source, non-profit technical curriculum designed for self-directed students, high schoolers, and undergraduates who want to learn modern production software engineering, artificial intelligence, and systems computing without commercial noise or gatekeeping.',
  },
  {
    id: 'f2',
    category: 'general',
    q: 'Is everything here genuinely free and non-commercial?',
    a: 'Yes. Every guide, blueprint, and interactive tool on this website is 100% free and open-source under the MIT license. There are zero paid subscriptions, sponsor-gated sections, course up-sells, or trackers.',
  },
  {
    id: 'f3',
    category: 'curriculum',
    q: 'How does this compare to traditional coding bootcamps or university courses?',
    a: 'Traditional curricula often lag behind industry trends by 3 to 5 years. Student + Codes emphasizes modern 2026 standards: Model Context Protocol (MCP), React 19 server architectures, distributed memory systems, and zero-trust security postures, alongside foundational algorithmic rigor.',
  },
  {
    id: 'f4',
    category: 'curriculum',
    q: 'Do I need a high-end laptop or expensive GPU to complete these tracks?',
    a: 'No. All foundational and full-stack projects can be written on basic hardware (or Chromebooks via free Cloud environments like GitHub Codespaces). For AI tracks, we emphasize API tool calling and quantised small models that run comfortably on CPU or free cloud tiers.',
  },
  {
    id: 'f5',
    category: 'career',
    q: 'How do these projects help with internships, college admissions, and job interviews?',
    a: 'Recruiters and engineering leads consistently disregard generic boilerplate apps. The capstone blueprints here (such as Raft consensus or zero-trust gateways) demonstrate deep understanding of networking, memory safety, and production resilience—giving you substantial, verifiable work to discuss during technical interviews.',
  },
  {
    id: 'f6',
    category: 'opensource',
    q: 'How can students contribute new guides, fix typos, or submit project blueprints?',
    a: 'Our entire platform is open source on GitHub. Anyone can open an issue, propose a new guide, or submit a pull request. We actively mentor first-time contributors through our pull request review process.',
  },
  {
    id: 'f7',
    category: 'career',
    q: 'Is there a completion certificate or credential issued?',
    a: 'We believe verifiable software speaks louder than digital PDF certificates. By completing a track, your certificate is your public GitHub repository, runnable live demo, and merged open-source code contributions.',
  },
];

export function FAQAccordion() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ f1: true, f3: true });

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'general', label: 'General & Access' },
    { id: 'curriculum', label: 'Curriculum & Tooling' },
    { id: 'career', label: 'Careers & Portfolio' },
    { id: 'opensource', label: 'Open Source' },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      search === '' ||
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleFAQ = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    filteredFaqs.forEach((f) => (all[f.id] = true));
    setOpenIds(all);
  };

  const collapseAll = () => {
    setOpenIds({});
  };

  return (
    <section className="section" id="faq">
      <div className="section-heading">
        <div>
          <span className="kicker">FREQUENTLY ASKED</span>
          <h2>Essential Guidance</h2>
        </div>
        <p>
          Answers to common questions regarding learning paths, prerequisites, open-source
          collaboration, and maximizing career outcomes.
        </p>
      </div>

      {/* Category Pills & Search */}
      <div className="faq-controls">
        <div className="faq-cat-tabs" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={selectedCategory === cat.id}
              className={`faq-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="faq-actions-bar">
          <div className="faq-search-box">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              aria-label="Search FAQ"
            />
          </div>
          <div className="faq-toggle-buttons">
            <button onClick={expandAll} className="faq-toggle-btn">Expand All</button>
            <span className="divider">/</span>
            <button onClick={collapseAll} className="faq-toggle-btn">Collapse All</button>
          </div>
        </div>
      </div>

      {/* Accordion List */}
      <div className="faq-accordion-list">
        {filteredFaqs.map((faq) => {
          const isOpen = !!openIds[faq.id];
          return (
            <div key={faq.id} className={`faq-card ${isOpen ? 'open' : ''}`}>
              <button
                className="faq-question-btn"
                onClick={() => toggleFAQ(faq.id)}
                aria-expanded={isOpen}
              >
                <span className="faq-q-text">{faq.q}</span>
                <span className={`faq-icon-arrow ${isOpen ? 'rotated' : ''}`}>
                  <ChevronDown size={18} />
                </span>
              </button>
              {isOpen && (
                <div className="faq-answer-panel">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="empty-faq">
            <HelpCircle size={24} />
            <p>No questions matched your search query.</p>
          </div>
        )}
      </div>
    </section>
  );
}
