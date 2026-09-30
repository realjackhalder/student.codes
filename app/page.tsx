import { ArrowRight, ArrowUpRight, Sparkles, Terminal } from 'lucide-react';
import { Header } from '../components/header';
import { MetricsTicker } from '../components/metrics-ticker';
import { TrackSelector } from '../components/track-selector';
import { CodePlayground } from '../components/code-playground';
import { ProjectBlueprints } from '../components/project-blueprints';
import { ResourceExplorer } from '../components/resource-explorer';
import { RoadmapStepper } from '../components/roadmap-stepper';
import { FAQAccordion } from '../components/faq-accordion';
import { CommunityTerminal } from '../components/community-terminal';
import { Logo } from '../components/logo';

export default function Home() {
  return (
    <>
      <Header />

      <main id="main-content">
        {/* Hero Section — Monumental NDS Typography */}
        <section className="hero">
          <div className="eyebrow">
            <span className="eyebrow-pill">2026 PLATFORM</span>
            <Sparkles size={14} />
            <span>The Open Technology Guide for Tomorrow&apos;s Engineers</span>
          </div>

          <h1 className="hero-heading">
            Learn technology.<br />
            <em>Build your future.</em>
          </h1>

          <p className="hero-copy">
            A free, uncompromised curriculum for ambitious students to master artificial intelligence,
            modern full-stack systems, cloud infrastructure, and cybersecurity defense.
          </p>

          <div className="hero-actions">
            <a href="#tracks" className="button accent">
              Explore Learning Tracks <ArrowRight size={16} />
            </a>
            <a href="#playground" className="button outline">
              Launch Code Lab <Terminal size={15} />
            </a>
          </div>

          <div className="topic-strip" aria-label="Core disciplines">
            <span className="topic-strip-label">CORE DISCIPLINES</span>
            <a href="#tracks">Autonomous AI</a>
            <a href="#tracks">Full-Stack Craft</a>
            <a href="#tracks">Distributed Systems</a>
            <a href="#tracks">Cyber Defense</a>
            <a href="#blueprints">Blueprints</a>
          </div>
        </section>

        {/* High-Impact Metrics Ticker */}
        <MetricsTicker />

        {/* Philosophy Statement Section */}
        <section className="statement-section" aria-label="Core philosophy">
          <div className="statement-inner">
            <span className="kicker">THE PRINCIPLE</span>
            <blockquote className="statement-text">
              &ldquo;Every expert was once a beginner. The only difference is they started—and refused to stop.&rdquo;
            </blockquote>
            <p className="statement-sub">
              Engineered on the conviction that high-quality, production-grade technical education
              must remain completely open, free, and accessible to every curious student on Earth.
            </p>
          </div>
        </section>

        {/* 1. Interactive 4-Track Curriculum Selector */}
        <TrackSelector />

        {/* 2. Interactive Terminal & Code Playground */}
        <CodePlayground />

        {/* 3. Portfolio Project Blueprints Showcase */}
        <ProjectBlueprints />

        {/* 4. Curated 2026 Resource Library (Cream Contrast Section) */}
        <ResourceExplorer />

        {/* 5. Progressive 4-Phase Roadmap with Interactive Checklists */}
        <RoadmapStepper />

        {/* 6. Categorized Interactive FAQ */}
        <FAQAccordion />

        {/* 7. Open-Source Community Terminal */}
        <CommunityTerminal />
      </main>

      {/* Official Government / Federal Style Footer */}
      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p className="footer-tagline">
              Autonomous AI, Full-Stack Craft, Cloud Infrastructure, and Cyber Defense engineered for every curious student.
            </p>
            <div className="footer-status-pill">
              <span className="pulse-dot"></span> All 4 Tracks Active &amp; Up to Date (2026)
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <span className="footer-heading">Disciplines</span>
              <a href="#tracks">Autonomous AI</a>
              <a href="#tracks">Full-Stack &amp; React 19</a>
              <a href="#tracks">Cloud &amp; Rust Systems</a>
              <a href="#tracks">Cyber Defense</a>
            </div>
            <div className="footer-col">
              <span className="footer-heading">Tooling</span>
              <a href="#playground">Code Lab &amp; REPL</a>
              <a href="#blueprints">Project Blueprints</a>
              <a href="#resources">Resource Library</a>
              <a href="#roadmap">Milestone Tracker</a>
            </div>
            <div className="footer-col">
              <span className="footer-heading">Governance</span>
              <a href="https://github.com/realjackhalder/student.codes" target="_blank" rel="noopener noreferrer">
                GitHub Repository
              </a>
              <a href="https://github.com/realjackhalder/student.codes/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
                MIT License
              </a>
              <a href="#faq">Frequently Asked</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <small>© {new Date().getFullYear()} Student + Codes. An open public initiative for computing education.</small>
          <span className="footer-credit">Engineered with care · Free forever</span>
        </div>
      </footer>
    </>
  );
}
