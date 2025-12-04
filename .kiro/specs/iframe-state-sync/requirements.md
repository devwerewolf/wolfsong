# Requirements Document

## Introduction

This document specifies requirements for a framework-agnostic TypeScript library that enables state synchronization between a root ancestor page and any number of nested iframe pages. The library provides bidirectional state management where each iframe can sync with both its root ancestor and its nearest parent, while maintaining its own local state and controlling state propagation to its children.

## Glossary

- **Root Ancestor**: The top-level page in the iframe hierarchy, dynamically discovered during initialization
- **Parent**: The immediate parent window in the nesting hierarchy for any given iframe
- **Child**: An iframe that is directly embedded within the current window
- **State Sync**: The process of synchronizing state values between connected windows in the iframe hierarchy
- **Tree Hierarchy**: The dynamically discovered structure of parent-child relationships between windows
- **State Manager**: The library instance imported and initialized in each separate app/iframe
- **App**: An independent application context (page or iframe) that imports the library to participate in state synchronization

## Requirements

### Requirement 1

**User Story:** As a developer, I want to import and initialize the library in any app/iframe, so that it automatically discovers its position in the hierarchy and establishes communication.

#### Acceptance Criteria

1. WHEN a developer imports and initializes the State Manager in any window, THEN the State Manager SHALL automatically detect whether it has a parent window
2. WHEN the State Manager initializes, THEN the State Manager SHALL attempt to communicate upward to discover parent windows
3. WHEN the State Manager initializes, THEN the State Manager SHALL attempt to communicate downward to discover child iframes
4. WHEN the State Manager discovers it has no parent window, THEN the State Manager SHALL designate itself as the root ancestor
5. WHEN the hierarchy changes (a root becomes a child), THEN the State Manager SHALL dynamically update its role in the tree hierarchy

### Requirement 2

**User Story:** As a developer, I want the library to establish a complete tree hierarchy, so that state can flow through arbitrary levels of nesting.

#### Acceptance Criteria

1. WHEN the State Manager initializes in any window, THEN the State Manager SHALL discover all parent windows up to the root ancestor
2. WHEN the State Manager initializes in any window, THEN the State Manager SHALL discover all child iframes at any nesting level
3. WHEN the tree hierarchy is established, THEN the State Manager SHALL maintain references to its immediate parent and all direct children
4. WHEN a new iframe is added to the DOM, THEN the State Manager SHALL dynamically update the tree hierarchy to include the new child
5. WHEN an iframe is removed from the DOM, THEN the State Manager SHALL dynamically update the tree hierarchy to remove the child

### Requirement 3

**User Story:** As a developer, I want to update state in any app/iframe, so that changes propagate both upward and downward through the hierarchy.

#### Acceptance Criteria

1. WHEN a developer updates state in any window, THEN the State Manager SHALL propagate the update upward to its parent
2. WHEN a developer updates state in any window, THEN the State Manager SHALL propagate the update downward to all direct children
3. WHEN the State Manager receives a state update from a parent, THEN the State Manager SHALL propagate it downward to its children
4. WHEN the State Manager receives a state update from a child, THEN the State Manager SHALL propagate it upward to its parent
5. WHEN state updates are propagated, THEN the State Manager SHALL prevent infinite update loops by tracking message origins

### Requirement 4

**User Story:** As a developer, I want to subscribe to state changes in any iframe, so that my application can react to state updates from the root, parent, or children.

#### Acceptance Criteria

1. WHEN a developer subscribes to state changes, THEN the State Manager SHALL invoke the callback function whenever state is updated
2. WHEN state is updated from the root ancestor, THEN the State Manager SHALL trigger subscribed callbacks with the new state
3. WHEN state is updated from a parent iframe, THEN the State Manager SHALL trigger subscribed callbacks with the new state
4. WHEN state is updated from a child iframe, THEN the State Manager SHALL trigger subscribed callbacks with the new state
5. WHEN a developer unsubscribes from state changes, THEN the State Manager SHALL stop invoking that callback function

### Requirement 5

**User Story:** As a developer, I want the library to handle communication errors gracefully, so that my application remains stable when iframes fail to load or communicate.

#### Acceptance Criteria

1. WHEN an iframe fails to load, THEN the State Manager SHALL continue operating without blocking other iframes
2. WHEN a postMessage communication fails, THEN the State Manager SHALL log the error and continue operating
3. WHEN a state sync request times out, THEN the State Manager SHALL use default or cached state values
4. WHEN an iframe is removed from the DOM, THEN the State Manager SHALL clean up message listeners and references
5. WHEN cross-origin restrictions prevent communication, THEN the State Manager SHALL handle the security error gracefully

### Requirement 6

**User Story:** As a developer, I want the library to be framework-agnostic, so that I can use it with any JavaScript framework or vanilla JavaScript in each separate app.

#### Acceptance Criteria

1. WHEN the library is imported into any app, THEN the State Manager SHALL not depend on any specific framework (React, Vue, Svelte, etc.)
2. WHEN the library is used, THEN the State Manager SHALL provide a simple JavaScript API that works in any environment
3. WHEN the library is bundled, THEN the State Manager SHALL be distributable as a standalone TypeScript/JavaScript module
4. WHEN the library is integrated, THEN the State Manager SHALL support both ES modules and CommonJS formats
5. WHEN developers use the library, THEN the State Manager SHALL provide TypeScript type definitions for type safety

### Requirement 7

**User Story:** As a developer, I want to control the synchronization direction for each state key, so that I can optimize performance and control state propagation.

#### Acceptance Criteria

1. WHEN initializing the State Manager, THEN the State Manager SHALL accept configuration to specify synchronization direction for each state key (up, down, bidirectional, or local)
2. WHEN no sync configuration is provided for a state key, THEN the State Manager SHALL synchronize that key bidirectionally by default
3. WHEN a state key is configured as "up", THEN the State Manager SHALL propagate updates only to parent windows
4. WHEN a state key is configured as "down", THEN the State Manager SHALL propagate updates only to child iframes
5. WHEN a state key is configured as "bidirectional", THEN the State Manager SHALL propagate updates both upward and downward
6. WHEN a state key is configured as "local", THEN the State Manager SHALL not propagate updates for that key to any other window
7. WHEN sync configuration is updated at runtime, THEN the State Manager SHALL apply the new configuration to subsequent state updates
