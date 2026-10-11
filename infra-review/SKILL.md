---
name: infra-review
description: Reviews project infrastructure - bundler and build config, test runner setup, CI/CD pipelines, TypeScript config, linters and formatters, package manager and lockfile, monorepo task runners, Docker - and checks every finding against current docs (Context7 MCP), real-world usage (grep MCP) and known GitHub issues. Use when the user asks to review, audit or sanity-check build, tooling, config, CI or dependency setup, when a diff touches config files (tsconfig, vite/webpack/rollup/esbuild config, jest/vitest/playwright config, .github/workflows, eslint config, package.json, lockfiles, Dockerfile), or when a tool upgrade or migration needs a check.
---

# Infra Review

Review the tooling a project is built, tested and shipped with. Application logic is out of scope.

Infra config is where memory is least reliable: options get renamed, defaults flip between majors, and a config that looks right can be silently ignored. So the rule of this skill is: **no finding without a source checked in this session.** A finding rests on the docs for the installed version, on a known issue, or on a command you ran. "I recall that..." is a lead to check, not a finding.

The review is read-only. Do not change files unless the user asks for fixes.

## Workflow

### 1. Scope

- Diff review (a PR, a branch, uncommitted changes): review the changed infra files, plus the files that consume them.
- Audit (no diff, or the user asks for the whole setup): take inventory first. List the config files, the `package.json` scripts, the CI workflows, and what calls what.

Say in one line which mode you chose.

### 2. Pin the facts

Before judging any config, establish what is really installed and really run:

- **Versions from the lockfile**, not from `package.json` ranges. `^5.0.0` tells you nothing about which minor is on disk.
- **Runtime versions** from every place that sets one: `.nvmrc`, `.tool-versions`, `engines`, `packageManager`, the CI matrix, the Dockerfile base image. A mismatch between them is itself a finding.
- **The real invocation**: which script calls the tool, with which flags, from which directory. CI often runs a different command than developers do.
- **The resolved config** where the tool can print it (`tsc --showConfig`, `eslint --print-config <file>`, a bundler's debug or inspect flag). Extended and merged configs are judged on the result, not on one file.

### 3. Research each tool (mandatory)

For each tool in scope, do all three lookups before writing findings. Match MCP tools by name; the prefix depends on how the server was installed.

| Source | Tool | Use it for |
|---|---|---|
| Context7 MCP | `resolve-library-id`, then `query-docs` (older servers: `get-library-docs`) | Options, defaults and migration notes **for the installed major**. Ask for that version when the library ID offers one. |
| grep MCP (grep.app) | `searchGitHub` | How maintained public repos configure the same thing. It is a literal code search, not a keyword search: query the option or snippet itself, e.g. `moduleResolution: "bundler"` or `pool: 'forks'`, and filter by language or file path. |
| GitHub issues | GitHub MCP `search_issues`, or `gh search issues "<text>" --repo <owner>/<repo>` | Known bugs and regressions for the installed version: search the exact error text, the option name, the version number. Read open and recently closed issues, and the linked fix release. |

Rules:

- Research in parallel across tools; one subagent per tool is fine for an audit.
- **Send only public terms out**: tool names, option names, generic error text. Never put proprietary code, internal package or host names, or secrets into a query.
- If a source is not available, do not skip silently. Fall back (`gh` CLI, the tool's docs site or changelog via web fetch) and list the missing source under "Not checked" in the report.
- When docs and real-world usage disagree, the docs for the installed version win; note the disagreement.

### 4. Check

Go through the areas in scope with [CHECKLISTS.md](CHECKLISTS.md). The checklists name what to look at, not what the answer is: the answer comes from step 3.

Then check the seams between tools, which is where most real breakage hides:

- The same fact stated in two places (path aliases in `tsconfig` and in the bundler and in the test runner; Node version in five files; target/browserslist in three).
- Local vs CI: different command, different env, different install mode, a step that only one of them runs.
- A config key the tool ignores at this version (renamed, removed, wrong nesting, wrong file name), so the intended behaviour is not active.

### 5. Verify

Before reporting a finding, try to prove it cheaply: run the typecheck, print the resolved config, run one test file, do a dry-run build, lint one file. Use only commands that do not publish, deploy or change tracked files. A finding you could not prove stays in the report, marked as unverified.

### 6. Report

Lead with the verdict in one or two sentences, then the findings, most severe first.

Per finding:

- **Severity**: `blocker` (broken or will break: wrong output, false-green CI, leaked secret), `should fix` (real cost: slow, flaky, fragile, drift), `consider` (improvement with a trade-off).
- **Where**: `path:line`.
- **What is wrong and what happens because of it**, concretely.
- **Source**: the docs page, the issue URL, or the command and its output.
- **Fix**: the exact change, as a snippet.
- **Verified**: yes (how) or no.

End with:

- **Not checked**: areas, tools or sources you did not cover, and why.
- **Looks fine**: one line per area you reviewed and found sound, so silence is not read as coverage.

Do not pad the report. No style opinions without a cost behind them, no "consider upgrading" without a named reason from the changelog or an issue.
