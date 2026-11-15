---
status: "APPROVED FOR PUBLICATION BY USER"
proposed_slug: "openchamber-agent-pages-visual-decisions"
proposed_title: "OpenChamber Agent Pages: when agents need to show you"
proposed_excerpt: "OpenChamber Agent Pages let a coding agent show charts, mockups and options in chat, then collect your choice or a teammate's by link and PIN."
proposed_tags: [OpenChamber, AI Agents, Developer Tools, Human in the Loop, Coding Agents]
proposed_cover: "/blog-covers/ai-security-2026-10-24/agent-pages-watercolor.webp"
proposed_cover_alt: "Three watercolour website wireframe sketches side by side on white paper, photographed by Hal Gatewood."
proposed_date: "2026-11-15"
source_review_date: "2026-11-15"
review_notes:
  - "All product behaviour is taken from https://docs.openchamber.dev/agent-pages/ read on 2026-11-15. No claims about unreleased features, pricing or usage numbers."
  - "No OpenChamber screenshots are used: the docs page has no images and no session screenshot was captured. Add a real screenshot from your own session before publishing if you want one."
  - "Use cases are written as suggestions and how I would use it, not as claims of past usage or measured time savings."
  - "Cover: Hal Gatewood on Unsplash, checked free licence 2026-11-15. Centre crop to 1600x840; only hand-drawn squiggles, no readable text."
verified_sources:
  - url: "https://docs.openchamber.dev/agent-pages/"
    accessed: "2026-11-15"
---

## Some answers are pictures, not paragraphs

Coding agents are very good at text. Ask one to compare three layouts, summarise test results or choose between migrations, and you usually get a well-written wall of prose. The trouble is that some decisions are visual or numerical. You cannot pick a layout from a description of it, and a list of twelve timings hides the one that doubled.

OpenChamber's [Agent Pages](https://docs.openchamber.dev/agent-pages/) address exactly that gap. The agent can draw a page directly in the chat, such as a chart, a table, a diagram, an interface mockup or a short form, and it can ask you to make a choice on that page. When the decision belongs to someone else, it can send the same page to a teammate.

This post explains what the feature does, where I would use it in day-to-day engineering work, and the limits worth knowing before you share a page outside your team.

## What Agent Pages do

You do not need special syntax. You ask in plain language, and the documentation gives examples such as:

- "Show me the three layout options as mockups and let me pick one."
- "Put the test results in a chart."
- "Ask me which of these migrations to run first."

The page appears inside the chat, in a frame that cannot reach your files. You can open it full screen or download it as an HTML file.

When the agent asks you something on a page, the chat shows that it is waiting for your answer. You pick an option or fill in fields and press the page's send button. The agent receives your answer and the page records what you chose. You can also decline, which tells the agent you will not choose, or simply answer in a normal chat message.

The agent does not always have to stop and wait. It can show a page and keep working. The page stays open until you answer, even after the agent's turn ends or the app restarts, and your answer starts the agent again if it had gone idle.

## Where this beats a chat reply

The rule I would use is simple: if I would draw it on a whiteboard, the agent should draw it too.

**Design choices.** For a portfolio redesign, the useful question is not "which option sounds best?" but "which of these looks right?" Three mockups side by side, with a button under each, turn a long back-and-forth into one decision.

**Data reviews.** Search Console exports, test durations and cost comparisons are easier to read as a chart or a table than as sentences. A chart also makes outliers obvious, which is often the point of the review.

**Choosing an order of work.** "Which of these migrations should run first?" works better as a short form with the options and their risks listed than as an open question in prose. The answer comes back structured, so the agent does not have to interpret it.

**Architecture explanations.** A diagram of how services connect is faster to check than a paragraph describing the same arrows.

Where it does not help: short factual answers, a couple of numbers or code. A page for a two-line answer is just noise.

## Asking a teammate without giving them your tools

The part I find most practical is sharing. If the decision needs someone else, a manager approving a design or a colleague choosing between two approaches, you can ask the agent something like: "Ask Yulia and Denis which of these two designs they prefer."

According to the docs, the agent then creates one link per person, shown in a card with a copy-link and copy-PIN button for each name. You send each person their link and PIN through any messenger you already use. They open the link in a browser, enter the PIN and answer on the page. They do not need OpenChamber installed.

Their answer comes back into the same session that asked, with a notification for you, and the agent carries on with it. The card also shows when each person opened the page and when they answered.

This is a small but real change to how async decisions happen. Instead of pasting screenshots into a group chat and collecting opinions by hand, the answer arrives as structured input in the place where the work is happening.

## Know the limits before you share

The documentation is clear about the boundaries, and they are worth repeating:

- **One answer per person, and it is final.**
- **Links expire.** A link works for up to two working days, with Saturday and Sunday not counted. You can ask the agent for a shorter time.
- **You can withdraw a link** from the person's menu on the card.
- **Too many wrong PINs lock the link.**
- **OpenChamber does not verify identity.** Anyone with both the link and the PIN can answer. The name on the card is simply the name you gave the agent, so send the link and PIN to the right person.
- **Content is encrypted in transit and storage.** The sharing service keeps only an encrypted copy and deletes it once the answer reaches you. A link without its PIN opens nothing.
- **Self-hosting is possible.** Pages can go through OpenChamber's sharing service or through your own relay if you set up Private Relay. In enterprise mode, sharing works only through the organisation's own relay.

Two practical points: Agent Pages need OpenChamber's own OpenCode server, and in the VS Code extension shared links stay plain text and some pages show without answer controls, so answer those in the desktop or web app. The feature is on by default and can be turned off in Settings, under General, OpenChamber Tools, Charts and mockups.

## Receiving a page someone shared with you

It also works in the other direction. If someone shares a page with you and you use OpenChamber, you can paste the link into the chat input, enter the PIN and ask your own agent to help you decide. The agent receives the page's content, clearly marked as another person's content, but the link and PIN never reach the model. Your agent can suggest an answer, but only you can send it.

That is a sensible design choice: the agent assists the decision, it does not make it on your behalf.

## The takeaway

Agent Pages fit a pattern I keep coming back to with coding agents: let the agent do the work, but keep a person in charge of the decisions that matter. A page with three mockups and a button is a better interface for that than a paragraph asking "which do you prefer?"

If you already use OpenChamber, try it on the next decision that is really about how something looks or what the numbers show. If you are building your own [agentic workflows](/blog/designing-agentic-ai-workflows-tool-calling-memory-and-multi-modal-integration), it is a good reference for how human-in-the-loop input can stay structured, visible and safe.

*Cover photo: [Hal Gatewood / Unsplash](https://unsplash.com/photos/watercolor-wireframe-sketches-of-website-layouts-tZc3vjPCk-Q), used under the Unsplash License.*
