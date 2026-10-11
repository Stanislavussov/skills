# Infra review checklists

What to look at per area. Each line is a question to answer from the installed version's docs and the project's real invocation, not a rule to apply from memory. Skip areas the project does not have.

## Package manager and dependencies

- One package manager, one lockfile, lockfile committed; `packageManager` field matches what CI installs with.
- CI installs in frozen mode (`npm ci`, `--frozen-lockfile`, `--immutable`), never a plain install.
- Dependencies in the right group: build and test tools in `devDependencies`; runtime imports in `dependencies`; `peerDependencies` ranges that match what is tested.
- Duplicate majors of the same package in the lockfile (two Reacts, two TypeScripts, two copies of a singleton).
- `overrides` / `resolutions` / patches: each still needed at the current versions, each with a reason.
- Install scripts: which packages run `postinstall`, and whether the manager's allow-list covers them.
- Unused and undeclared dependencies (imported but not listed works only by hoisting).
- Registry and auth config (`.npmrc`, `.yarnrc.yml`): no token in the file, scopes point where intended.

## TypeScript

- `module` / `moduleResolution` / `target` / `lib` match how the code really runs (bundler, Node ESM, Node CJS) and the `type` field in `package.json`.
- Strictness: `strict` and the flags outside it that the team expects; any flag that silently weakens it.
- Who emits: `tsc` or the bundler. If the bundler transpiles per file, the flags that make per-file transpile safe are on, and a separate typecheck runs in CI.
- `include` / `exclude` / `files`: tests, scripts and config files are typechecked by some tsconfig; build output is not.
- `paths` / `baseUrl` mirrored in every other resolver (bundler, test runner, linter).
- Project references and `composite`: reference graph matches the import graph; `tsBuildInfo` location; incremental cache not committed.
- `skipLibCheck`, `types`, `typeRoots`: global types leaking between environments (test globals in app code, DOM in Node code).
- Declaration output for libraries: `declaration`, `declarationMap`, and the `exports` map's `types` condition order.

## Bundler and build

- Config keys valid for the installed major; nothing silently ignored.
- Output targets agree across bundler target, `browserslist`, TS `target` and any transpiler config.
- Dev and prod builds differ only where intended (defines, minify, source maps, env loading).
- Env variables: which prefix is exposed to client code; no secret reachable from the client bundle.
- Source maps: generated or not on purpose; not served publicly by accident; uploaded to error tracking if that is the intent.
- Code splitting and chunking: manual chunk rules still match the dependency set; no accidental duplication of a heavy dependency.
- Tree shaking: `sideEffects` field correct; CJS dependencies that defeat it.
- Library builds: `exports` map, `main` / `module` / `types`, dual-package hazards, externals vs bundled dependencies, `files` whitelist.
- Plugins: order-sensitive ones in the documented order; plugins made redundant by built-in features of the current major.
- Caching and reproducibility: content hashes in filenames, deterministic output, cache directory ignored by git.

## Tests

- The runner really collects the intended files: include/exclude globs, and no test file silently skipped.
- Environment per test type (node, jsdom, browser) set where needed, not globally by default.
- Module resolution, aliases and transforms match the app build; the test does not run a different module format than production.
- Isolation and parallelism settings: pool, workers, isolation flags; shared state between files; order dependence.
- Timers, mocks and globals reset between tests by config, not by hope.
- Coverage: provider, include globs (uncovered files counted or not), thresholds enforced in CI, not only locally.
- Flake control: retries scoped to e2e, not hiding unit flakes; `.only` forbidden in CI; timeouts sized deliberately.
- Setup files and global setup: what they do, and whether every project or workspace loads them.
- E2E: how the server under test starts, base URL, browsers installed with the pinned version, traces and screenshots kept on failure.
- Typecheck of test files happens somewhere.

## Lint and format

- Config format and file name are what the installed major reads; no legacy config silently ignored.
- Parser and parser options match the TypeScript setup; type-aware rules have a project config that covers all linted files.
- Linter and formatter do not fight over the same rules.
- Ignore patterns cover build output and generated code, and do not hide source.
- Pre-commit hooks and CI run the same rules; hooks are installed by a tracked mechanism.
- Warnings policy: does CI fail on warnings, and is that what the team intends.

## CI/CD

- Triggers: right events, branch and path filters; no workflow that never runs or runs twice; `concurrency` cancels superseded runs.
- Permissions: least-privilege token permissions at workflow or job level; no write-all default.
- Third-party actions pinned (commit SHA for anything not first-party); no deprecated runner images, action majors or commands.
- Secrets: never echoed, never passed to steps that run untrusted code; fork PRs and `pull_request_target` handled safely; no script injection from PR titles, branch names or other event fields into `run:`.
- Caching: key includes the lockfile hash and the runtime version; the cached path is the one the tool uses; restore-keys cannot serve a poisoned or stale cache into a release.
- The job fails when it should: no `continue-on-error`, `|| true` or swallowed exit code on a gating step; required checks in branch protection name jobs that still exist.
- Matrix covers the versions the project claims to support; runtime version read from one tracked file.
- Job graph: lint, typecheck, test and build all run; duplicated installs; steps that could run in parallel; timeouts set.
- Artifacts and deploys: built once and promoted, not rebuilt per environment; deploy gated on the checks; rollback path exists.
- Release and publish: provenance, version source, tag triggers, registry token scope.

## Monorepo and task runner

- Workspace globs match the real package folders; no orphan package outside them.
- Task graph: `dependsOn` reflects real build order; outputs and inputs declared so the cache is neither stale nor useless.
- Env variables that change output are part of the cache key.
- Internal packages: consumed from source or from build output, consistently; version protocol (`workspace:*`) used throughout.
- Shared configs (tsconfig, eslint, test presets) come from one package, not copies that drifted.
- CI runs affected-only where intended, and the base ref for "affected" is correct.

## Containers and runtime

- Base image pinned to a version (and digest where reproducibility matters); matches the runtime version used elsewhere.
- Layer order: dependency install before source copy, so the cache holds.
- `.dockerignore` excludes `node_modules`, build output, `.git`, env files.
- Multi-stage build: dev dependencies and build tools absent from the final image; non-root user.
- No secret in build args, layers or the final image.

## Cross-cutting

- Dead config: files for tools no longer installed; scripts nothing calls; options at their default value with a stale comment.
- Deprecation warnings in install, build, test or CI logs that name a removal version.
- Editor and local setup (`.editorconfig`, recommended extensions, hook installer) agree with what CI enforces.
- Docs (`README`, `CONTRIBUTING`) name commands that still exist.
