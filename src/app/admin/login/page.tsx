"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Login failed.");
        return;
      }
      const from = params.get("from");
      router.push(from && from.startsWith("/admin") ? from : "/admin");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-charcoal bg-grain px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-lg font-extrabold tracking-[0.2em] text-ivory">
            GUILDBOURNE
          </p>
          <p className="mt-1 text-[10px] font-semibold tracking-[0.35em] text-gold">
            CONTENT MANAGEMENT
          </p>
        </div>
        <form
          onSubmit={submit}
          className="space-y-4 rounded-lg border border-white/10 bg-charcoal-soft p-6 shadow-2xl"
        >
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-ivory/80">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
              className="border-white/15 bg-charcoal text-ivory placeholder:text-ivory/30"
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button
            type="submit"
            disabled={busy || !password}
            className="w-full bg-gold text-charcoal hover:bg-gold-soft"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
