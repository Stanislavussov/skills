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
```bash
# Recent commits touching related files (last 20)
git log --oneline -20 --all -- <pattern>  # files matching feature name

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

Search for these patterns specifically:
```bash
# Global mutable state
ast-grep -p 'window.$X = $V' src/
ast-grep -p 'global.$X = $V' src/
ast-grep -p 'export let $X' src/  # mutable exports

# Singleton access
ast-grep -p 'getInstance()' src/
ast-grep -p 'singleton.$X' src/

# Event emitters
ast-grep -p 'emit($EVENT, $$$ARGS)' src/
ast-grep -p 'on($EVENT, $HANDLER)' src/

# Try without catch (swallowed errors)
ast-grep -p 'try { $$$TRY } finally { $$$FINALLY }' -l js src/
```

**Path D: Cross-File Dependencies**
```bash
# What imports this module
ast-grep -p 'import from "$PATH"' --json src/ > imports.json

# Find all files that reference the function/class name
grep -r "FunctionName\|ClassName" --include="*.ts" src/

# Check if any decorator/middleware wraps the function
ast-grep -p '@$DECORATOR function $F($$$P) { $$$B }' src/
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

# Search for error patterns
grep -r "throw new Error" --include="*.ts" src/ | head -20
grep -r "console.error" --include="*.ts" src/ | head -20

# Check for unhandled promise rejections
ast-grep -p 'async function $NAME($$$P) { $$$BODY }' -l js src/ | xargs -I{} ast-grep -p 'return $EXP' --where={} src/
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