import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-[#101828]/15 bg-white/85 px-4 py-5 text-base text-[#101828] placeholder:text-[#8892a4] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00b86b] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
