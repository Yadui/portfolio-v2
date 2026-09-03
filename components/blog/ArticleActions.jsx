"use client";

import { useEffect, useState } from "react";
import {
  FiBookmark,
  FiCheck,
  FiHeart,
  FiLink,
  FiLinkedin,
  FiTwitter,
} from "react-icons/fi";

/**
 * ArticleActions keeps the article rail honest and useful.
 *
 * Like and save are reader-local preferences, not public engagement metrics:
 * there is no backing API or shared count in this portfolio, so displaying a
 * number would imply data that does not exist. The preferences persist in the
 * current browser only. Share buttons are real links/actions and work on both
 * the desktop rail and the mobile action row.
 */
export default function ArticleActions({ slug, title, url }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      setLiked(window.localStorage.getItem(`article-like:${slug}`) === "true");
      setSaved(window.localStorage.getItem(`article-save:${slug}`) === "true");
    } catch {
      // Private browsing and storage-disabled browsers still get working
      // in-memory controls.
    }
  }, [slug]);

  const toggle = (kind, value, setter) => {
    const next = !value;
    setter(next);
    try {
      window.localStorage.setItem(`article-${kind}:${slug}`, String(next));
    } catch {
      // Keep the interaction responsive even when storage is unavailable.
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const actions = [
    {
      label: liked ? "Unlike" : "Like",
      pressed: liked,
      onClick: () => toggle("like", liked, setLiked),
      icon: <FiHeart size={20} className={liked ? "fill-current" : ""} />,
      active: liked ? "text-[#c2410c]" : "hover:text-[#c2410c]",
    },
    {
      label: saved ? "Remove bookmark" : "Bookmark",
      pressed: saved,
      onClick: () => toggle("save", saved, setSaved),
      icon: <FiBookmark size={20} className={saved ? "fill-current" : ""} />,
      active: saved ? "text-[#00805b]" : "hover:text-[#00805b]",
    },
  ];

  return (
    <div className="article-actions" aria-label="Article actions">
      <div className="article-actions-group">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            aria-label={action.label}
            aria-pressed={action.pressed}
            title={action.label}
            onClick={action.onClick}
            className={`article-action-button ${action.active}`}
          >
            {action.icon}
          </button>
        ))}
      </div>

      <div className="article-actions-rule" aria-hidden="true" />

      <div className="article-actions-group">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          title="Share on X"
          className="article-action-button hover:text-[#101828]"
        >
          <FiTwitter size={19} />
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          title="Share on LinkedIn"
          className="article-action-button hover:text-[#101828]"
        >
          <FiLinkedin size={19} />
        </a>
        <button
          type="button"
          aria-label={copied ? "Link copied" : "Copy article link"}
          title={copied ? "Link copied" : "Copy article link"}
          onClick={copyLink}
          className="article-action-button hover:text-[#101828]"
        >
          {copied ? <FiCheck size={19} /> : <FiLink size={19} />}
        </button>
      </div>
    </div>
  );
}
