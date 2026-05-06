import { notFound } from "next/navigation";

import LoginPageClient from "@/components/LoginPageClient";
import { isCurrentRequestFromAllowedAdminIp } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const isAllowed = await isCurrentRequestFromAllowedAdminIp();

  if (!isAllowed) {
    notFound();
  }

  return <LoginPageClient />;
}
