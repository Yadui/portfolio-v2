"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPageClient() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      router.push("/blog");
      router.refresh();
      return;
    }

    if (response.status === 403) {
      setError("Login is not available from this IP address.");
      return;
    }

    setError("Invalid credentials");
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="absolute left-6 top-6">
        <Link href="/">
          <Button variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10 hover:text-white">
            ← Home
          </Button>
        </Link>
      </div>

      <div className="container mx-auto flex min-h-screen items-center justify-center pt-20">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-md">
          <h1 className="mb-6 text-center text-3xl font-bold text-white">Admin Login</h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-white/60">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="border-white/10 bg-black/40 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="border-white/10 bg-black/40 text-white"
                required
              />
            </div>

            {error ? <p className="text-center text-sm text-red-400">{error}</p> : null}

            <Button type="submit" className="w-full bg-accent font-bold text-primary hover:bg-accent/90">
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}