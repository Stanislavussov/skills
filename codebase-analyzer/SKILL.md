---
name: codebase-analyzer
description: Analyze repository entities and find implementation locations for feature extensions or new behaviors. Use when user describes a task in Czech, English, or Russian and wants to discover where in the codebase to add changes. Works only with TypeScript via AST search (pi-lens). Always clarify ambiguous requirements before proceeding.
---

# Codebase Analyzer

Analyze repository structure and entities to find implementation locations for extending behaviors or adding features.

## Input

User provides a task description in any language (Czech, English, Russian). Extract the core intent and constraints.

## Process

### 1. Understand the Task

If task is unclear, ask ONE clarifying question:
- "What is the main goal of this feature?"
- "Which entities are involved?"
- "What behavior should change?"

Do NOT proceed until reasonably clear.

### 2. Explore Repository Structure

Use `ast_grep_search` to discover:
- Entry points (main files, exports)
- Key domain entities (classes, interfaces, types)
- Usage patterns across codebase

```bash
# Find all exported classes/interfaces in src/
ast_grep --lang typescript --pattern 'export class $NAME { }' --paths src/

# Find all exported interfaces
ast_grep --lang typescript --pattern 'export interface $NAME { }' --paths src/

# Find all exported types
ast_grep --lang typescript --pattern 'export type $NAME = $BODY' --paths src/
```

### 3. Analyze Entity Relationships

For each relevant entity:
- What methods/properties does it have?
- Where is it used?
- What interfaces does it implement?
- Are there similar patterns elsewhere?

```bash
# Find all usages of a class
ast_grep --lang typescript --pattern 'new $CLASS($$$)' --paths src/
ast_grep --lang typescript --pattern '$CLASS.$METHOD($$$)' --paths src/

# Find class/interface definitions
ast_grep --lang typescript --pattern 'class $NAME { $$BODY }' --paths src/

# Find type/interface definitions
ast_grep --lang typescript --pattern 'type $NAME = $BODY' --paths src/
```

### 4. Identify Implementation Locations

Based on task, find:
- Where similar behavior already exists (templates)
- Extension points (hooks, plugins, middleware)
- Places needing modification

Look for patterns:
- Design patterns (factory, strategy, observer)
- Framework extension points
- Configuration/options objects
- Event systems

### 5. Create Implementation Plan

Format output as:

```
# Implementation Plan: [Task Summary]

## Entities Involved

| Entity | Role | File |
|--------|------|------|
| EntityName | Brief role | path/to/file.ts |

## Recommended Locations

### 1. [Location Name]
**File:** `src/path/file.ts`
**Entity:** ClassName / InterfaceName
**What to add:** Brief description
**Why here:** Rationale

### 2. [Location Name]
...

## Implementation Approach

1. [ ] First change
2. [ ] Second change
...
```

## Rules

1. **Always use AST search** — never text grep for structural analysis
2. **Be specific** — include file paths, entity names, method names
3. **Clarify ambiguities** — if something is unclear, ask before proceeding
4. **Focus on TypeScript** — pi-lens only works with .ts/.tsx files
5. **Respect existing patterns** — follow codebase conventions

## Output

The final output is a structured plan with:
- List of files/entities to modify
- What to add at each location
- Why this location is correct
- Ordered steps for implementation