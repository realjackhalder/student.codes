'use client';

import { useState } from 'react';
import { Github, Terminal, Copy, Check, GitPullRequest, Users, Sparkles, ArrowRight } from 'lucide-react';

export function CommunityTerminal() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <section className="community-wrapper" id="community">
      <div className="community">
        <div className="community-copy">
          <span className="kicker light">PUBLIC INFRASTRUCTURE</span>
          <h2>Learn in public.<br />Build for real.</h2>
          <p>
            Student + Codes is developed openly by students across the world. Submit a pull request,
            propose an architecture blueprint, or improve an explainer for the next generation of builders.
          </p>

          <div className="community-actions">
            <a
              href="https://github.com/realjackhalder/student.codes"
              target="_blank"
              rel="noopener noreferrer"
              className="button light-button"
            >
              <Github size={18} /> Join on GitHub
            </a>
            <a
              href="https://github.com/realjackhalder/student.codes/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="button outline-dark"
            >
              <GitPullRequest size={16} /> Contribute a Guide
            </a>
          </div>
        </div>

        {/* Live Terminal Widget */}
        <div className="community-code">
          <div className="code-dots">
            <i />
            <i />
            <i />
            <span className="terminal-title">
              <Terminal size={12} /> bash — quickstart
            </span>
          </div>

          <div className="terminal-commands">
            <div className="terminal-cmd-row">
              <span className="terminal-prompt">$</span>
              <span className="terminal-text">git clone https://github.com/realjackhalder/student.codes</span>
              <button
                className="term-copy-btn"
                onClick={() => copyToClipboard('git clone https://github.com/realjackhalder/student.codes')}
                aria-label="Copy clone command"
              >
                {copiedCmd === 'git clone https://github.com/realjackhalder/student.codes' ? (
                  <Check size={14} className="copied" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>

            <div className="terminal-cmd-row">
              <span className="terminal-prompt">$</span>
              <span className="terminal-text">cd student.codes &amp;&amp; npm install</span>
              <button
                className="term-copy-btn"
                onClick={() => copyToClipboard('cd student.codes && npm install')}
                aria-label="Copy install command"
              >
                {copiedCmd === 'cd student.codes && npm install' ? (
                  <Check size={14} className="copied" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>

            <div className="terminal-cmd-row">
              <span className="terminal-prompt">$</span>
              <span className="terminal-text">npm run dev -- -p 3004</span>
              <button
                className="term-copy-btn"
                onClick={() => copyToClipboard('npm run dev -- -p 3004')}
                aria-label="Copy run command"
              >
                {copiedCmd === 'npm run dev -- -p 3004' ? (
                  <Check size={14} className="copied" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>

            <div className="terminal-log-output">
              <span className="log-line-success">✓ Local server ready at http://localhost:3004</span>
              <span className="log-line-info">ℹ Ready for student contributions &amp; local experimentation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
