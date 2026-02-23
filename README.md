# minions-notes

**Freeform annotations and observations attachable to any Minion**

Built on the [Minions SDK](https://github.com/mxn2020/minions).

---

## Quick Start

```bash
# TypeScript / Node.js
npm install @minions-notes/sdk minions-sdk

# Python
pip install minions-notes

# CLI (global)
npm install -g @minions-notes/cli
```

---

## CLI

```bash
# Show help
notes --help
```

---

## Python SDK

```python
from minions_notes import create_client

client = create_client()
```

---

## Project Structure

```
minions-notes/
  packages/
    core/           # TypeScript core library (@minions-notes/sdk on npm)
    python/         # Python SDK (minions-notes on PyPI)
    cli/            # CLI tool (@minions-notes/cli on npm)
  apps/
    web/            # Playground web app
    docs/           # Astro Starlight documentation site
    blog/           # Blog
  examples/
    typescript/     # TypeScript usage examples
    python/         # Python usage examples
```

---

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Type check
pnpm run lint
```

---

## Documentation

- Docs: [notes.minions.help](https://notes.minions.help)
- Blog: [notes.minions.blog](https://notes.minions.blog)
- App: [notes.minions.wtf](https://notes.minions.wtf)

---

## License

[MIT](LICENSE)
