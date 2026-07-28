import { z } from 'zod';

const runtimeId = z.enum(['javascript+node', 'python']);

const challengeCheck = z.object({
  name: z.string().min(1),
  stdin: z.string(),
  expectedOutput: z.string(),
});

export const challengeSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(['beginner', 'intermediate']),
  runtimeId,
  instructions: z.array(z.string().min(1)).min(1),
  starter: z.object({
    files: z.record(z.string(), z.string()),
    entry: z.string().min(1),
  }),
  hints: z.array(z.string().min(1)).min(1),
  checks: z.array(challengeCheck).min(1),
  solution: z.string().min(1),
});

export type Challenge = z.infer<typeof challengeSchema>;

export const challenges = challengeSchema.array().parse([
  {
    id: 'javascript-total-expenses',
    title: 'Total your expenses',
    description:
      'Read one amount per line and print the total to two decimals.',
    difficulty: 'beginner',
    runtimeId: 'javascript+node',
    instructions: [
      'Read newline-separated amounts from standard input.',
      'Print their total using exactly two decimal places.',
    ],
    starter: {
      files: {
        'index.js':
          "const input = require('fs').readFileSync(0, 'utf8');\n\n// Write your solution here.\n",
      },
      entry: 'index.js',
    },
    hints: [
      'Split the input on whitespace.',
      'Use Number() before adding values.',
    ],
    checks: [
      { name: 'two expenses', stdin: '12.50\n7.25', expectedOutput: '19.75\n' },
      { name: 'whole numbers', stdin: '5\n15\n20', expectedOutput: '40.00\n' },
    ],
    solution:
      "const values = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).filter(Boolean).map(Number);\nconsole.log(values.reduce((total, value) => total + value, 0).toFixed(2));",
  },
  {
    id: 'javascript-word-count',
    title: 'Count the words',
    description: 'Print how many words appear in a piece of text.',
    difficulty: 'beginner',
    runtimeId: 'javascript+node',
    instructions: [
      'Read text from standard input.',
      'Treat consecutive whitespace as one separator.',
    ],
    starter: {
      files: {
        'index.js':
          "const input = require('fs').readFileSync(0, 'utf8');\n\n// Write your solution here.\n",
      },
      entry: 'index.js',
    },
    hints: [
      'Trim surrounding whitespace first.',
      'A regular expression can split whitespace.',
    ],
    checks: [
      {
        name: 'extra spaces',
        stdin: '  learn   every day  ',
        expectedOutput: '3\n',
      },
    ],
    solution:
      "const text = require('fs').readFileSync(0, 'utf8').trim();\nconsole.log(text ? text.split(/\\s+/).length : 0);",
  },
  {
    id: 'javascript-email-summary',
    title: 'Summarise email domains',
    description: 'Count how many addresses belong to each email domain.',
    difficulty: 'intermediate',
    runtimeId: 'javascript+node',
    instructions: [
      'Read one email address per line.',
      'Print domain counts alphabetically as domain: count.',
    ],
    starter: {
      files: {
        'index.js':
          "const input = require('fs').readFileSync(0, 'utf8');\n\n// Write your solution here.\n",
      },
      entry: 'index.js',
    },
    hints: [
      'Split each address at @.',
      'Object.entries() can be sorted by domain.',
    ],
    checks: [
      {
        name: 'mixed domains',
        stdin: 'a@example.com\nb@test.com\nc@example.com',
        expectedOutput: 'example.com: 2\ntest.com: 1\n',
      },
    ],
    solution:
      "const counts = {};\nfor (const email of require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).filter(Boolean)) { const domain = email.split('@')[1]; counts[domain] = (counts[domain] || 0) + 1; }\nfor (const [domain, count] of Object.entries(counts).sort()) console.log(domain + ': ' + count);",
  },
  {
    id: 'javascript-unique-tasks',
    title: 'Remove duplicate tasks',
    description:
      'Keep the first appearance of each task and print the cleaned list.',
    difficulty: 'beginner',
    runtimeId: 'javascript+node',
    instructions: [
      'Read one task per line.',
      'Keep original order while removing duplicate lines.',
    ],
    starter: {
      files: {
        'index.js':
          "const input = require('fs').readFileSync(0, 'utf8');\n\n// Write your solution here.\n",
      },
      entry: 'index.js',
    },
    hints: [
      'A Set remembers seen task names.',
      'Push a task only the first time it appears.',
    ],
    checks: [
      {
        name: 'duplicate tasks',
        stdin: 'water plants\nemail team\nwater plants',
        expectedOutput: 'water plants\nemail team\n',
      },
    ],
    solution:
      "const seen = new Set();\nfor (const task of require('fs').readFileSync(0, 'utf8').trim().split('\\n').filter(Boolean)) if (!seen.has(task)) { seen.add(task); console.log(task); }",
  },
  {
    id: 'javascript-temperature-converter',
    title: 'Convert temperatures',
    description:
      'Convert Celsius readings to Fahrenheit for a quick weather note.',
    difficulty: 'beginner',
    runtimeId: 'javascript+node',
    instructions: [
      'Read Celsius values, one per line.',
      'Print Fahrenheit values with one decimal place.',
    ],
    starter: {
      files: {
        'index.js':
          "const input = require('fs').readFileSync(0, 'utf8');\n\n// Write your solution here.\n",
      },
      entry: 'index.js',
    },
    hints: ['Use F = C * 9 / 5 + 32.', 'toFixed(1) formats one decimal place.'],
    checks: [
      {
        name: 'freezing and boiling',
        stdin: '0\n100',
        expectedOutput: '32.0\n212.0\n',
      },
    ],
    solution:
      "for (const value of require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).filter(Boolean)) console.log((Number(value) * 9 / 5 + 32).toFixed(1));",
  },
  {
    id: 'python-total-expenses',
    title: 'Total your expenses',
    description:
      'Read one amount per line and print the total to two decimals.',
    difficulty: 'beginner',
    runtimeId: 'python',
    instructions: [
      'Read newline-separated amounts from standard input.',
      'Print their total using exactly two decimal places.',
    ],
    starter: {
      files: { 'main.py': 'import sys\n\n# Write your solution here.\n' },
      entry: 'main.py',
    },
    hints: ['Use sys.stdin.read().split().', 'Format the total with :.2f.'],
    checks: [
      { name: 'two expenses', stdin: '12.50\n7.25', expectedOutput: '19.75\n' },
    ],
    solution:
      "import sys\nvalues = [float(value) for value in sys.stdin.read().split()]\nprint(f'{sum(values):.2f}')",
  },
  {
    id: 'python-word-count',
    title: 'Count the words',
    description: 'Print how many words appear in a piece of text.',
    difficulty: 'beginner',
    runtimeId: 'python',
    instructions: [
      'Read text from standard input.',
      'Treat consecutive whitespace as one separator.',
    ],
    starter: {
      files: { 'main.py': 'import sys\n\n# Write your solution here.\n' },
      entry: 'main.py',
    },
    hints: [
      'str.split() handles repeated whitespace.',
      'Use len() to count the result.',
    ],
    checks: [
      {
        name: 'extra spaces',
        stdin: '  learn   every day  ',
        expectedOutput: '3\n',
      },
    ],
    solution: 'import sys\nprint(len(sys.stdin.read().split()))',
  },
  {
    id: 'python-shopping-list',
    title: 'Sort a shopping list',
    description: 'Clean and sort a list of grocery items.',
    difficulty: 'beginner',
    runtimeId: 'python',
    instructions: [
      'Read one item per line.',
      'Remove blank lines and print items alphabetically.',
    ],
    starter: {
      files: { 'main.py': 'import sys\n\n# Write your solution here.\n' },
      entry: 'main.py',
    },
    hints: [
      'Strip each line before testing it.',
      'sorted() returns a new ordered list.',
    ],
    checks: [
      {
        name: 'mixed order',
        stdin: 'bananas\n\napples\ncarrots',
        expectedOutput: 'apples\nbananas\ncarrots\n',
      },
    ],
    solution:
      "import sys\nitems = sorted(line.strip() for line in sys.stdin if line.strip())\nprint('\\n'.join(items))",
  },
  {
    id: 'python-bill-splitter',
    title: 'Split a bill',
    description: 'Calculate how much each person should pay, including a tip.',
    difficulty: 'intermediate',
    runtimeId: 'python',
    instructions: [
      'Read bill amount, tip percent, and people count on separate lines.',
      'Print each person’s share to two decimals.',
    ],
    starter: {
      files: { 'main.py': 'import sys\n\n# Write your solution here.\n' },
      entry: 'main.py',
    },
    hints: [
      'Convert the percentage by dividing by 100.',
      'Divide the tipped total by the number of people.',
    ],
    checks: [
      {
        name: 'weekend dinner',
        stdin: '100\n15\n4',
        expectedOutput: '28.75\n',
      },
    ],
    solution:
      "import sys\nbill, tip, people = map(float, sys.stdin.read().split())\nprint(f'{bill * (1 + tip / 100) / people:.2f}')",
  },
  {
    id: 'python-daily-steps',
    title: 'Find the best step day',
    description: 'Find the highest step count from a week of daily readings.',
    difficulty: 'beginner',
    runtimeId: 'python',
    instructions: ['Read one step count per line.', 'Print the largest count.'],
    starter: {
      files: { 'main.py': 'import sys\n\n# Write your solution here.\n' },
      entry: 'main.py',
    },
    hints: [
      'Convert each input to an integer.',
      'max() finds the largest value.',
    ],
    checks: [
      {
        name: 'weekly readings',
        stdin: '4200\n8100\n6750',
        expectedOutput: '8100\n',
      },
    ],
    solution: 'import sys\nprint(max(map(int, sys.stdin.read().split())))',
  },
]);

/**
 * Produces a calendar key using the visitor's local date instead of UTC. This
 * keeps “today's challenge” aligned with the date shown on their device.
 */
export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** A small stable hash for mapping a date key into the current catalog. */
export function hashChallengeDate(dateKey: string) {
  let hash = 0;
  for (const character of dateKey) {
    hash = (hash << 5) - hash + character.charCodeAt(0);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDailyChallenge(date = new Date()) {
  if (challenges.length === 0)
    throw new Error('The challenge catalog is empty.');
  return challenges[
    hashChallengeDate(getLocalDateKey(date)) % challenges.length
  ]!;
}

export function getChallenge(id: string | null) {
  return challenges.find((challenge) => challenge.id === id);
}
