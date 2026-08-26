import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export function GET() {
  const body = `# Abhinav Yadav

> Cloud & AI Engineer at Foetron in Gurugram, India. Builds Azure infrastructure, AI pipelines, and full-stack applications with React, Next.js, Python, and FastAPI.

## Primary pages
- [Homepage](${SITE_URL}/): Professional profile, experience, projects, skills, and contact details.
- [Projects](${SITE_URL}/work): Selected cloud, AI, and full-stack projects.
- [Services](${SITE_URL}/services): Cloud architecture, AI tooling, web development, and AI training services.
- [Experience](${SITE_URL}/work/foetron): Cloud and AI engineering case study at Foetron.
- [Blog](${SITE_URL}/blog): Technical writing on Azure, AI systems, security, DevOps, and full-stack engineering.
- [Contact](${SITE_URL}/contact): Contact Abhinav for engineering and collaboration opportunities.

## Blog topics
- LLM inference, KV cache, transformers, and AI performance
- Azure infrastructure, Azure AI, Microsoft Foundry, and cloud operations
- Web authentication, JWT, HttpOnly cookies, and application security
- GitHub Actions, CI/CD, credential security, and DevOps

## Entity references
- GitHub: https://github.com/Yadui
- LinkedIn: https://www.linkedin.com/in/abhinavyadav88
- X: https://x.com/abhinav2302055
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
