import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PanelHeader, RecordForm, type FieldDef, type RecordValues } from "./fields";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { deleteRecord, saveRecord, saveSettings } from "@/lib/admin.functions";

export type RuleSection = {
  id: string;
  block: string;
  title: string;
  icon: string;
  body_html: string;
  category_id: string | null;
  sort_order: number;
};
export type RuleItem = {
  id: string;
  section_id: string;
  code: string;
  text: string;
  html: string;
  sort_order: number;
};
export type RuleCategory = { id: string; name: string; slug: string };

const RULE_FIELDS: FieldDef[] = [
  { key: "code", label: "Código", type: "text", placeholder: "Ex.: 2.1 ou G1" },
  { key: "text", label: "Texto simples (usado na busca e como reserva)", type: "textarea" },
  {
    key: "html",
    label: "Conteúdo formatado",
    type: "richtext",
    hint: "Se preenchido, este conteúdo formatado é o que aparece no site.",
  },
  { key: "sort_order", label: "Ordem", type: "number" },
];

const SECTION_FIELDS: FieldDef[] = [
  { key: "title", label: "Título do bloco", type: "text", placeholder: "Ex.: 1. Acesso à Cidade" },
  { key: "icon", label: "Ícone / emoji", type: "text", placeholder: "Ex.: 📘" },
  { key: "body_html", label: "Conteúdo formatado do bloco", type: "richtext" },
  { key: "sort_order", label: "Ordem", type: "number" },
];

type Draft = { kind: "section" | "rule"; id: string | null; values: RecordValues };

const TEXT_BLOCKS: { key: string; label: string; hint: string }[] = [
  { key: "rulesTopHtml", label: "Texto do início da página", hint: "Aparece no topo, antes dos menus." },
  {
    key: "actionsIntroHtml",
    label: "Texto das Ações Disponíveis",
    hint: "Aparece acima da lista de ações.",
  },
  { key: "rulesBottomHtml", label: "Texto do final da página", hint: "Aparece depois das ações." },
];

