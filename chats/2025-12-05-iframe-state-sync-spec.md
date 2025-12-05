# Chat Summary: iframe-state-sync Spec Creation
**Date:** December 5, 2025

## Overview

Created a complete specification for a framework-agnostic TypeScript library that enables state synchronization across arbitrarily nested iframe hierarchies. The library allows each app/iframe to import the same code and automatically discover its position in the tree, establishing bidirectional communication for state management.

## What We Built

### 1. Requirements Document
**Location:** `.kiro/specs/iframe-state-sync/requirements.md`

Created 8 user stories with 35 EARS-compliant acceptance criteria covering:

- **Requirement 1:** Dynamic initialization and hierarchy discovery
  - Auto-detect parent/child relationships
  - Self-designate as root when no parent exists
  - Support dynamic role changes

- **Requirement 2:** Complete tree hierarchy establishment
  - Discover all parents up to root
  - Discover all children at any nesting level
  - Dynamic updates when iframes are added/removed

- **Requirement 3:** Bidirectional state propagation
  - Updates flow upward to parents
  - Updates flow downward to children
  - Multi-level forwarding through intermediate nodes
  - Loop prevention via message tracking

- **Requirement 4:** Subscription system
  - Callbacks fire on state updates from any source
  - Unsubscribe functionality

- **Requirement 5:** Error handling and resilience
  - Graceful handling of iframe failures
  - Communication error recovery
  - Timeout fallbacks
  - Proper cleanup on removal

- **Requirement 6:** Framework-agnostic design
  - No framework dependencies
  - Works in any JavaScript environment
  - TypeScript support with full type definitions

- **Requirement 7:** Configurable sync directions
  - **bidirectional** (default) - syncs up and down
  - **up** - only to parents
  - **down** - only to children
  - **local** - stays in current window only
  - Runtime configuration updates

### 2. Design Document
**Location:** `.kiro/specs/iframe-state-sync/design.md`

#### Architecture
5 core components:
1. **StateManager** - Main API for developers
2. **MessageBus** - postMessage communication and routing
3. **HierarchyDiscovery** - Parent/child discovery protocol
4. **StateStore** - Local state management and sync direction logic
5. **SubscriptionManager** - Callback management

#### Key Design Decisions

**Communication:**
- Uses browser's `postMessage` API
- Message namespace for library identification (no origin validation needed for `srcdoc` iframes)
- UUID-based message IDs for loop prevention
- Path tracking to prevent circular propagation

**Discovery Protocol:**
- Attempts upward communication to `window.parent`
- Scans iframe elements for downward discovery
- Configurable timeout (default 5000ms)
- MutationObserver for dynamic hierarchy changes

**State Management:**
- Generic type parameter: `StateManager<T>`
- Shallow merge strategy for state updates
- Last-write-wins for conflicts
- Per-key sync direction configuration

**Security:**
- Designed for self-hosted, trusted environments
- Message validation for structure/types
- No origin validation (intentional for `srcdoc` iframes)
- Documentation warnings about trusted sources only

#### 26 Correctness Properties

All properties follow "for any" pattern for property-based testing:
- Properties 1-4: Hierarchy discovery and role management
- Properties 5-8: Tree structure and dynamic updates
- Properties 9-11: State propagation and loop prevention
- Properties 12-13: Subscription management
- Properties 14-18: Error handling and resilience
- Properties 19: Environment compatibility
- Properties 20-26: Sync configuration behavior

#### Testing Strategy
- **Unit tests:** Vitest for component testing
- **Property-based tests:** fast-check with 100+ iterations per property
- **Integration tests:** Playwright/Puppeteer with real iframes
- Each property test tagged with format: `// Feature: iframe-state-sync, Property {number}: {property_text}`

### 3. Implementation Plan
**Location:** `.kiro/specs/iframe-state-sync/tasks.md`

25 top-level tasks with comprehensive testing and documentation:

#### Sandbox-First Workflow
- All prototyping in `sandbox/iframe-state-sync-prototype/`
- Finalized code migrated to `src/` after review
- Follows existing project structure

