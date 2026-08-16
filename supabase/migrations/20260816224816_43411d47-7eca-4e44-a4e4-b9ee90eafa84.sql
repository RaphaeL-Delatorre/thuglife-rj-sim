ALTER TABLE public.rule_categories
  ADD COLUMN IF NOT EXISTS intro_html text NOT NULL DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS outro_html text NOT NULL DEFAULT ''::text;