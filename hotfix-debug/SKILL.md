---
name: hotfix-debug
description: >
  Debug production bugs and find root causes in complex codebases. Use when user reports a critical bug, crash, or unexpected behavior that requires urgent investigation. Traces hidden relationships between components, analyzes recent commits, and digs beyond obvious code paths to find the real cause.
---

# Hotfix Debug

Investigate critical bugs and find root causes fast. Think out of the box — the bug is never where you expect it.

## When to Use

- User reports production crash, error, or broken feature
- "Something stopped working after recent changes"
- "X is broken but the code looks fine"
- Any urgent debugging where quick root cause is needed

---

## Workflow

### 1. Capture Bug (30 sec)

Get from user:
- What broke (symptom)
- Expected behavior
- When it started (if known)

**Start investigation immediately** — don't ask follow-up questions yet.

---

### 2. Multi-Path Investigation (parallel)

Run these **concurrently** using subagent with `type=Explore`:

**Path A: Code Structure Analysis**
- Find the code that should handle this feature
- Trace the call chain: where it enters → what it calls → what that calls
- Find ALL paths that could lead to this symptom (not just the happy path)
- Look for: implicit dependencies, global state, side effects, callbacks, middleware

**Path B: Git Archaeology**

Use the bundled script for automated commit search:

```bash
node scripts/git-archaeology.js "<feature-name>" 20
```

Or use manual commands:
```bash
# Recent commits touching related files (last 20)
git log --oneline -20 --all -- <pattern>

# What changed in last 3 days
git log --since="3 days ago" --oneline --all

# Search commits mentioning the bug symptom
git log --grep="<keyword>" --oneline -10

# Diff for recent suspicious commits
git show <sha> --stat
```

**Path C: Hidden Relationships (CRITICAL)**
In big ball of mud architectures, bugs hide in:
- Global state / singletons
- Config objects passed implicitly
- Side effects in getters/setters
- Event emitters / pub-sub systems
- Monkey-patched methods
- Cache invalidation bugs
- Timing / race conditions
- Error handling that swallows exceptions
- Import order side effects

Search for these patterns using **pi-lens AST tools**:

```typescript
// Global mutable state - use ast_grep_search with TypeScript
ast_grep_search - lang: typescript - paths: ['src/'] - pattern: 'window.$X = $V'
ast_grep_search - lang: typescript - paths: ['src/'] - pattern: 'global.$X = $V'
ast_grep_search - lang: typescript - paths: ['src/'] - pattern: 'export let $X'

// Singleton access
ast_grep_search - lang: typescript - paths: ['src/'] - pattern: 'getInstance()'

// Event emitters
ast_grep_search - lang: typescript - paths: ['src/'] - pattern: 'emit($EVENT, $$$ARGS)'
ast_grep_search - lang: typescript - paths: ['src/'] - pattern: 'on($EVENT, $HANDLER)'
```

**Path D: Cross-File Dependencies**

Use **LSP navigation** for TypeScript symbol resolution:

```typescript
// Find all references to track cross-file dependencies
lsp_navigation - operation: references - filePath: "src/file.ts" - line: 10 - character: 5

// Search for symbol across codebase
lsp_navigation - operation: workspaceSymbol - query: "FunctionName" - filePath: "src/"

// Check if any decorator/middleware wraps the function
ast_grep_search - lang: typescript - paths: ['src/'] - pattern: '@$DECORATOR function $F($$$P) { $$$B }'
```

---

### 3. Synthesize Findings

Connect the dots. Ask yourself:

- ❓ Is there **implicit data flow** the bug could corrupt?
- ❓ Could **caching** return stale data?
- ❓ Is **timing** a factor (async, promises, events)?
- ❓ Does **configuration** differ between environments?
- ❓ Is there a **transitive dependency** that changed?
- ❓ Could **inheritance** or **mixins** add unexpected behavior?

---

### 4. Create Fix Plan

Format:
```
ROOT CAUSE: [One sentence describing the real cause]

AFFECTED FILES: [List]

FIX APPROACH:
1. [Specific change 1]
2. [Specific change 2]

VERIFICATION:
- [ ] Test case for this scenario
- [ ] Run existing tests
```

---

### 5. Execute & Verify

Apply the minimal fix. Run tests. Confirm bug is resolved.

---

## Secret Patterns (Out of the Box)

These catch 80% of "impossible" bugs:

```typescript
// Pattern 1: Shared mutable object passed everywhere
// Search for: object that's modified but not returned
const sharedConfig = { timeout: 5000 };
// ... config mutated deep in call stack

// Pattern 2: Prototype pollution / object augmentation
// Search for: Object.assign with user data
// Search for: spreading {...userInput}

// Pattern 3: Closure capturing stale reference
// Search for: for-loop with setTimeout
// Search for: callback in array.map that uses outer var

// Pattern 4: Promise chain that swallows rejections
// Search for: .then() without .catch()
// Search for: async function without try-catch

// Pattern 5: Module-level initialization race
// Search for: top-level await or sync init in modules
```

---

## Quick Commands Reference

```bash
# Find recent changes to file
git log -5 --oneline -- path/to/file.ts

# Who called this function (reverse call graph)
git log --all -p -S "functionName" -- "*.ts" | head -50

# Diff between working tree and parent commit
git diff HEAD~1 -- src/feature/

# Find where variable gets reassigned
git log -p -S "variableName" -- "*.ts"
```

**For TypeScript patterns:**

```typescript
// Find async functions without try-catch (swallowed errors)
ast_grep_search - lang: typescript - paths: ['src/'] - pattern: 'async function $NAME($$$P) { $$$BODY }'

// Find unhandled promise rejections
ast_grep_search - lang: typescript - paths: ['src/'] - pattern: 'return new Promise($RESOLVER)'
```

---

## Output Format

When done, provide:

```
🔍 ROOT CAUSE: [Clear one-liner]

📁 AFFECTED: [Files that need changes]

💡 FIX: [Specific code change]

✅ VERIFY: [How to confirm it works]
```

---

## Why pi-lens over raw ast-grep?

pi-lens provides:
- **LSP integration** for TypeScript symbol resolution
- **Cross-file analysis** via language server
- **Type-aware search** that understands generics
- **Definition/references** navigation

Use raw ast-grep only for:
- Simple pattern matching in JS/TS files
- Projects without LSP server
- Bulk text-like searches (not structural)