#### Documentation Structure
Created 7 documentation files:
- `docs/architecture.md` - Design decisions and component interactions
- `docs/api-reference.md` - Complete API documentation
- `docs/development-workflow.md` - Contributor guidelines and sandbox workflow
- `docs/examples.md` - Usage examples and patterns
- `docs/testing-strategy.md` - Testing approach and results
- `docs/troubleshooting.md` - Common issues and solutions
- `docs/security.md` - Security warnings and best practices

#### Task Breakdown
1-3: Setup (sandbox structure, docs, tooling)
4-9: Core components (types, MessageBus, StateStore, SubscriptionManager, HierarchyDiscovery, loop prevention)
10-16: Integration (StateManager, propagation, dynamic updates, error handling, runtime config, cleanup, validation)
17-18: Testing (TypeScript exports, integration harness)
19-21: Migration (sandbox review, move to src/, production build)
22-23: Examples and final documentation
24-25: Final checkpoint and iteration preparation

## Key Iterations During Spec Creation

### Requirements Phase
1. **Initial version:** Separate requirements for root vs child initialization
2. **Refinement 1:** Simplified to dynamic discovery model where any window can be root
3. **Refinement 2:** Removed state precedence requirement (local > parent > root)
4. **Refinement 3:** Added granular sync direction control (up/down/bidirectional/local)

### Design Phase
1. **Data Models:** Changed from `Record<string, any>` to generic `Partial<T>` for type safety
2. **Registration Message:** Confirmed necessity and added generic typing
3. **Security:** Removed origin validation (not needed for `srcdoc` iframes), added message namespace
4. **API Examples:** Clarified that `initialState` is just state, sync config is separate

### Tasks Phase
1. **Initial version:** Direct implementation in src/
2. **Refinement:** Added sandbox-first workflow with prototype directory
3. **Documentation:** Made docs first-class with 7 comprehensive files
4. **Iteration:** Added checkpoints and room for granular refinement
5. **Testing:** Made all tests required (comprehensive from start)

## Technical Highlights

### Innovation Points
- **Dynamic root discovery:** No need to pre-designate root, it's discovered automatically
- **Arbitrary nesting:** Works with any depth of iframe hierarchy
- **Per-key sync control:** Fine-grained control over state propagation direction
- **Framework agnostic:** Pure TypeScript, works with any framework
- **Loop prevention:** Sophisticated message tracking with path and TTL

### Design Patterns
- **Observer pattern:** For subscriptions
- **Mediator pattern:** MessageBus coordinates communication
- **Strategy pattern:** Configurable sync directions
- **Composite pattern:** Tree hierarchy of StateManagers

### Testing Approach
- **Property-based testing:** 26 properties covering all requirements
- **Integration testing:** Real iframe hierarchies in browser
- **Unit testing:** Component isolation
- **All tests required:** Comprehensive coverage from start

## Project Context

### Existing Structure
- `sandbox/` - Experimental workspace (already has svelte-iframe-demo)
- `src/` - Production code (currently empty)
- `trash/` - Deprecated code (contains old iframe implementations)

### Workflow
1. Prototype in `sandbox/iframe-state-sync-prototype/`
2. Test thoroughly with property-based and integration tests
3. Document everything in `docs/`
4. Review at checkpoint (task 19)
5. Migrate finalized code to `src/`
6. Build production bundle
7. Create examples
8. Iterate as needed

## Next Steps

The spec is complete and ready for implementation. To begin:

1. Open `.kiro/specs/iframe-state-sync/tasks.md`
2. Click "Start task" next to task 1
3. Follow the sandbox-first workflow
4. Document as you go
5. Test comprehensively
6. Iterate and refine as needed

## Notes

- User emphasized iterative development - expect many refinements
- Documentation is critical - everything should be searchable in Markdown
- Sandbox workflow allows experimentation before committing to production
- All tests are required for comprehensive correctness validation
- Library designed for self-hosted, trusted environments (not for arbitrary external iframes)
