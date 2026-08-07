ALTER TABLE public.rule_categories
  ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS subtitle text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS content_html text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;

ALTER TABLE public.rule_sections
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.rule_categories(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS body_html text NOT NULL DEFAULT '';

ALTER TABLE public.rules
  ADD COLUMN IF NOT EXISTS html text NOT NULL DEFAULT '';

UPDATE public.rule_categories
SET slug = regexp_replace(
      lower(translate(name, 'ÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇáàãâäéèêëíìîïóòõôöúùûüç', 'AAAAAEEEEIIIIOOOOOUUUUCaaaaaeeeeiiiiooooouuuuc')),
      '[^a-z0-9]+', '-', 'g')
WHERE slug = '';

UPDATE public.rule_categories SET slug = trim(both '-' from slug);

CREATE UNIQUE INDEX IF NOT EXISTS rule_categories_slug_key ON public.rule_categories (slug);