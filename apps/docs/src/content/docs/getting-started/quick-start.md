---
title: Quick Start
description: Get up and running with Minions Notes in minutes
---

## TypeScript

```typescript
import { createClient } from '@minions-notes/sdk';

const client = createClient();
console.log('Version:', client.version);
```

## Python

```python
from minions_notes import create_client

client = create_client()
print(f"Version: {client['version']}")
```

## CLI

```bash
notes info
```
