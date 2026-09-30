'use client';

import { useState } from 'react';
import { Play, Copy, Check, Terminal, RotateCcw, Sparkles } from 'lucide-react';

type Snippet = {
  id: string;
  lang: string;
  label: string;
  filename: string;
  code: string;
  output: string[];
};

const snippets: Snippet[] = [
  {
    id: 'ai-agent',
    lang: 'python',
    label: 'AI Agent (MCP Tool)',
    filename: 'agent_evaluator.py',
    code: `import asyncio
from agentic import ToolAgent, Context

async def verify_code(agent: ToolAgent):
    print("▶ Initializing Model Context Protocol (MCP)...")
    context = Context(model="claude-3-7-sonnet", temperature=0.2)
    
    # Register deterministic tools
    agent.register_tool(name="run_sandbox_tests")
    agent.register_tool(name="security_audit_ast")
    
    print("✓ Model connected. Reasoning through prompt constraints...")
    result = await agent.solve(
        task="Audit student API gateway for rate-limiting vulnerabilities",
        context=context
    )
    return result

asyncio.run(verify_code(ToolAgent()))`,
    output: [
      '[SYSTEM] Loading agentic runtime v2.4...',
      '▶ Initializing Model Context Protocol (MCP)...',
      '✓ Registered tool: run_sandbox_tests',
      '✓ Registered tool: security_audit_ast',
      '✓ Model connected. Reasoning through prompt constraints...',
      '▶ [THINKING] Inspecting token bucket implementation in src/gateway.ts',
      '▶ [ACTION] Calling tool "security_audit_ast" with path="src/gateway.ts"',
      '✓ [RESULT] 0 critical vulnerabilities found. 1 advisory: add Redis cluster fallback.',
      '✓ Process completed in 340ms with exit code 0.'
    ],
  },
  {
    id: 'nextjs',
    lang: 'typescript',
    label: 'React 19 / Server Action',
    filename: 'submit-project.ts',
    code: `'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const ProjectSchema = z.object({
  title: z.string().min(3).max(64),
  githubUrl: z.string().url().regex(/^https:\\/\\/github\\.com\\//),
  track: z.enum(['ai', 'web', 'systems', 'security']),
});

export async function submitStudentProject(formData: FormData) {
  const parsed = ProjectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const submission = await db.project.create({
    data: { ...parsed.data, verified: false }
  });

  revalidatePath('/blueprints');
  return { success: true, id: submission.id };
}`,
    output: [
      '[TSC] Validating TypeScript strict types...',
      '✓ Type check passed in 112ms (zero errors)',
      '▶ Invoking Server Action "submitStudentProject"...',
      '✓ FormData schema parsed successfully with Zod',
      '✓ Database transaction committed (id: "proj_9082af1c")',
      '✓ Cache revalidated for route "/blueprints"',
      '✓ Response returned: { success: true, id: "proj_9082af1c" }'
    ],
  },
  {
    id: 'systems',
    lang: 'bash',
    label: 'Systems & Docker',
    filename: 'health_check.sh',
    code: `#!/usr/bin/env bash
set -euo pipefail

echo "==> Verifying Student Container Environment <=="
uname -srm
docker --version

echo "==> Inspecting cgroup memory constraints..."
cat /sys/fs/cgroup/memory.max 2>/dev/null || echo "4GB Allocated"

echo "==> Testing Raft cluster peers connectivity..."
curl -s -f http://127.0.0.1:8080/healthz | jq .status

echo "✓ All systems operational."`,
    output: [
      '==> Verifying Student Container Environment <==',
      'Linux 6.8.0-40-generic x86_64',
      'Docker version 27.1.1, build 6312585',
      '==> Inspecting cgroup memory constraints...',
      '4294967296 (4.00 GiB)',
      '==> Testing Raft cluster peers connectivity...',
      '"HEALTHY_LEADER_ELECTED"',
      '✓ All systems operational.'
    ],
  },
];

export function CodePlayground() {
  const [selectedSnippetId, setSelectedSnippetId] = useState('ai-agent');
  const [isRunning, setIsRunning] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const snippet = snippets.find((s) => s.id === selectedSnippetId) || snippets[0];

  const handleRun = () => {
    setIsRunning(true);
    setConsoleLogs([]);
    
    snippet.output.forEach((line, index) => {
      setTimeout(() => {
        setConsoleLogs((prev) => [...prev, line]);
        if (index === snippet.output.length - 1) {
          setIsRunning(false);
        }
      }, (index + 1) * 120);
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="section" id="playground">
      <div className="section-heading">
        <div>
          <span className="kicker">INTERACTIVE SANDBOX</span>
          <h2>The Terminal &amp; Code Lab</h2>
        </div>
        <p>
          Experience real, runnable code samples across modern stacks. Select a scenario below,
          review the syntax, and execute it live in the simulated runtime.
        </p>
      </div>

      <div className="playground-window">
        {/* Playground Top Bar */}
        <div className="playground-topbar">
          <div className="window-dots">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>

          <div className="playground-tabs" role="tablist">
            {snippets.map((s) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={s.id === selectedSnippetId}
                className={`playground-tab ${s.id === selectedSnippetId ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSnippetId(s.id);
                  setConsoleLogs([]);
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="playground-actions">
            <button
              className="copy-btn"
              onClick={handleCopy}
              aria-label="Copy code to clipboard"
            >
              {copied ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              className="run-btn"
              onClick={handleRun}
              disabled={isRunning}
              aria-label="Run snippet"
            >
              {isRunning ? <RotateCcw size={14} className="spinning" /> : <Play size={14} />}
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>
          </div>
        </div>

        {/* Code Body & Live Console Grid */}
        <div className="playground-body-grid">
          {/* Code Editor Pane */}
          <div className="code-pane">
            <div className="code-pane-header">
              <span className="file-name">{snippet.filename}</span>
              <span className="lang-badge">{snippet.lang.toUpperCase()}</span>
            </div>
            <pre className="code-display">
              <code>{snippet.code}</code>
            </pre>
          </div>

          {/* Execution Console Pane */}
          <div className="console-pane">
            <div className="console-header">
              <div className="console-title">
                <Terminal size={14} />
                <span>Simulated Output Console</span>
              </div>
              {isRunning && <span className="status-live">Executing...</span>}
            </div>

            <div className="console-output">
              {consoleLogs.length === 0 && !isRunning ? (
                <div className="console-placeholder">
                  <Sparkles size={20} className="pulse-icon" />
                  <p>Click &ldquo;Run Code&rdquo; above to execute this code block in the simulated sandbox environment.</p>
                </div>
              ) : (
                <div className="console-lines">
                  {consoleLogs.map((log, i) => (
                    <div key={i} className={`console-line ${log.startsWith('✓') ? 'success' : log.startsWith('▶') ? 'info' : ''}`}>
                      {log}
                    </div>
                  ))}
                  {isRunning && <span className="console-cursor">█</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
