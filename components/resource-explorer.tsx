'use client';

import { ArrowUpRight, BookOpen, Boxes, FileText, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

const resources = [
  { type: 'Guide', area: 'Code', title: 'Web Development Foundations', text: 'HTML, CSS, JavaScript, and the core ideas behind modern websites.', level: 'Beginner', icon: BookOpen },
  { type: 'Roadmap', area: 'ICT', title: 'How Computer Networks Work', text: 'A practical path through IP addresses, routing, DNS, and the web.', level: 'Beginner', icon: Boxes },
  { type: 'Explainer', area: 'AI', title: 'AI Models, Clearly Explained', text: 'Understand training, inference, tokens, context, and limitations.', level: 'Beginner', icon: FileText },
  { type: 'Project', area: 'Code', title: 'Build Your First Portfolio', text: 'Create and publish a personal site that shows what you can do.', level: 'Intermediate', icon: Boxes },
  { type: 'Guide', area: 'ICT', title: 'Cybersecurity Essentials', text: 'Learn threats, safer habits, authentication, and basic defense.', level: 'Beginner', icon: BookOpen },
  { type: 'Project', area: 'AI', title: 'Design a Useful AI Assistant', text: 'Plan prompts, test outputs, and build a responsible AI workflow.', level: 'Intermediate', icon: Boxes },
];

export function ResourceExplorer() {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const visible = useMemo(() => resources.filter(r => (filter === 'All' || r.area === filter) && `${r.title} ${r.text} ${r.type}`.toLowerCase().includes(query.toLowerCase())), [filter, query]);
  return <section className="resource-section" id="resources"><div className="section resource-inner"><div className="section-heading resource-heading"><div><span className="kicker">RESOURCE LIBRARY</span><h2>Find your next useful thing.</h2></div><label className="search"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search resources" aria-label="Search resources" /></label></div><div className="filters">{['All','Code','ICT','AI'].map(item => <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><div className="resource-grid">{visible.map(r => { const Icon=r.icon; return <article className="resource-card" key={r.title}><div className="resource-meta"><span className={`area ${r.area.toLowerCase()}`}>{r.area}</span><span>{r.type}</span></div><span className="resource-icon"><Icon /></span><h3>{r.title}</h3><p>{r.text}</p><div className="resource-foot"><span>{r.level}</span><button aria-label={`Open ${r.title}`}><ArrowUpRight size={17} /></button></div></article>; })}</div>{visible.length === 0 && <p className="empty">No matching resources yet. Try another search.</p>}</div></section>;
}
