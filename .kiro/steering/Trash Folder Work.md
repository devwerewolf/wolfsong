---
inclusion: always
---

## Trash Directory Policy

The `trash/` directory contains deprecated, obsolete, or discarded code that should not be referenced in active development.

### Rules

- **Ignore by default**: Do not read, reference, or suggest files from `trash/` unless explicitly requested
- **Exclude from searches**: When searching the codebase or analyzing project structure, skip the `trash/` directory
- **No automatic cleanup**: Do not delete or modify files in `trash/` - the user manages this directory manually
- **Explicit access only**: Only access `trash/` contents when the user specifically mentions files or paths within it

### Purpose

This directory serves as a holding area for code that may need to be referenced temporarily before permanent deletion, keeping the active workspace clean without losing historical context.
