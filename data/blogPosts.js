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