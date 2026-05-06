export const projects = [
  {
    id: 1,
    title: "hidden-order-dex",
    category: "Flagship",
    workCategory: "AI",
    thesis:
      "Privacy-preserving transaction system with zero-knowledge order validity and verifiable settlement fairness.",
    implemented: [
      "submit_order validates side, price, size, and nonce without disclosing order values.",
      "settle_order proves seller_limit <= matched_price <= buyer_limit without disclosing either limit.",
      "Circuit execution -> preimage serialization -> Groth16 proof generation -> settlement metadata with proof linkage.",
    ],
    nonTrivial: [
      "Order privacy and settlement correctness must both hold; leaking either breaks the core guarantee.",
      "Matching executes off-chain while fairness is proven at settlement; if the boundary is wrong, fairness is not verifiable.",
    ],
    stack: ["Midnight", "Compact", "Groth16", "FastAPI", "SQLite", "React"],
    image: null,
    links: {
      github: "https://github.com/Yadui/hidden-order-dex",
      live: "",
    },
  },
  {
    id: 2,
    title: "Automify",
    category: "Flagship",
    workCategory: "Web",
    thesis:
      "Workflow execution system that runs trigger-based node graphs with persisted run state and retry semantics.",
    implemented: [
      "Trigger-node-first graph model with one enforced entry trigger per workflow.",
      "Step execution engine supporting time-based blocking (wait-duration, wait-until).",
      "Persisted execution history with step-level logs and retry state tracking.",
    ],
    nonTrivial: [
      "Workflow graphs must remain composable while execution stays deterministic; incorrect ordering causes inconsistent runs.",
      "Retries and rate limits must compose predictably; if wrong, side effects duplicate or runs are silently dropped.",
    ],
    stack: ["Next.js", "TypeScript", "Prisma", "Stripe", "Webhooks"],
    image: "/assets/work/automify/landing.png",
    links: {
      github: "https://github.com/Yadui/automify",
      live: "https://fuzzie-saas-lac.vercel.app/",
    },
  },
  {
    id: 3,
    title: "VirtuAI",
    category: "Flagship",
    workCategory: "Cloud",
    thesis:
      "Multi-model AI execution layer that normalizes provider calls and persists workload state under auth, quota, and billing controls.",
    implemented: [
      "Unified execution paths for text, image, video, and audio generation across providers.",
      "Provider execution routes backed by OpenAI and Replicate integrations.",
      "Prisma-backed persistence with subscription enforcement and free-tier API limits.",
    ],
    nonTrivial: [
      "Providers expose incompatible payload and response contracts; weak normalization causes divergent behavior.",
      "Auth, quota, and billing must run before execution; wrong ordering corrupts usage accounting.",
    ],
    stack: ["Next.js", "TypeScript", "Prisma", "Clerk", "Stripe", "OpenAI", "Replicate"],
    image: "/assets/work/virtuai/landing.png",
    links: {
      github: "https://github.com/Yadui/virtuai",
      live: "https://virtuai.vercel.app/",
    },
  },
  {
    id: 4,
    title: "adaptive-tetris",
    category: "Secondary",
    workCategory: "Cloud",
    thesis:
      "Adaptive control-loop experiment that adjusts runtime difficulty from validated telemetry without blocking simulation.",
    implemented: [
      "Asynchronous adaptation loop applies model feedback on timed intervals.",
      "Telemetry ingestion with schema validation and backend rate limiting.",
      "Deterministic, stateless game engine with test-validated mechanics.",
    ],
    nonTrivial: [
      "Adaptation must run concurrently with real-time simulation; blocking feedback introduces frame drops and input lag.",
      "Feedback cadence is slower than gameplay events; poor loop design yields contradictory or delayed adaptation.",
    ],
    stack: ["React", "Vite", "Node", "Express", "Gemini", "Firestore"],
    image: null,
    links: {
      github: "https://github.com/Yadui/adaptive-tetris",
      live: "",
    },
  },
  {
    id: 5,
    title: "powerbi-visuals",
    category: "Secondary",
    workCategory: "AI",
    thesis:
      "Data interface layer for external tools interacting with BI datasets and query layers.",
    implemented: [
      "Execution paths spanning Python services and JS/TS/Svelte clients with shared data contracts.",
      "Containerized local and production runtimes via multiple Docker Compose definitions.",
      "Tool-facing integration modules for query and analytics interaction workflows.",
    ],
    nonTrivial: [
      "Tool and client layers must preserve stable dataset/query contracts; contract drift breaks integrations.",
      "Multi-runtime deployment needs strict environment alignment; mismatch causes runtime-specific failures.",
    ],
    stack: ["Python", "JavaScript", "TypeScript", "Svelte", "Docker Compose"],
    image: null,
    links: {
      github: "https://github.com/Yadui/powerbi-visuals",
      live: "",
    },
  },
  {
    id: 6,
    title: "Business OS",
    category: "Enterprise Only",
    workCategory: "Cloud",
    thesis:
      "Multi-tenant SaaS ERP that unifies finance, sales, and operations with AI invoice extraction, SharePoint and Azure storage, and deep Tally ERP integration.",
    implemented: [
      "Unified accounts payable, invoicing, CRM, subscriptions, and order management inside one tenant-aware platform.",
      "AI-powered invoice extraction feeding document handling across SharePoint and Azure-backed storage flows.",
      "Operational and finance-side workflows connected through deep Tally ERP integration.",
    ],
    nonTrivial: [
      "Finance, sales, and operations usually live in separate systems; combining them in one multi-tenant model requires stable cross-module boundaries.",
      "Document extraction, storage, and ERP sync must stay consistent per tenant or downstream accounting state drifts quickly.",
    ],
    stack: ["ERP", "AI Extraction", "Azure", "SharePoint", "Tally", "Multi-Tenant"],
    image: null,
    links: {
      github: "",
      live: "",
    },
  },
  {
    id: 7,
    title: "Biforze",
    category: "Enterprise Only",
    workCategory: "Web",
    thesis:
      "End-to-end business operations suite for SMBs spanning quotation workflows, approvals, accounts payable, payment processing, dashboards, and Tally push integration.",
    implemented: [
      "Quotation creation and approval flows tied into downstream finance operations.",
      "Accounts payable and payment-processing flows backed by RBAC and admin dashboards.",
      "Financial graphing and Tally push integration to connect operations with accounting outcomes.",
    ],
    nonTrivial: [
      "Operational steps and accounting steps have to stay in sync; if approvals and finance events diverge, the suite stops being trustworthy.",
      "RBAC has to cover both workflow actions and sensitive financial surfaces without over-complicating day-to-day use.",
    ],
    stack: ["React", "Finance Ops", "RBAC", "Tally", "SMB", "ERP", "Private"],
    image: null,
    links: {
      github: "",
      live: "",
    },
  },
  {
    id: 8,
    title: "Azure Pricing Calculator",
    category: "Tooling",
    workCategory: "Cloud",
    thesis:
      "Azure estimation tool that lets users build BOQs in a cleaner UI, generate them with AI, save quotes, and compare VM options side by side.",
    implemented: [
      "Manual BOQ builder for assembling Azure estimates without relying on the official pricing UX.",
      "AI-assisted BOQ generation to accelerate quote creation from higher-level requirements.",
      "Saved quotes and side-by-side VM comparisons for faster decision-making.",
    ],
    nonTrivial: [
      "Azure pricing has a large SKU and configuration surface; generated quotes still have to resolve to concrete comparable options.",
      "Comparison only helps if the underlying BOQ structure is normalized consistently across manual and AI-generated paths.",
    ],
    stack: ["React", "Azure", "AI", "BOQ", "VM Comparison"],
    image: null,
    links: {
      github: "",
      live: "",
    },
  },
  {
    id: 9,
    title: "MSPulse",
    category: "Product",
    workCategory: "Web",
    thesis:
      "Personal dashboard that automatically fetches and surfaces Microsoft product and security updates as a clean scheduled feed.",
    implemented: [
      "Scheduled fetch jobs that pull updates instead of relying on manual browsing.",
      "Dashboard UI designed to surface the newest product and security changes in one place.",
      "Normalized feed presentation to keep update streams readable and scannable.",
    ],
    nonTrivial: [
      "Microsoft updates span multiple sources and formats, so the feed has to normalize noisy inputs into one stable surface.",
      "Scheduled collection only helps if duplicate, stale, or low-signal updates are filtered cleanly enough to stay usable.",
    ],
    stack: ["React", "Automation", "Microsoft", "Scheduled Fetch", "Dashboard"],
    image: null,
    links: {
      github: "",
      live: "",
    },
  },
  {
    id: 10,
    title: "Only4You",
    category: "Platform",
    workCategory: "Web",
    thesis:
      "Learning platform for ethical hacking, Python, web development, and AI with 300+ lessons, live safe labs, an in-browser editor, and an Azure AI mentor.",
    implemented: [
      "Large lesson library spanning multiple technical tracks inside one learning product.",
      "Live safe labs and in-browser coding workflows for hands-on practice.",
      "Azure AI mentor layer to support guided learning inside the platform.",
    ],
    nonTrivial: [
      "Learning content, live labs, and browser-based editing all have different runtime needs; combining them cleanly requires careful product boundaries.",
      "Hands-on environments have to stay useful without becoming unsafe or unstable for learners.",
    ],
    stack: ["React", "Node.js", "Learning Platform", "Real-Time", "Azure AI"],
    image: null,
    links: {
      github: "",
      live: "",
    },
  },
  {
    id: 11,
    title: "ReelTrace",
    category: "AI Product",
    workCategory: "AI",
    thesis:
      "Tool that takes an Instagram reel link, infers the filming location, and can generate a travel itinerary around the places featured in the reel.",
    implemented: [
      "Reel-link intake flow centered on short-form travel discovery.",
      "Location-detection pipeline that maps reel content to likely places.",
      "Itinerary generation built from the locations surfaced by the reel analysis.",
    ],
    nonTrivial: [
      "Short-form video rarely provides clean location signals, so place inference has to work under incomplete and ambiguous context.",
      "Travel planning only feels credible if the system can turn uncertain location clues into a usable route or itinerary.",
    ],
    stack: ["AI", "React", "Location Detection", "Travel", "Instagram"],
    image: null,
    links: {
      github: "",
      live: "",
    },
  },
  {
    id: 12,
    title: "Reportix",
    category: "Enterprise Only",
    workCategory: "Cloud",
    thesis:
      "Microsoft Power Platform document system that automates report generation inside enterprise workflows that were previously manual and time-consuming.",
    implemented: [
      "Power Platform workflow for generating reports as part of existing enterprise process steps.",
      "Automation paths built to remove repetitive manual document work.",
      "SharePoint-backed enterprise flow support for report-centric operations.",
    ],
    nonTrivial: [
      "Enterprise report generation has to fit existing workflow state and approvals, not just output a file in isolation.",
      "Automation only saves time if template logic and workflow handoffs remain reliable under real operational use.",
    ],
    stack: ["Power Platform", "Power Automate", "SharePoint", "Automation", "Private"],
    image: null,
    links: {
      github: "",
      live: "",
    },
  },
  {
    id: 13,
    title: "Yojana AI",
    category: "AI Product",
    workCategory: "AI",
    thesis:
      "Eligibility-matching tool that turns a simple self-description into relevant government schemes without forcing users to search scattered portals manually.",
    implemented: [
      "Free-form user input flow for describing eligibility context in plain language.",
      "NLP-assisted scheme matching across many fragmented listings.",
      "Result surface designed to reduce manual scheme browsing and filtering.",
    ],
    nonTrivial: [
      "Government scheme criteria live across many inconsistent sources, so the matching layer has to normalize fragmented rule descriptions.",
      "User descriptions are messy and incomplete; turning them into dependable eligibility signals is the core difficulty.",
    ],
    stack: ["AI", "React", "Government Schemes", "NLP", "Public Utility"],
    image: null,
    links: {
      github: "",
      live: "",
    },
  },
];