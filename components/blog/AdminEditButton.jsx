"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Admin-only "Edit Post" affordance.
 *
 * Rendered as a client leaf so the surrounding post page stays static. It
 * asks /api/auth/me after mount and renders nothing for anonymous visitors,
 * which is also what the server used to render for them.
 */
export default function AdminEditButton({ postId }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { isAdmin: false }))
      .then((d) => {
        if (!cancelled) setIsAdmin(Boolean(d?.isAdmin));
      })
      .catch(() => {
        // A failed check simply means no button; never block the article.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isAdmin) return null;

  return (
    <div className="flex justify-end border-t border-[#101828]/10 pt-10">
      <Link href={`/blog/edit/${postId}`}>
        <Button
          variant="outline"
          className="border-[#101828]/20 text-[#101828] hover:bg-[#101828]/5 hover:text-[#101828]"
        >
          Edit Post
        </Button>
      </Link>
    </div>
  );
}
