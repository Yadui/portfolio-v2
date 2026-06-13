import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-[48px] rounded-md border border-[#101828]/15 bg-white/85 px-4 py-5 text-base font-light text-[#101828] outline-none placeholder:text-[#8892a4] focus:border-[#00b86b]",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
