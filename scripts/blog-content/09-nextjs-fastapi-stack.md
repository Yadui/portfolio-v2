## The Monolith We Were Running From

Two years ago, a typical internal tool at Foetron was a Flask app serving Jinja2 templates, jQuery for interactivity, Bootstrap for styling, and a PostgreSQL database. It worked. It also took 3–5 seconds to load any page, required a full-page reload for every interaction, and made adding new features feel like defusing a bomb.

The rewrite to a Next.js frontend + FastAPI backend wasn't a "we love new tech" decision. It was driven by specific, measurable problems.

## The Performance Case

### Server-Side Rendering vs. Traditional MVC

A Flask/Jinja2 page load sequence:
1. Browser requests `/dashboard` (RTT: 200ms)
2. Flask queries PostgreSQL (50–300ms depending on query)
3. Jinja2 renders HTML (5–15ms)
4. Browser parses and renders HTML (50–100ms)
5. jQuery downloads and executes (100–400ms for deps)
6. **Total: 400–1000ms** — and that's without cache misses

A Next.js page with SSR + React Server Components:
1. Browser requests `/dashboard` (RTT: 200ms)
2. Next.js server component renders HTML with data (50–200ms, parallelised queries)
3. Browser paints (50–100ms) — **page is visible and interactive**
4. React hydrates incrementally in background
5. **Total to first paint: 250–500ms**

The delta is the incremental hydration — users see content and can interact before all JavaScript loads.

### The Numbers From Our Migration

| Metric | Flask/Jinja2 | Next.js (SSR) | Improvement |
|---|---|---|---|
| Time to First Byte (P50) | 420ms | 180ms | 57% faster |
| Largest Contentful Paint (P75) | 2.8s | 0.9s | 68% faster |
| Total Blocking Time | 890ms | 120ms | 87% lower |
| Lighthouse Performance | 41 | 87 | +46 points |

## Why FastAPI, Not Node.js Backend?

[!INFO] This is the question everyone asks. The answer is: the team was more productive in Python for data-heavy work, FastAPI's automatic OpenAPI docs are excellent for internal tooling, and the Pydantic validation layer prevented entire categories of bugs.

FastAPI gives you:

```python
from fastapi import FastAPI
from pydantic import BaseModel, field_validator
from typing import Optional

app = FastAPI()

class VMAnalysisRequest(BaseModel):
    subscription_id: str
    resource_group: Optional[str] = None
    lookback_days: int = 30

    @field_validator('lookback_days')
    @classmethod
    def validate_lookback(cls, v):
        if not 1 <= v <= 365:
            raise ValueError('lookback_days must be between 1 and 365')
        return v

@app.post("/api/analyse-fleet")
async def analyse_fleet(request: VMAnalysisRequest):
    fleet = await get_fleet(request.subscription_id, request.resource_group)
    return await analyse(fleet, request.lookback_days)
```

That single endpoint definition gives you: automatic input validation with descriptive errors, automatic OpenAPI documentation at `/docs`, TypeScript-compatible schema generation via `openapi-typescript`, and async concurrency for Azure API calls.

## The Developer Experience Win: Tailwind CSS

The argument against Tailwind is always "class soup in your HTML." The argument for it is: you never leave your editor to write or debug styles.

Before (Bootstrap + custom SCSS):
```html
<!-- Requires: Bootstrap CSS, custom _components.scss, knowing Bootstrap's grid API -->
<div class="dashboard-card card-elevated">
  <div class="card-header with-border">
    <h3 class="section-title">VM Fleet Overview</h3>
  </div>
</div>
```

After (Tailwind):
```jsx
<div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 hover:border-accent transition-colors">
  <h3 className="text-lg font-bold text-white mb-4">VM Fleet Overview</h3>
</div>
```

The difference: a new developer can read the Tailwind version and immediately understand every style being applied. They don't need to hunt through SCSS files.

### The Responsive Design Workflow

Tailwind's breakpoint prefix system collapses responsive design to single lines:

```jsx
// Mobile: single column. Tablet: 2 columns. Desktop: 3 columns.
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {vms.map(vm => <VmCard key={vm.id} vm={vm} />)}
</div>
```

The equivalent in CSS:
```css
.vm-grid { display: grid; gap: 1.5rem; }
@media (min-width: 768px) { .vm-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .vm-grid { grid-template-columns: repeat(3, 1fr); } }
```

At scale (50+ components), the Tailwind version means the difference between a 2-minute and 20-minute CSS debugging session because styles live *with* the component, not in a separate file.

## The Integration Layer

Next.js frontend talking to FastAPI backend — the pattern that works:

```typescript
// lib/api.ts — generated types from FastAPI's OpenAPI schema
export async function analyseFleet(subscriptionId: string) {
  const res = await fetch('/api/proxy/analyse-fleet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription_id: subscriptionId })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

The proxy route in Next.js handles CORS, auth header injection, and keeps the FastAPI URL server-side only.

The stack is more moving parts than a monolith. It's also the stack that lets two engineers ship production features 3× faster than five engineers on the monolith did.
