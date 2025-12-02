# Documentation

Welcome to the `@sandbox/iframe-state-sync` documentation!

## Table of Contents

### Getting Started
- **[Getting Started Guide](./getting-started.md)** - Installation, quick start, and basic concepts

### Core Documentation
- **[Architecture Overview](./architecture.md)** - System design, components, and data flow
- **[API Reference](./api-reference.md)** - Complete API documentation with examples
- **[Best Practices](./best-practices.md)** - Security, performance, testing, and patterns
- **[FAQ](./faq.md)** - Frequently asked questions and troubleshooting

### Examples
- **[Counter App](../examples/counter-app.html)** - Working demo with multiple iframes
- **[Iframe Apps](../examples/iframes/)** - Individual iframe implementations
- **[Library Code](../examples/lib/)** - Shared library that each app bundles

## Quick Links

### For New Users
1. Read [Getting Started](./getting-started.md)
2. Try the [Counter Example](../examples/counter-app.html)
3. Review [Architecture](./architecture.md) to understand the system

### For Developers
1. Check [API Reference](./api-reference.md) for method signatures
2. Review [Best Practices](./best-practices.md) for production tips
3. See [Examples](../examples/) for implementation patterns

## Key Concepts

### Independent Apps
Each application (parent and iframes) independently bundles the library. They don't share code, only the message protocol.

### Atoms
State is managed through atoms - units of state with unique keys and values.

### Sync Protocol
All communication uses a standardized message format via `postMessage`.

### Centralized State
The parent window is the source of truth. All updates flow through it.

## Architecture Diagram

```
┌─────────────────────────────────────┐
│         Parent App                  │
│  ┌───────────────────────────────┐  │
│  │   IframeStateSync (Root)      │  │
│  │   - Manages atoms             │  │
│  │   - Broadcasts to iframes     │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
           │           │
    postMessage   postMessage
           │           │
    ┌──────▼──────┐   ┌▼──────────┐
    │  Iframe 1   │   │ Iframe 2  │
    │  ┌────────┐ │   │ ┌────────┐│
    │  │ Client │ │   │ │ Client ││
    │  └────────┘ │   │ └────────┘│
    └─────────────┘   └───────────┘
```

## Common Use Cases

### Multi-App Dashboard
Coordinate state across multiple independent applications in a dashboard.

### Micro-Frontends
Share state between micro-frontend applications loaded in iframes.

### Plugin System
Allow plugins (loaded in iframes) to access and update shared state.

### Cross-Origin Communication
Safely communicate state between apps on different domains.

## Support

- **Issues**: Report bugs or request features
- **Examples**: Check the `examples/` directory
- **API Docs**: See [API Reference](./api-reference.md)

## Contributing

Contributions welcome! Please read the contributing guidelines first.

## License

MIT
