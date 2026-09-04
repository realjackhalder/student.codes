import { ArrowRight, BrainCircuit, Code2, Cpu, Github, Menu, Sparkles } from 'lucide-react';
import { Logo } from '../components/logo';
import { ResourceExplorer } from '../components/resource-explorer';

const paths = [
  { icon: Code2, label: 'Code', title: 'Think in code. Build for real.', text: 'Go from your first line to complete projects with clear paths for web, apps, Python, and more.', tags: ['Web development', 'Python', 'Git & GitHub'], className: 'green' },
  { icon: Cpu, label: 'ICT', title: 'Understand the systems around you.', text: 'Learn how computers, networks, cloud services, data, and cybersecurity work together.', tags: ['Networking', 'Cybersecurity', 'Cloud'], className: 'blue' },
  { icon: BrainCircuit, label: 'AI', title: 'Learn and build with intelligence.', text: 'Explore AI foundations, prompting, models, responsible use, and hands-on project ideas.', tags: ['AI foundations', 'Prompting', 'Open source'], className: 'purple' },
];

const steps = [
  ['01', 'Explore', 'Choose a topic based on what you want to understand or create.'],
  ['02', 'Learn', 'Follow a focused path with practical resources and simple explanations.'],
  ['03', 'Build', 'Turn knowledge into a project you can share in your portfolio.'],
];

export default function Home() {
  return <>
    <header className="site-header"><Logo /><nav><a href="#paths">Paths</a><a href="#resources">Resources</a><a href="#roadmap">How it works</a><a href="#community">Community</a></nav><div className="header-actions"><a className="icon-link" href="https://github.com/realjackhalder/student.codes" aria-label="GitHub"><Github size={18} /></a><a href="#resources" className="button small">Start exploring <ArrowRight size={15} /></a><button className="menu" aria-label="Open menu"><Menu /></button></div></header>

    <main>
      <section className="hero"><div className="hero-grid" /><div className="orb orb-one" /><div className="orb orb-two" /><div className="eyebrow"><Sparkles size={14} /> The student guide to tomorrow&apos;s skills</div><h1>Learn technology.<br /><em>Build your future.</em></h1><p className="hero-copy">A clear place for students to discover coding, ICT, and artificial intelligence—then turn what they learn into real projects.</p><div className="hero-actions"><a href="#paths" className="button">Explore learning paths <ArrowRight size={17} /></a><a href="#resources" className="text-link">Browse all resources <ArrowRight size={16} /></a></div><div className="topic-strip"><span>START WITH</span><a href="#code"><Code2 size={16} /> Coding</a><a href="#ict"><Cpu size={16} /> ICT</a><a href="#ai"><BrainCircuit size={16} /> Artificial Intelligence</a></div></section>

      <section className="section" id="paths"><div className="section-heading"><div><span className="kicker">LEARNING PATHS</span><h2>Choose where you want to grow.</h2></div><p>Focused topics, useful resources, and project ideas—organized to help you move forward without the noise.</p></div><div className="path-grid">{paths.map((path, index) => { const Icon=path.icon; return <article className={`path-card ${path.className}`} id={index === 0 ? 'code' : index === 1 ? 'ict' : 'ai'} key={path.label}><div className="path-top"><span className="path-icon"><Icon /></span><span className="path-number">0{index + 1}</span></div><span className="path-label">{path.label}</span><h3>{path.title}</h3><p>{path.text}</p><div className="tags">{path.tags.map(tag => <span key={tag}>{tag}</span>)}</div><a href="#resources">Explore {path.label} <ArrowRight size={16} /></a></article>; })}</div></section>

      <ResourceExplorer />

      <section className="section roadmap" id="roadmap"><div className="roadmap-intro"><span className="kicker">YOUR ROADMAP</span><h2>From curious<br />to capable.</h2><p>You do not need to know everything. You just need a useful next step.</p><a href="#resources" className="button dark">Find your next step <ArrowRight size={16} /></a></div><div className="steps">{steps.map(([n,title,text]) => <div className="step" key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></section>

      <section className="community" id="community"><div><span className="kicker light">OPEN TO EVERY STUDENT</span><h2>Learn in public.<br />Grow together.</h2><p>like student is becoming an open, student-led knowledge hub. Suggest a resource, share a project, or help make a learning path better.</p><a href="https://github.com/realjackhalder/student.codes" className="button light-button"><Github size={17} /> Join on GitHub</a></div><div className="community-code"><div className="code-dots"><i /><i /><i /><span>community.ts</span></div><pre><b>const</b> student = {'{'}{`\n`}  curious: <i>true</i>,{`\n`}  learning: <i>true</i>,{`\n`}  future: <strong>&quot;being built&quot;</strong>{`\n`}{'}'};</pre></div></section>
    </main>

    <footer><Logo /><p>Code, ICT, and AI learning for every curious student.</p><div><a href="#paths">Paths</a><a href="#resources">Resources</a><a href="https://github.com/realjackhalder/student.codes">GitHub</a></div><small>© {new Date().getFullYear()} like student</small></footer>
  </>;
}
