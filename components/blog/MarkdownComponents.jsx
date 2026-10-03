import React from "react";
import { FiGithub, FiTwitter, FiLinkedin, FiInfo, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { CodeBlock, CodeBlockCopyButton } from "@/components/ai-elements/code-block";

// Helper to generate IDs for headings
export function generateId(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Custom Markdown Components for Coloring and IDs
export const MarkdownComponents = {
  h1: ({ children }) => <h1 id={generateId(children.toString())} className="text-3xl font-light mt-8 mb-4 text-[#101828]">{children}</h1>,
  h2: ({ children }) => <h2 id={generateId(children.toString())} className="text-2xl font-light mt-8 mb-4 text-[#101828] border-l-4 border-[#00ff99] pl-4">{children}</h2>,
  h3: ({ children }) => <h3 id={generateId(children.toString())} className="text-xl font-light mt-6 mb-3 text-[#1d2839]">{children}</h3>,

  // Links with special styling for resources
  a: ({ href, children }) => {
    const isGithub = href.includes("github.com");
    const isTwitter = href.includes("twitter.com") || href.includes("x.com");
    const isLinkedin = href.includes("linkedin.com");

    const baseStyle = "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all no-underline mb-2 mr-2";

    if (isGithub) {
      return (
        <a href={href} className={`${baseStyle} bg-[#24292e] text-white hover:bg-[#2f363d] shadow-lg shadow-black/20 transform hover:-translate-y-0.5`} target="_blank" rel="noopener noreferrer">
          <FiGithub size={16} />
          {children}
        </a>
      );
    }
    if (isTwitter) {
        return (
          <a href={href} className={`${baseStyle} bg-[#1DA1F2] text-white hover:bg-[#1a91da] shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5`} target="_blank" rel="noopener noreferrer">
            <FiTwitter size={16} />
            {children}
          </a>
        );
      }
    if (isLinkedin) {
        return (
          <a href={href} className={`${baseStyle} bg-[#0077b5] text-white hover:bg-[#006399] shadow-lg shadow-blue-700/20 transform hover:-translate-y-0.5`} target="_blank" rel="noopener noreferrer">
            <FiLinkedin size={16} />
            {children}
          </a>
        );
      }

    return (
      <a href={href} className="font-medium text-[#00805b] underline decoration-[#00b86b]/40 underline-offset-4 transition-all hover:text-[#101828] hover:decoration-[#00b86b]" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },

  // Images
  img: ({ src, alt }) => (
    <div className="relative my-8 aspect-video w-full overflow-hidden rounded-2xl border border-[#101828]/10 shadow-xl">
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      {alt && <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-xs text-center text-white/70">{alt}</div>}
    </div>
  ),

  // Custom Blockquote (Generic style for quotes)
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-[#101828]/20 pl-6 italic text-[#536074]">
      {children}
    </blockquote>
  ),

  // Custom Paragraphs (intercept for Callouts)
  p: ({ children }) => {
    // Check if the paragraph starts with a callout flag
    const contentArr = React.Children.toArray(children);
    const firstChild = contentArr[0];

    if (typeof firstChild === 'string') {
        const match = firstChild.match(/^\[!(NOTE|INFO|WARNING|DANGER|ERROR|SUCCESS|TIP)\]/i);
        if (match) {
            const typeKey = match[1].toUpperCase();
            let type = "default";
            if (typeKey === "WARNING") type = "warning";
            else if (typeKey === "DANGER" || typeKey === "ERROR") type = "danger";
            else if (typeKey === "SUCCESS" || typeKey === "TIP") type = "success";
            else if (typeKey === "NOTE" || typeKey === "INFO") type = "info";

            // Remove the flag from the text
            const cleanText = firstChild.replace(match[0], "").trim();
            const newChildren = [cleanText, ...contentArr.slice(1)];

            const styles = {
                default: "border-[#00b86b] bg-white/70 text-[#2a3648]",
                info: "border-blue-500 bg-blue-500/10 text-blue-900",
                warning: "border-yellow-500 bg-yellow-500/10 text-yellow-900",
                danger: "border-red-500 bg-red-500/10 text-red-900",
                success: "border-green-600 bg-green-500/10 text-green-900",
            };

            const icons = {
                default: <FiInfo size={24} className="text-[#00805b]" />,
                info: <FiInfo size={24} className="text-blue-500" />,
                warning: <FiAlertCircle size={24} className="text-yellow-500" />,
                danger: <FiAlertCircle size={24} className="text-red-500" />,
                success: <FiCheckCircle size={24} className="text-green-600" />,
            };

            return (
                <div className={`border-l-4 p-6 my-6 rounded-r-lg relative overflow-hidden flex gap-4 items-start shadow-md ${styles[type]}`}>
                     <div className="shrink-0 mt-1 opacity-90">{icons[type]}</div>
                     <div className="w-full">{newChildren}</div>
                </div>
            );
        }
    }

    // Normal paragraph (using div to avoid hydration errors with nested divs like images/code)
    return <div className="mb-6 leading-relaxed text-[#2a3648]">{children}</div>;
  },

  // ReactMarkdown 10 identifies blocks by their pre parent, not an inline prop.
  pre: ({ children }) => {
    const code = React.Children.only(children);
    const match = /language-(\S+)/.exec(code.props.className || "");
    const content = String(code.props.children ?? "").replace(/\n$/, "");

    return (
      <CodeBlock code={content} language={match ? match[1] : "plaintext"} className="my-6 border-white/10 shadow-2xl">
        <CodeBlockCopyButton />
      </CodeBlock>
    );
  },

  // Block code is consumed by pre; this handler only renders inline code.
  code: ({ node, className, children, ...props }) => {
    return (
      <code className="rounded border border-[#101828]/10 bg-[#101828]/5 px-1.5 py-0.5 font-mono text-sm text-[#00734a]" {...props}>
        {children}
      </code>
    );
  },
};
