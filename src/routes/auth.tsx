import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { bootstrapAdmin } from "@/lib/admin.functions";

const STORAGE_KEY = "tl-admin-login";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acesso administrativo" },
      { name: "description", content: "Área restrita da administração." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Acesso administrativo" },
      { property: "og:description", content: "Área restrita da administração." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void bootstrapAdmin().catch(() => undefined);
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { email?: string; password?: string };
        setEmail(parsed.email ?? "");
        setPassword(parsed.password ?? "");
        setRemember(true);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("E-mail ou senha incorretos.");
      setBusy(false);
      return;
    }
    if (remember) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, password }));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    await navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-16 font-body">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-border bg-card/85 p-8 shadow-[var(--shadow-glow)] backdrop-blur"
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Área restrita</p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-wide">Painel Administrativo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acesso exclusivo da equipe. Informe suas credenciais para continuar.
        </p>

        <div className="mt-8 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
            Salvar meu login neste navegador
          </label>
          {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
          <Button type="submit" disabled={busy} className="mt-2 w-full">
            {busy ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