export function RulesPanel({
  sections,
  rules,
  settings,
  can,
  onChanged,
}: {
  sections: RuleSection[];
  rules: RuleItem[];
  settings: Record<string, string>;
  can: (perm: string) => boolean;
  onChanged: () => void;
}) {
  const save = useServerFn(saveRecord);
  const remove = useServerFn(deleteRecord);
  const persistSettings = useServerFn(saveSettings);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [texts, setTexts] = useState<Record<string, string>>(settings);
  const [savingTexts, setSavingTexts] = useState(false);

  const saveTexts = async () => {
    setSavingTexts(true);
    try {
      await persistSettings({ data: { values: texts } });
      toast.success("Textos atualizados.");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar.");
    } finally {
      setSavingTexts(false);
    }
  };

  const submit = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      await save({
        data: {
          table: draft.kind === "section" ? "rule_sections" : "rules",
          id: draft.id,
          values: draft.values,
        },
      });
      toast.success("Salvo com sucesso.");
      setDraft(null);
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar.");
    } finally {
      setBusy(false);
    }
  };

  const del = async (table: string, id: string, label: string) => {
    if (!window.confirm(`Excluir ${label}?`)) return;
    try {
      await remove({ data: { table, id } });
      toast.success("Excluído.");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir.");
    }
  };

  const termos = sections
    .filter((s) => !s.category_id && s.block === "termos")
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-10">
      <PanelHeader
        title="Página de regras"
        description="Aqui você controla apenas a página /regras: os textos do início e do fim, o menu Termos e Condições de Uso e o texto das ações."
        action={
          can("site.edit") ? (
            <Button onClick={saveTexts} disabled={savingTexts}>
              {savingTexts ? "Salvando..." : "Salvar textos"}
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-8">
        <div className="grid gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Título do menu de termos
          </Label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={texts["termsTitle"] ?? ""}
            placeholder="Termos e Condições de Uso"
            onChange={(e) => setTexts({ ...texts, termsTitle: e.target.value })}
          />
        </div>
        {TEXT_BLOCKS.map((b) => (
          <div key={b.key} className="grid gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {b.label}
            </Label>
            <p className="text-xs text-muted-foreground">{b.hint}</p>
            <RichTextEditor
              value={texts[b.key] ?? ""}
              onChange={(html) => setTexts({ ...texts, [b.key]: html })}
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2">
          <h3 className="font-display text-lg uppercase tracking-wide text-primary">
            Conteúdo do menu “Termos e Condições de Uso”
          </h3>
          {can("rules.create") && (
            <Button
              size="sm"
              onClick={() =>
                setDraft({
                  kind: "section",
                  id: null,
                  values: {
                    title: "",
                    icon: "",
                    category_id: null,
                    block: "termos",
                    body_html: "",
                    sort_order: termos.length + 1,
                  },
                })
              }
            >
              Novo bloco
            </Button>
          )}
        </div>

        {termos.length === 0 ? (
          <EmptyState label="Nenhum bloco de termos ainda." />
        ) : (
          termos.map((section) => {
            const items = rules
              .filter((r) => r.section_id === section.id)
              .sort((a, b) => a.sort_order - b.sort_order);
            return (
              <div key={section.id} className="rounded-xl border border-border bg-card/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="font-display text-base uppercase tracking-wide">
                    {section.icon && <span className="mr-2">{section.icon}</span>}
                    {section.title}
                  </h4>
                  <div className="flex gap-1">
                    {can("rules.create") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDraft({
                            kind: "rule",
                            id: null,
                            values: {
                              section_id: section.id,
                              code: "",
                              text: "",
                              html: "",
                              sort_order: items.length + 1,
                            },
                          })
                        }
                      >
                        + Item
                      </Button>
                    )}
                    {can("rules.edit") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDraft({
                            kind: "section",
                            id: section.id,
                            values: {
                              title: section.title,
                              icon: section.icon ?? "",
                              category_id: null,
                              block: "termos",
                              body_html: section.body_html ?? "",
                              sort_order: section.sort_order,
                            },
                          })
                        }
                      >
                        Editar bloco
                      </Button>
                    )}
                    {can("rules.delete") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => del("rule_sections", section.id, "este bloco e seus itens")}
                      >
                        Excluir bloco
                      </Button>
                    )}
                  </div>
                </div>

                <ul className="mt-4 space-y-2">
                  {items.length === 0 && (
                    <li className="text-sm text-muted-foreground">Nenhum item neste bloco.</li>
                  )}
                  {items.map((rule) => (
                    <li
                      key={rule.id}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-4 py-3"
                    >
                      <p className="flex-1 text-sm text-muted-foreground">
                        {rule.code && <strong className="mr-2 text-primary">{rule.code}</strong>}
                        {rule.text ||
                          (rule.html ? rule.html.replace(/<[^>]*>/g, " ").slice(0, 120) : "—")}
                      </p>
                      <div className="flex gap-1">
                        {can("rules.edit") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDraft({
                                kind: "rule",
                                id: rule.id,
                                values: {
                                  section_id: rule.section_id,
                                  code: rule.code,
                                  text: rule.text,
                                  html: rule.html ?? "",
                                  sort_order: rule.sort_order,
                                },
                              })
                            }
                          >
                            Editar
                          </Button>
                        )}
                        {can("rules.delete") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => del("rules", rule.id, `o item ${rule.code}`)}
                          >
                            Excluir
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {draft?.id ? "Editar" : "Novo"} {draft?.kind === "section" ? "bloco" : "item"}
            </DialogTitle>
          </DialogHeader>
          {draft && (
            <RecordForm
              fields={draft.kind === "section" ? SECTION_FIELDS : RULE_FIELDS}
              values={draft.values}
              onChange={(values) => setDraft({ ...draft, values })}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={busy}>
              {busy ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
