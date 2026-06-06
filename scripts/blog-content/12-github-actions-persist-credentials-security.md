# Always Set persist-credentials: false in actions/checkout

**Published:** May 25, 2026  
**Tags:** GitHub Actions, Security, CI/CD, DevOps

---

There's a default in `actions/checkout` that most teams never change — and that quietly leaves a GitHub token sitting in a readable file for every subsequent step in the job.

The fix is one line. The reasoning is worth understanding.

## The Setting

```yaml
- uses: actions/checkout@v4
  with:
    persist-credentials: false  # default is true
```

By default (`persist-credentials: true`), the checkout action writes a git credential config file containing your GitHub token to `$RUNNER_TEMP`. That file persists for the lifetime of the job.

## What the File Looks Like

The checkout action creates a file at `$RUNNER_TEMP/git-credentials-<UUID>.config`:

```ini
[http "https://github.com/"]
    extraheader = AUTHORIZATION: basic <Base64-encoded-string>
```

The Base64 string decodes to `x-access-token:<GITHUB_TOKEN>`. It's not encrypted. It's not write-protected. It sits in `$RUNNER_TEMP` for every step after checkout to read.

## How Easy It Is to Exploit

Any step in the same job — including actions from third-party repos — can extract the token with a shell one-liner:

```bash
GH_TOKEN=$(
  cat "$RUNNER_TEMP"/git-credentials-*.config \
    | awk 'NR==2 {print $5}' \
    | base64 --decode \
    | cut -d: -f2
)
echo "token: ${GH_TOKEN:0:10}..."
```

This doesn't require `${{ github.token }}` or `${{ secrets.GITHUB_TOKEN }}` to appear anywhere in the workflow. The token is already on disk.

> [!WARNING]
> If any action you use is compromised via a supply chain attack, or if your workflow is vulnerable to script injection through untrusted input, that action can silently exfiltrate your GitHub token via this file.

Setting `persist-credentials: false` makes the checkout action **delete the credentials file** after checkout completes. The file is gone before the next step runs.

## The Practical Risk

The most realistic threat vectors:

**1. Compromised third-party action:** You pin `some-org/some-action@v2`. The maintainer's account is compromised, a new patch release is pushed, and the action now exfiltrates credentials. If you reference by tag (not commit SHA), you get the new version automatically.

**2. Script injection via PR titles or branch names:** Workflows that echo `${{ github.event.pull_request.title }}` into a `run:` block are vulnerable. An attacker opens a PR with a title crafted to execute a shell command that reads `$RUNNER_TEMP/git-credentials-*.config`.

The `persist-credentials: false` flag eliminates the file-based exfiltration path. It doesn't prevent all attacks, but it removes the easiest one.

## What If I Need Git Auth in Later Steps?

Setting `persist-credentials: false` means subsequent `git pull`, `git push`, or other authenticated operations will fail without credentials being re-established.

The clean solution is `gh auth setup-git`, which configures Git to use the GitHub CLI credential helper:

```yaml
- uses: actions/checkout@v4
  with:
    persist-credentials: false

- name: Set up git credentials via GH CLI
  run: gh auth setup-git
  env:
    GH_HOST: github.com

- name: Pull latest
  run: git pull origin main
  env:
    GH_TOKEN: ${{ github.token }}
```

This configures `~/.gitconfig` with:

```ini
[credential "https://github.com"]
    helper =
    helper = !/usr/bin/gh auth git-credential
```

The credential helper calls out to the GitHub CLI at auth time, which reads `GH_TOKEN` from the environment — **only when Git actually needs to authenticate**, and without writing the token to disk.

The token is scoped to the steps where `GH_TOKEN` is explicitly passed in `env:`. It's not sitting in a file readable by any arbitrary code running in the job.

## Pinning Actions by Commit SHA

While you're hardening your checkout step, pin by full commit SHA rather than a mutable tag:

```yaml
# Mutable — tag can be force-pushed to point at new, malicious code
- uses: actions/checkout@v4

# Immutable — this exact commit is guaranteed
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
```

Combined with `persist-credentials: false`, this closes both the supply chain mutation vector and the credential-on-disk vector in one checkout block.

## Automated Detection

Human review will miss this. Use static analysis in CI:

**[zizmor](https://docs.zizmor.sh)** — Rust-based, runs as a GitHub Action:

```yaml
- uses: woodruffw/zizmor-action@v1
```

Output when `persist-credentials` is not set:

```
warning[artipacked]: credential persistence through GitHub Actions artifacts
 --> .github/workflows/build.yml:7:9
  |
7 |       - uses: actions/checkout@v4
  |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^ does not set persist-credentials: false
  |
  = note: this finding has an auto-fix
```

**[ghasec](https://github.com/koki-develop/ghasec)** and **[ghalint](https://github.com/suzuki-shunsuke/ghalint)** also catch this and surface it with rule references.

Running any of these in CI ensures the check doesn't rely on engineers remembering to apply it manually.

> [!TIP]
> There is an open PR in the `actions/checkout` repo to flip the default to `false`, but it has been stalled for years. Until the default changes, enforce it via linting.

## Checklist

- [ ] `persist-credentials: false` on all `actions/checkout` steps
- [ ] Actions pinned to full commit SHAs, not mutable tags
- [ ] `gh auth setup-git` pattern for workflows that need post-checkout git auth
- [ ] zizmor or ghasec running in CI to catch new workflows
- [ ] Minimal `permissions:` scope on each job (`contents: read` unless write is required)
