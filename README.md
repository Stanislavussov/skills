# Skills

Agent skills for pi-coding-agent and other compatible AI coding assistants.

## What is a Skill?

A skill is a self-contained capability package that provides:
- Specialized workflows
- Setup instructions
- Helper scripts
- Reference documentation

Skills enable AI agents to handle specific tasks with expert-level guidance.

## Installation

### Install all skills from this repo

```bash
npx skills@latest add Stanislavussov/skills
```

### Install specific skill

```bash
npx skills@latest add Stanislavussov/skills/codebase-analyzer
```

### Install globally (all agents)

```bash
npx skills@latest add Stanislavussov/skills -g
```

### Update skills

```bash
# Update all global skills
npx skills@latest update -g

# Update specific skill
npx skills@latest update codebase-analyzer -g
```

### Remove skill

```bash
npx skills@latest remove codebase-analyzer
```

## Available Skills

### codebase-analyzer

Analyzes repository entities and finds implementation locations for feature extensions or new behaviors.

**Use when:**
- User describes a task in Czech, English, or Russian
- Need to find where to add new features
- Need to find extension points in existing code
- Need to understand entity relationships in codebase

**How it works:**
1. Interprets the task description
2. Uses AST search (ast-grep/pi-lens) to explore TypeScript codebase
3. Analyzes entity relationships
4. Identifies implementation locations
5. Creates structured implementation plan

```bash
npx skills@latest add Stanislavussov/skills/codebase-analyzer
```

---

## Creating New Skills

A skill is a directory with `SKILL.md`:

```
my-skill/
├── SKILL.md              # Required: frontmatter + instructions
├── scripts/              # Helper scripts (optional)
│   └── helper.sh
├── REFERENCE.md          # Detailed docs (optional)
└── EXAMPLES.md           # Usage examples (optional)
```

### SKILL.md format

```markdown
---
name: my-skill
description: Brief description. Use when [specific triggers].
---

# My Skill

## Quick start

[Minimal working example]

## Workflows

[Step-by-step processes]

## Advanced features

See [REFERENCE.md](REFERENCE.md)
```

### Frontmatter fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Must match directory name, lowercase with hyphens |
| `description` | Yes | Max 1024 chars. Include triggers ("Use when...") |

### Best practices

- Keep SKILL.md under 100 lines
- Use concrete examples
- Include clear triggers
- Follow existing patterns

## Resources

- [Agent Skills Specification](https://agentskills.io/specification)
- [skills.sh - Skill Directory](https://skills.sh/)
- [mattpocock/skills](https://github.com/mattpocock/skills)