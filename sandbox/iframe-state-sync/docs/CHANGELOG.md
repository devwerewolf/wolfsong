# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2024-12-01

### Added
- Initial release of `@sandbox/iframe-state-sync`
- Core `IframeStateSync` class for parent windows
- `createChildClient()` helper for child iframes
- Automatic initial state synchronization from parent to children
- Support for nested iframes
- TypeScript support with full type safety
- Optional `initialValue` for child atom configurations
- Debug logging mode
- Comprehensive documentation:
  - Getting Started guide
  - Architecture overview
  - API Reference
  - Best Practices
  - FAQ
- Working examples:
  - Counter app with multiple iframes
  - TypeScript examples for parent and child
  - Individual iframe implementations

### Features
- 🎯 Centralized state management using `@xstate/store` atoms
- 🔄 Automatic synchronization across parent and child iframes
- 🔒 Type-safe API with TypeScript
- 🪆 Support for nested iframes
- 🐛 Optional debug logging
- 📦 Each app bundles independently (no shared resources)
- 🔌 Standardized message protocol (`atom-sync`, `atom-sync-request`)
- ⚡ Automatic initial state request on child initialization

### Message Protocol
- `atom-sync` - Synchronize state between parent and children
- `atom-sync-request` - Request initial state from parent

### API
- `IframeStateSync` - Main class for parent windows
  - `registerAtom(config)` - Register an atom
  - `getAtom(key)` - Get an atom by key
  - `registerIframe(iframe)` - Register an iframe for sync
  - `unregisterIframe(iframe)` - Unregister an iframe
  - `requestStateFromParent()` - Request state from parent (child only)
  - `sendToParent(key, value)` - Send update to parent (child only)

- `createChildClient(atomConfigs, options)` - Helper for child iframes
  - `updateAtom(key, value)` - Update atom and send to parent
  - `getAtomValue(key)` - Get current atom value
  - `subscribeToAtom(key, callback)` - Subscribe to atom changes

### Documentation
- Complete API reference with examples
- Architecture diagrams and flow charts
- Security best practices
- Performance optimization tips
- Testing strategies
- Framework integration examples (React, Vue)
- FAQ with common questions and troubleshooting

### Examples
- Multi-iframe counter application
- TypeScript parent window example
- TypeScript child iframe example
- Nested iframe communication
- Read-only iframe example
