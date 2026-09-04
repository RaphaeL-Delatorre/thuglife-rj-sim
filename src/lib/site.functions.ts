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
    db.from("news").select("id, tag, title, body, media_url, media_type, sort_order").order("sort_order"),
    db.from("faqs").select("id, question, answer, sort_order").order("sort_order"),
    db.from("rule_categories").select("id, name, slug, icon, subtitle, description, content_html, intro_html, outro_html, published, hidden, sort_order").eq("published", true).order("sort_order"),
    db.from("rule_sections").select("id, block, title, icon, body_html, category_id, sort_order").order("sort_order"),
    db.from("rules").select("id, section_id, code, text, html, sort_order").order("sort_order"),
    db.from("actions").select("id, porte, icon, nome, bandidos, policia, regras, html, sort_order").order("sort_order"),
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

export const getRuleCategory = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const db = publicClient();
    const { data: category } = await db
      .from("rule_categories")
      .select("id, name, slug, icon, subtitle, description, content_html, intro_html, outro_html, published, hidden, sort_order")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();

    if (!category) return { category: null, sections: [], rules: [], settings: {} as SiteSettings };

    const [settings, sections] = await Promise.all([
      db.from("site_settings").select("key, value").eq("key", "geral").maybeSingle(),
      db
        .from("rule_sections")
        .select("id, block, title, icon, body_html, category_id, sort_order")
        .eq("category_id", category.id)
        .order("sort_order"),
    ]);

    const ids = (sections.data ?? []).map((s) => s.id);
    const rules = ids.length
      ? await db.from("rules").select("id, section_id, code, text, html, sort_order").in("section_id", ids).order("sort_order")
      : { data: [] };

    return {
      category,
      sections: sections.data ?? [],
      rules: rules.data ?? [],
      settings: (settings.data?.value ?? {}) as SiteSettings,
    };
  });

export type RuleCategoryPage = Awaited<ReturnType<typeof getRuleCategory>>;
