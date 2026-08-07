import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type SiteSettings = Record<string, string>;

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const [settings, stats, requirements, news, faqs, categories, sections, rules, actions] = await Promise.all([
    db.from("site_settings").select("key, value").eq("key", "geral").maybeSingle(),
    db.from("site_stats").select("id, value, label, sub, sort_order").order("sort_order"),
    db.from("requirements").select("id, num, title, description, sort_order").order("sort_order"),
    db.from("news").select("id, tag, title, body, sort_order").order("sort_order"),
    db.from("faqs").select("id, question, answer, sort_order").order("sort_order"),
    db.from("rule_categories").select("id, name, sort_order").order("sort_order"),
    db.from("rule_sections").select("id, block, title, sort_order").order("sort_order"),
    db.from("rules").select("id, section_id, code, text, sort_order").order("sort_order"),
    db.from("actions").select("id, porte, nome, bandidos, policia, regras, sort_order").order("sort_order"),
  ]);

  return {
    settings: (settings.data?.value ?? {}) as SiteSettings,
    stats: stats.data ?? [],
    requirements: requirements.data ?? [],
    news: news.data ?? [],
    faqs: faqs.data ?? [],
    categories: categories.data ?? [],
    sections: sections.data ?? [],
    rules: rules.data ?? [],
    actions: actions.data ?? [],
  };
});

export type SiteContent = Awaited<ReturnType<typeof getSiteContent>>;
