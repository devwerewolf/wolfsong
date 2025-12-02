---
inclusion: always
---

## Workspace Structure

This project uses a two-tier development approach:

- **`sandbox/`** - Experimental workspace for prototyping, testing new features, and iterative development
- **`src/`** - Production code that has been refined and validated

## Development Workflow

When creating new features or experimenting with code:

1. Always place initial implementations in `sandbox/`
2. Iterate and refine within the sandbox environment
3. The user will manually migrate stable code to `src/` when ready

## Guidelines for AI Assistance

- Default to creating files in `sandbox/` unless explicitly instructed otherwise
- Treat `sandbox/` as a safe space for experimentation without production constraints
- Do not automatically move or copy files from `sandbox/` to `src/` - the user controls this migration
- When asked to create or modify code without a specified location, use `sandbox/`
