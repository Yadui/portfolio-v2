import LoginPageClient from "@/components/LoginPageClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginPageClient />;
}
