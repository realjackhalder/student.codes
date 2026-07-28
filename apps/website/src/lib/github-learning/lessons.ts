import { courseGitRepository, parallelGitRepository } from './fixtures';
import { type Course, courseSchema } from './schemas';
import { GitSimulator } from './simulator';

export type CourseTranslator = (
  strings: TemplateStringsArray,
  ...placeholders: unknown[]
) => string;

export function getGithubCourse(say: CourseTranslator): Course {
  const stagingRepository = new GitSimulator(courseGitRepository).writeFile(
    'notes.md',
    '# Git notes\n',
  ).state;
  const stagedResult = new GitSimulator(stagingRepository).run(
    'git add notes.md',
  );
  if (!stagedResult.ok) throw new Error(stagedResult.error.message);
  const featureResult = new GitSimulator(courseGitRepository).run(
    'git switch -c feature',
  );
  if (!featureResult.ok) throw new Error(featureResult.error.message);
  const featureStagedResult = new GitSimulator(featureResult.state)
    .writeFile('src/feature.ts', 'export const feature = true;\n')
    .run('git add src/feature.ts');
  if (!featureStagedResult.ok)
    throw new Error(featureStagedResult.error.message);
  const featureCommitResult = new GitSimulator(featureStagedResult.state).run(
    'git commit -m "Start feature"',
  );
  if (!featureCommitResult.ok)
    throw new Error(featureCommitResult.error.message);
  const switchLessonResult = new GitSimulator(featureCommitResult.state).run(
    'git switch main',
  );
  if (!switchLessonResult.ok) throw new Error(switchLessonResult.error.message);
  const submissionSwitchResult = new GitSimulator(courseGitRepository).run(
    'git switch -c feature/github-submit',
  );
  if (!submissionSwitchResult.ok)
    throw new Error(submissionSwitchResult.error.message);
  const submissionRepository = new GitSimulator(
    submissionSwitchResult.state,
  ).writeFile(
    'src/greeting.ts',
    'export const greeting = "Hello, GitHub!";\n',
  ).state;
  const pullRepository = {
    ...courseGitRepository,
    branches: {
      ...courseGitRepository.branches,
      main: {
        name: 'main',
        target: 'b2c3d4e',
      },
    },
  };
  const profileSwitchResult = new GitSimulator(parallelGitRepository).run(
    'git switch feature/profile',
  );
  if (!profileSwitchResult.ok)
    throw new Error(profileSwitchResult.error.message);
  const profileStagedResult = new GitSimulator(profileSwitchResult.state)
    .writeFile('src/profile.test.ts', 'export const profileTest = true;\n')
    .run('git add src/profile.test.ts');
  if (!profileStagedResult.ok)
    throw new Error(profileStagedResult.error.message);
  const hotfixSwitchResult = new GitSimulator(parallelGitRepository).run(
    'git switch fix/login',
  );
  if (!hotfixSwitchResult.ok) throw new Error(hotfixSwitchResult.error.message);
  const hotfixStagedResult = new GitSimulator(hotfixSwitchResult.state)
    .writeFile('src/login.test.ts', 'export const loginTest = true;\n')
    .run('git add src/login.test.ts');
  if (!hotfixStagedResult.ok) throw new Error(hotfixStagedResult.error.message);

  return courseSchema.parse({
    version: 1,
    id: 'git-github',
    title: say`Git & GitHub`,
    description: say`Learn Git fundamentals, visual branching, practical GitHub collaboration, and safe publishing through Development, UAT, and Production.`,
    estimatedMinutes: 186,
    modules: [
      {
        id: 'git-foundations',
        title: say`Git foundations`,
        description: say`Understand repositories, changes, staging, commits, and history.`,
        lessons: [
          {
            id: 'how-git-thinks',
            title: say`How Git thinks`,
            objective: say`Understand snapshots, repositories, and the three places where your work can live.`,
            estimatedMinutes: 8,
            content: [
              {
                type: 'text',
                body: say`Git records snapshots of a project. Your working tree contains current files, the staging area selects the next snapshot, and commits preserve completed snapshots in history.`,
              },
              {
                type: 'command',
                command: 'git status',
                explanation: say`Ask Git where your files are in the working tree and staging workflow.`,
              },
              {
                type: 'callout',
                tone: 'tip',
                body: say`Think of Git as a timeline you intentionally build, not as an automatic backup service.`,
              },
            ],
            exercises: [],
          },
          {
            id: 'inspect-your-work',
            title: say`Inspect your work`,
            objective: say`Read repository status before deciding what to do next.`,
            estimatedMinutes: 7,
            content: [
              {
                type: 'text',
                body: say`A clean status means tracked files match the current commit. Modified, deleted, and untracked files are working-tree changes that are not yet part of a commit.`,
              },
              {
                type: 'command',
                command: 'git status',
                explanation: say`Display the current branch and summarize staged and unstaged changes.`,
              },
              {
                type: 'callout',
                tone: 'information',
                body: say`Run status often. It is a safe, read-only command and one of the best ways to stay oriented.`,
              },
            ],
            exercises: [],
          },
          {
            id: 'stage-changes',
            title: say`Stage changes`,
            objective: say`Select exactly which file changes belong in the next commit.`,
            estimatedMinutes: 8,
            content: [
              {
                type: 'text',
                body: say`The staging area lets you prepare a focused commit. Staging a file copies its current change into the proposed snapshot without changing the file itself.`,
              },
              {
                type: 'command',
                command: 'git add README.md',
                explanation: say`Stage the current README change for the next commit.`,
              },
              {
                type: 'callout',
                tone: 'warning',
                body: say`Review status after staging so unrelated changes do not accidentally enter the same commit.`,
              },
            ],
            exercises: [
              {
                id: 'stage-notes',
                title: say`Prepare notes for a commit`,
                instructions: [
                  say`Inspect the repository status.`,
                  say`Stage notes.md without committing it.`,
                ],
                hints: [say`Use git add followed by the file path.`],
                initialRepository: stagingRepository,
                successAssertions: [
                  {
                    type: 'file-status',
                    path: 'notes.md',
                    status: 'staged',
                  },
                ],
              },
            ],
          },
          {
            id: 'create-commits',
            title: say`Create meaningful commits`,
            objective: say`Save a focused snapshot with a useful message.`,
            estimatedMinutes: 9,
            content: [
              {
                type: 'text',
                body: say`A commit stores the staged snapshot, its author, a message, and a link to its parent. Small, focused commits are easier to review and undo.`,
              },
              {
                type: 'command',
                command: 'git commit -m "Explain the change"',
                explanation: say`Create a commit from staged changes with a concise action-oriented message.`,
              },
              {
                type: 'callout',
                tone: 'tip',
                body: say`A helpful commit message explains why the project changed, not only which files changed.`,
              },
            ],
            exercises: [
              {
                id: 'commit-notes',
                title: say`Commit the staged notes`,
                instructions: [
                  say`Confirm that notes.md is staged.`,
                  say`Create a commit with a clear message.`,
                ],
                hints: [say`Use git commit with the -m message option.`],
                initialRepository: stagedResult.state,
                successAssertions: [
                  { type: 'commit-count', count: 4 },
                  { type: 'staging-area-empty' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'history-and-branches',
        title: say`History and branches`,
        description: say`Explore history and develop work safely on parallel branches.`,
        lessons: [
          {
            id: 'read-history',
            title: say`Read project history`,
            objective: say`Follow commits and understand parent relationships.`,
            estimatedMinutes: 8,
            content: [
              {
                type: 'text',
                body: say`Commit history is a chain of snapshots. Each normal commit points to its parent, allowing Git to reconstruct how the project developed.`,
              },
              {
                type: 'command',
                command: 'git log',
                explanation: say`List commits from the current branch tip backward through its parents.`,
              },
              {
                type: 'callout',
                tone: 'information',
                body: say`Commit identifiers are content-based references. A short identifier is usually enough for local discussion.`,
              },
            ],
            exercises: [],
          },
          {
            id: 'create-branches',
            title: say`Create branches`,
            objective: say`Create a lightweight name for an independent line of work.`,
            estimatedMinutes: 9,
            content: [
              {
                type: 'text',
                body: say`A branch is a movable name pointing to a commit. New commits advance the current branch while other branches remain at their previous commits.`,
              },
              {
                type: 'command',
                command: 'git branch feature',
                explanation: say`Create a feature branch at the current commit without switching to it.`,
              },
              {
                type: 'callout',
                tone: 'tip',
                body: say`Use short descriptive branch names such as feature/profile-card or fix/login-timeout.`,
              },
            ],
            exercises: [
              {
                id: 'create-feature-branch',
                title: say`Create a feature branch`,
                instructions: [
                  say`Create a branch named feature at the current commit.`,
                  say`Stay on the main branch after creating it.`,
                ],
                hints: [say`Use git branch followed by the new branch name.`],
                initialRepository: courseGitRepository,
                successAssertions: [
                  { type: 'branch-exists', branch: 'feature' },
                  { type: 'current-branch', branch: 'main' },
                ],
              },
            ],
          },
          {
            id: 'switch-branches',
            title: say`Switch branches`,
            objective: say`Move HEAD between branches and understand which branch receives new commits.`,
            estimatedMinutes: 9,
            content: [
              {
                type: 'text',
                body: say`HEAD identifies your current location. When HEAD points to a branch, the next commit advances that branch.`,
              },
              {
                type: 'command',
                command: 'git switch -c feature',
                explanation: say`Create a branch named feature and switch to it in one command.`,
              },
              {
                type: 'callout',
                tone: 'warning',
                body: say`Commit or safely store unfinished changes before switching when those changes conflict with the destination branch.`,
              },
            ],
            exercises: [
              {
                id: 'switch-to-feature',
                title: say`Move to the feature branch`,
                instructions: [
                  say`Inspect the available branches.`,
                  say`Switch from main to the existing feature branch.`,
                ],
                hints: [say`Use git switch followed by feature.`],
                initialRepository: switchLessonResult.state,
                successAssertions: [
                  { type: 'current-branch', branch: 'feature' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'github-collaboration',
        title: say`GitHub collaboration`,
        description: say`Connect local history to remotes, share branches, and collaborate through pull requests.`,
        lessons: [
          {
            id: 'understand-remotes',
            title: say`Understand remotes`,
            objective: say`Understand how local repositories refer to shared repositories.`,
            estimatedMinutes: 10,
            content: [
              {
                type: 'text',
                body: say`A remote is a named connection to another Git repository. The conventional name origin usually identifies the repository you cloned.`,
              },
              {
                type: 'command',
                command: 'git remote -v',
                explanation: say`List remote names and the URLs used to exchange repository data.`,
              },
              {
                type: 'command',
                command: 'git pull origin main',
                explanation: say`Bring newer commits from origin/main into the current local branch.`,
              },
              {
                type: 'callout',
                tone: 'information',
                body: say`A GitHub repository is a remote Git repository plus collaboration features such as issues, reviews, and pull requests.`,
              },
            ],
            exercises: [
              {
                id: 'pull-latest-main',
                title: say`Pull remote work`,
                instructions: [
                  say`Notice that local main is one commit behind origin/main.`,
                  say`Pull origin/main into your local main branch.`,
                  say`Confirm that the package arrives on the local computer and main reaches the latest commit.`,
                ],
                hints: [
                  say`Use git pull followed by the remote and branch names.`,
                ],
                initialRepository: pullRepository,
                successAssertions: [
                  {
                    type: 'current-branch',
                    branch: 'main',
                  },
                  {
                    type: 'branch-exists',
                    branch: 'main',
                    target: 'c3d4e5f',
                  },
                  { type: 'working-tree-clean' },
                ],
              },
            ],
          },
          {
            id: 'share-branches',
            title: say`Share branches`,
            objective: say`Publish a local branch to a remote repository.`,
            estimatedMinutes: 9,
            content: [
              {
                type: 'text',
                body: say`Pushing transfers commits and updates a branch reference on the remote. It does not upload arbitrary working-tree files that have not been committed.`,
              },
              {
                type: 'command',
                command: 'git push origin feature',
                explanation: say`Publish the local feature branch to the simulated origin remote.`,
              },
              {
                type: 'callout',
                tone: 'warning',
                body: say`Never commit tokens, passwords, private keys, or environment secrets before pushing.`,
              },
            ],
            exercises: [
              {
                id: 'publish-feature',
                title: say`Publish the feature branch`,
                instructions: [
                  say`Confirm that feature is the current branch.`,
                  say`Push feature to the origin remote.`,
                ],
                hints: [say`Provide both the remote and branch to git push.`],
                initialRepository: featureResult.state,
                successAssertions: [
                  {
                    type: 'remote-branch-exists',
                    remote: 'origin',
                    branch: 'feature',
                  },
                ],
              },
            ],
          },
          {
            id: 'submit-code-github',
            title: say`Submit code`,
            objective: say`Commit work on a focused branch and publish it for review on GitHub.`,
            estimatedMinutes: 10,
            content: [
              {
                type: 'text',
                body: say`A commit always advances the branch currently checked out. To submit work safely, switch to a feature branch, stage and commit the intended files, then push that branch to GitHub.`,
              },
              {
                type: 'command',
                command: 'git switch -c feature/github-submit',
                explanation: say`Create and check out a focused branch before changing shared history.`,
              },
              {
                type: 'command',
                command: 'git add src/greeting.ts',
                explanation: say`Stage only the new greeting file for this commit.`,
              },
              {
                type: 'command',
                command: 'git commit -m "Add greeting"',
                explanation: say`Record the staged code on the currently checked-out feature branch.`,
              },
              {
                type: 'command',
                command: 'git push -u origin feature/github-submit',
                explanation: say`Publish the branch and connect it to its matching origin branch.`,
              },
              {
                type: 'callout',
                tone: 'tip',
                body: say`After pushing, open a pull request on GitHub so teammates can review the branch before it is merged into main.`,
              },
            ],
            exercises: [
              {
                id: 'submit-branch-code',
                title: say`Publish a branch`,
                instructions: [
                  say`Confirm that feature/github-submit is the current branch.`,
                  say`Stage src/greeting.ts and commit it with a clear message.`,
                  say`Push feature/github-submit to origin with an upstream connection.`,
                ],
                hints: [
                  say`Use git add before git commit.`,
                  say`Use git push -u origin followed by the current branch name.`,
                ],
                initialRepository: submissionRepository,
                successAssertions: [
                  {
                    type: 'current-branch',
                    branch: 'feature/github-submit',
                  },
                  { type: 'commit-count', count: 4 },
                  { type: 'staging-area-empty' },
                  { type: 'working-tree-clean' },
                  {
                    type: 'remote-branch-exists',
                    remote: 'origin',
                    branch: 'feature/github-submit',
                  },
                ],
              },
            ],
          },
          {
            id: 'pull-requests',
            title: say`Pull requests`,
            objective: say`Use a pull request to explain, review, and merge a branch.`,
            estimatedMinutes: 10,
            content: [
              {
                type: 'text',
                body: say`A pull request proposes merging one branch into another. It creates a shared place for context, automated checks, discussion, and code review.`,
              },
              {
                type: 'command',
                command: 'gh pr create',
                explanation: say`In a real authenticated repository, GitHub CLI can open a pull request for your published branch.`,
              },
              {
                type: 'callout',
                tone: 'tip',
                body: say`Keep pull requests focused, explain the reason for the change, and include clear verification steps.`,
              },
            ],
            exercises: [],
          },
        ],
      },
      {
        id: 'everyday-workflow',
        title: say`Everyday workflow`,
        description: say`Review collaboration changes and build a safe daily Git routine.`,
        lessons: [
          {
            id: 'review-and-merge',
            title: say`Review and merge`,
            objective: say`Evaluate a pull request and choose a clear merge strategy.`,
            estimatedMinutes: 10,
            content: [
              {
                type: 'text',
                body: say`Review checks behavior, clarity, tests, and security rather than only scanning changed lines. Resolve important feedback before merging.`,
              },
              {
                type: 'command',
                command: 'git log',
                explanation: say`Inspect the resulting commit history after a branch is merged.`,
              },
              {
                type: 'callout',
                tone: 'information',
                body: say`Merge commits preserve branch structure, squash merges create one focused commit, and rebase merges produce a linear history.`,
              },
            ],
            exercises: [],
          },
          {
            id: 'safe-daily-workflow',
            title: say`Daily workflow`,
            objective: say`Combine inspection, focused commits, branches, and review into a repeatable routine.`,
            estimatedMinutes: 10,
            content: [
              {
                type: 'text',
                body: say`Start by checking status, create a focused branch, make and review changes, stage intentionally, commit clearly, push the branch, and open a pull request.`,
              },
              {
                type: 'command',
                command: 'git status',
                explanation: say`Begin and end work by confirming your branch and the state of your working tree.`,
              },
              {
                type: 'callout',
                tone: 'warning',
                body: say`Before destructive recovery commands, stop and inspect status and history. Preserve work on a branch or commit whenever possible.`,
              },
            ],
            exercises: [
              {
                id: 'daily-work-branch',
                title: say`Practice a safe branch workflow`,
                instructions: [
                  say`Create and switch to a branch named daily-work.`,
                  say`Publish daily-work to origin.`,
                  say`Finish with a clean working tree.`,
                ],
                hints: [
                  say`The -c option creates a branch while switching.`,
                  say`Push the new branch after switching to it.`,
                ],
                initialRepository: courseGitRepository,
                successAssertions: [
                  { type: 'branch-exists', branch: 'daily-work' },
                  { type: 'current-branch', branch: 'daily-work' },
                  {
                    type: 'remote-branch-exists',
                    remote: 'origin',
                    branch: 'daily-work',
                  },
                  { type: 'working-tree-clean' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'parallel-team-workflows',
        title: say`Parallel team workflows`,
        description: say`Follow several developers as their branches keep moving independently from the same stable main line.`,
        lessons: [
          {
            id: 'parallel-branch-history',
            title: say`Parallel history`,
            objective: say`Understand a repository where feature and hotfix work continue beside main.`,
            estimatedMinutes: 8,
            content: [
              {
                type: 'text',
                body: say`Alice has two profile commits while Bob has an urgent login fix. Both branches share the same stable main commit, but each branch pointer advances only when its owner commits.`,
              },
              {
                type: 'command',
                command: 'git log',
                explanation: say`Read the history reachable from the current branch while the visual map keeps the other active branches visible.`,
              },
              {
                type: 'callout',
                tone: 'information',
                body: say`Parallel lanes do not mean duplicated repositories. They are lightweight pointers into one connected commit history.`,
              },
            ],
            exercises: [
              {
                id: 'inspect-parallel-branches',
                title: say`Navigate the team's branch map`,
                instructions: [
                  say`Inspect the three active branch lanes.`,
                  say`Switch from main to feature/profile without changing its commits.`,
                ],
                hints: [
                  say`Use git branch to list local branches.`,
                  say`Use git switch followed by the full branch name.`,
                ],
                initialRepository: parallelGitRepository,
                successAssertions: [
                  {
                    type: 'branch-exists',
                    branch: 'feature/profile',
                  },
                  {
                    type: 'branch-exists',
                    branch: 'fix/login',
                  },
                  {
                    type: 'current-branch',
                    branch: 'feature/profile',
                  },
                ],
              },
            ],
          },
          {
            id: 'continue-feature-branch',
            title: say`Continue feature`,
            objective: say`Add another focused commit without moving main or the hotfix branch.`,
            estimatedMinutes: 9,
            content: [
              {
                type: 'text',
                body: say`Alice can continue the profile branch after her earlier commits. The new commit extends only feature/profile; main and fix/login stay at their current snapshots.`,
              },
              {
                type: 'command',
                command: 'git commit -m "Test profile card"',
                explanation: say`Commit the staged profile test on Alice's current branch.`,
              },
              {
                type: 'callout',
                tone: 'tip',
                body: say`Watch the feature lane grow by one node while the other branch tips remain fixed.`,
              },
            ],
            exercises: [
              {
                id: 'continue-profile-branch',
                title: say`Extend Alice's feature history`,
                instructions: [
                  say`Confirm that feature/profile is the current branch.`,
                  say`Commit the staged profile test with a clear message.`,
                  say`Keep main and fix/login unchanged.`,
                ],
                hints: [
                  say`The test file is already staged.`,
                  say`Use git commit with the -m message option.`,
                ],
                initialRepository: profileStagedResult.state,
                successAssertions: [
                  { type: 'current-branch', branch: 'feature/profile' },
                  { type: 'commit-count', count: 7 },
                  { type: 'staging-area-empty' },
                ],
              },
            ],
          },
          {
            id: 'continue-hotfix-branch',
            title: say`Continue hotfix`,
            objective: say`Advance the fix branch independently while feature work remains untouched.`,
            estimatedMinutes: 9,
            content: [
              {
                type: 'text',
                body: say`Bob adds a focused login regression test on fix/login. This creates another hotfix node without interrupting Alice's longer-running feature branch.`,
              },
              {
                type: 'command',
                command: 'git commit -m "Test login timeout"',
                explanation: say`Commit the staged regression test on Bob's hotfix branch.`,
              },
              {
                type: 'callout',
                tone: 'warning',
                body: say`Urgency should change priority, not quality. Keep the hotfix small, tested, and ready for review.`,
              },
            ],
            exercises: [
              {
                id: 'continue-login-hotfix',
                title: say`Extend Bob's hotfix history`,
                instructions: [
                  say`Confirm that fix/login is the current branch.`,
                  say`Commit the staged login regression test.`,
                  say`Keep main and feature/profile unchanged.`,
                ],
                hints: [
                  say`The regression test is already staged.`,
                  say`Use a concise commit message describing the test.`,
                ],
                initialRepository: hotfixStagedResult.state,
                successAssertions: [
                  { type: 'current-branch', branch: 'fix/login' },
                  { type: 'commit-count', count: 7 },
                  { type: 'staging-area-empty' },
                ],
              },
            ],
          },
          {
            id: 'publish-team-branches',
            title: say`Publish branches`,
            objective: say`Share both independent lines of work without moving stable main.`,
            estimatedMinutes: 8,
            content: [
              {
                type: 'text',
                body: say`Publishing each branch creates a matching remote pointer. Teammates and automated checks can then review both lines of work while origin/main remains stable.`,
              },
              {
                type: 'command',
                command: 'git push origin feature/profile',
                explanation: say`Publish Alice's feature branch without merging it into main.`,
              },
              {
                type: 'callout',
                tone: 'tip',
                body: say`Push each named branch explicitly when coordinating several active lines of work.`,
              },
            ],
            exercises: [
              {
                id: 'publish-parallel-branches',
                title: say`Share both team branches`,
                instructions: [
                  say`Push feature/profile to origin.`,
                  say`Push fix/login to origin.`,
                  say`Leave main unchanged and the working tree clean.`,
                ],
                hints: [
                  say`Use git push origin followed by each branch name.`,
                  say`You can publish a named branch without switching to it.`,
                ],
                initialRepository: parallelGitRepository,
                successAssertions: [
                  {
                    type: 'remote-branch-exists',
                    remote: 'origin',
                    branch: 'feature/profile',
                  },
                  {
                    type: 'remote-branch-exists',
                    remote: 'origin',
                    branch: 'fix/login',
                  },
                  { type: 'working-tree-clean' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'publishing-environments',
        title: say`Publishing with Dev, UAT, and Production`,
        description: say`Use separate environments to move quickly, validate with stakeholders, and protect real customers.`,
        lessons: [
          {
            id: 'development-environment',
            title: say`Development environment`,
            objective: say`Use a fast, disposable environment for integration and early feedback.`,
            estimatedMinutes: 8,
            content: [
              {
                type: 'text',
                body: say`A shared Development environment runs recent accepted changes before they are release candidates. It favors speed, automatic deployment, useful logs, and data that can be safely reset.`,
              },
              {
                type: 'command',
                command: 'git push origin develop',
                explanation: say`A team can publish its integration branch to trigger an automatic Development deployment.`,
              },
              {
                type: 'callout',
                tone: 'tip',
                body: say`Take advantage of Development by experimenting early, integrating often, and fixing inexpensive failures before they reach testers.`,
              },
            ],
            exercises: [],
          },
          {
            id: 'uat-environment',
            title: say`UAT environment`,
            objective: say`Validate a production-like release with the people who understand the business need.`,
            estimatedMinutes: 8,
            content: [
              {
                type: 'text',
                body: say`User Acceptance Testing gives product owners, QA, and selected users a stable release candidate. Its configuration should resemble Production while its data remains masked or safely representative.`,
              },
              {
                type: 'command',
                command: 'git push origin release/uat',
                explanation: say`Publishing a release candidate can trigger deployment to UAT for acceptance and regression testing.`,
              },
              {
                type: 'callout',
                tone: 'information',
                body: say`Take advantage of UAT to catch requirement misunderstandings and workflow problems that automated tests cannot recognize.`,
              },
            ],
            exercises: [],
          },
          {
            id: 'production-environment',
            title: say`Production environment`,
            objective: say`Release approved software to customers with monitoring and recovery controls.`,
            estimatedMinutes: 9,
            content: [
              {
                type: 'text',
                body: say`Production serves real customers and real data. Access is restricted, changes are deliberate, monitoring is continuous, and every release needs a tested rollback or recovery path.`,
              },
              {
                type: 'command',
                command: 'git push origin main',
                explanation: say`Teams commonly protect main and let an approved update initiate the Production release process.`,
              },
              {
                type: 'callout',
                tone: 'warning',
                body: say`Production credentials and configuration belong in a secure deployment system, never in source code or a client application.`,
              },
            ],
            exercises: [],
          },
          {
            id: 'promote-between-environments',
            title: say`Safe promotion`,
            objective: say`Move one reviewed release from Development through UAT to Production using explicit gates.`,
            estimatedMinutes: 10,
            content: [
              {
                type: 'text',
                body: say`A reliable pipeline builds one version, tests it in Development, promotes the same artifact to UAT, and releases that artifact to Production after acceptance. Environment-specific configuration stays outside the build.`,
              },
              {
                type: 'command',
                command: 'git status',
                explanation: say`Begin a release by confirming exactly which branch and commit will move through the pipeline.`,
              },
              {
                type: 'callout',
                tone: 'information',
                body: say`Promotion gates add confidence without rebuilding different code. If Production fails, observability and a prepared rollback reduce recovery time.`,
              },
            ],
            exercises: [
              {
                id: 'publish-environment-branches',
                title: say`Prepare branches for a publishing pipeline`,
                instructions: [
                  say`Create a develop branch from the stable main commit.`,
                  say`Create a release/uat branch from the same reviewed commit.`,
                  say`Publish both environment branches to origin.`,
                  say`Leave origin/main stable and the working tree clean.`,
                ],
                hints: [
                  say`Use git branch followed by each branch name.`,
                  say`Use git push origin followed by the branch you want to publish.`,
                ],
                initialRepository: courseGitRepository,
                successAssertions: [
                  { type: 'branch-exists', branch: 'develop' },
                  { type: 'branch-exists', branch: 'release/uat' },
                  {
                    type: 'remote-branch-exists',
                    remote: 'origin',
                    branch: 'develop',
                  },
                  {
                    type: 'remote-branch-exists',
                    remote: 'origin',
                    branch: 'release/uat',
                  },
                  { type: 'working-tree-clean' },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
}

export function getGithubLessons(course: Course) {
  return course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      moduleId: module.id,
      moduleTitle: module.title,
    })),
  );
}
