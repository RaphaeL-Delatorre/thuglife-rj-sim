import type { SiteContent } from "@/lib/site.functions";

export type SearchHit = {
  id: string;
  group: string;
  section: string;
  icon: string;
  snippet: string;
  slug: string | null;
};

export function stripHtml(html: string) {
  return (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalize(v: string) {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function buildSearchIndex(content: SiteContent): SearchHit[] {
  const hits: SearchHit[] = [];
  const catById = new Map(content.categories.map((c) => [c.id, c]));

  for (const c of content.categories) {
    hits.push({
      id: `cat-${c.id}`,
      group: c.name,
      section: "CATEGORIA DE REGRAS",
      icon: c.icon || "📚",
      snippet: stripHtml(`${c.subtitle || ""} ${c.description || ""}`) || c.name,
      slug: c.slug,
    });
  }

  for (const s of content.sections) {
    const cat = s.category_id ? catById.get(s.category_id) : null;
    const group = cat ? cat.name : "Termos e Regras";
    const slug = cat ? cat.slug : null;
    const sectionLabel = s.title.toUpperCase();
    const body = stripHtml(s.body_html);
    if (body) {
      hits.push({
        id: `sec-${s.id}`,
        group,
        section: sectionLabel,
        icon: s.icon || (cat ? "📕" : "📋"),
        snippet: body,
        slug,
      });
    }
    const itens = content.rules.filter((r) => r.section_id === s.id);
    for (const r of itens) {
      const text = stripHtml(r.html) || `${r.code ? r.code + " " : ""}${r.text}`;
      if (!text) continue;
      hits.push({
        id: `rule-${r.id}`,
        group,
        section: sectionLabel,
        icon: s.icon || (cat ? "📕" : "📋"),
        snippet: text,
        slug,
      });
    }
  }

  for (const a of content.actions) {
    const body = stripHtml(a.html) || `Bandidos: ${a.bandidos} · Polícia: ${a.policia}`;
    hits.push({
      id: `action-${a.id}`,
      group: "Ações Disponíveis",
      section: (a.porte || a.nome).toUpperCase(),
      icon: a.icon || "🎯",
      snippet: `${a.nome} — ${body}`,
      slug: null,
    });
  }

  return hits;
}

export function searchHits(hits: SearchHit[], term: string) {
  const q = normalize(term.trim());
  if (!q) return [];
  return hits.filter((h) => normalize(`${h.group} ${h.section} ${h.snippet}`).includes(q));
}

export function excerpt(text: string, term: string, size = 150) {
  const q = normalize(term.trim());
  const idx = normalize(text).indexOf(q);
  if (idx < 0) return text.length > size ? `${text.slice(0, size)}...` : text;
  const start = Math.max(0, idx - 40);
  const slice = text.slice(start, start + size);
  return `${start > 0 ? "..." : ""}${slice}${start + size < text.length ? "..." : ""}`;
}
