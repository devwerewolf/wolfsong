# Development Workflow

## Sandbox-First Approach

This project follows a sandbox-first development workflow to enable rapid prototyping and iteration before committing to production code.

### Directory Structure

```
sandbox/iframe-state-sync-prototype/
├── src/                    # TypeScript source code
├── test-pages/             # Manual testing HTML pages
├── docs/                   # Documentation
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts (to be added)

src/                        # Production code (after migration)
├── (same structure as sandbox/src/)
```

### Development Process

1. **Prototype in Sandbox**
   - All initial development happens in `sandbox/iframe-state-sync-prototype/`
   - Experiment freely without worrying about breaking production code
   - Iterate quickly on API design and implementation

2. **Test Thoroughly**
   - Write unit tests with Vitest
   - Write property-based tests with fast-check
   - Create integration tests with real iframes
   - Use manual test pages in `test-pages/` for visual verification

3. **Document as You Go**
   - Update `docs/` files as features are implemented
   - Keep API documentation in sync with code
   - Document design decisions and trade-offs

4. **Review at Checkpoint**
   - Task 19 is a formal checkpoint to review all sandbox code
   - Ensure API is stable and well-tested
   - Identify any needed refinements

5. **Migrate to Production**
   - Copy finalized code from `sandbox/src/` to project root `src/`
   - Update import paths as needed
   - Verify all tests still pass

6. **Build and Package**
   - Set up production build tooling (tsup/rollup)
   - Generate optimized bundles
   - Create type declarations

### Manual Testing

The `test-pages/` directory contains HTML files for manual testing:

- **root.html** - Root window with one child iframe
- **child.html** - Child window with one grandchild iframe
- **grandchild.html** - Grandchild window (3rd level)

To test manually:
1. Open `test-pages/root.html` in a browser
2. Open browser DevTools console to see logs
3. Use the UI controls to update state
4. Observe state synchronization across all windows

### TypeScript Configuration

The sandbox uses strict TypeScript configuration:
- Strict mode enabled
- ES2020 target for modern JavaScript features
- DOM lib for browser APIs
- Declaration files generated for type checking

### Testing Strategy

See `docs/testing-strategy.md` for comprehensive testing approach.

### Lessons Learned

(This section will be updated as development progresses)

- TBD: Document any API changes or design decisions made during prototyping
- TBD: Note any challenges encountered and how they were resolved
- TBD: Record performance considerations or optimization opportunities
