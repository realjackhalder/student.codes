'use client';

import { ArrowRight, Github, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Logo } from './logo';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Official Top Banner */}
      <div className="gov-banner" role="region" aria-label="Official platform statement">
        <div className="gov-banner-content">
          <span className="gov-badge">OPEN INITIATIVE</span>
          <span className="gov-text">The official student technology &amp; computing curriculum · Updated for 2026</span>
          <span className="gov-status">
            <span className="pulse-dot"></span> System Live
          </span>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="site-header">
        <Logo />
        <nav className="nav-links" aria-label="Main Navigation">
          <a href="#tracks">Tracks</a>
          <a href="#playground">Playground</a>
          <a href="#blueprints">Blueprints</a>
          <a href="#resources">Library</a>
          <a href="#roadmap">Milestones</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="header-actions">
          <a
            className="icon-link"
            href="https://github.com/realjackhalder/student.codes"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
          >
            <Github size={18} />
          </a>
          <a href="#tracks" className="button small accent">
            Start Learning <ArrowRight size={14} />
          </a>
          <button
            className="menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer" role="dialog" aria-modal="true">
            <nav className="mobile-nav-links">
              <a href="#tracks" onClick={() => setMobileMenuOpen(false)}>Learning Tracks</a>
              <a href="#playground" onClick={() => setMobileMenuOpen(false)}>Interactive Playground</a>
              <a href="#blueprints" onClick={() => setMobileMenuOpen(false)}>Project Blueprints</a>
              <a href="#resources" onClick={() => setMobileMenuOpen(false)}>Resource Library</a>
              <a href="#roadmap" onClick={() => setMobileMenuOpen(false)}>Curriculum Milestones</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)}>Frequently Asked</a>
              <a
                href="https://github.com/realjackhalder/student.codes"
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-github-link"
              >
                <Github size={18} /> View on GitHub
              </a>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
