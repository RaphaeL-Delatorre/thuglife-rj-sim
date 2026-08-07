import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PanelHeader, RecordForm, type FieldDef, type RecordValues } from "./fields";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteRecord, saveRecord } from "@/lib/admin.functions";

export type RuleSection = { id: string; block: string; title: string; sort_order: number };
export type RuleItem = { id: string; section_id: string; code: string; text: string; sort_order: number };

const BLOCKS = [
  { key: "termos", label: "Termos e Condições de Uso" },
  { key: "gerais", label: "Regras Gerais do Roleplay" },
];

const SECTION_FIELDS: FieldDef[] = [
  { key: "title", label: "Título da seção", type: "text", placeholder: "Ex.: 1. Acesso à Cidade" },
  { key: "block", label: "Bloco (termos ou gerais)", type: "text", placeholder: "termos" },
  { key: "sort_order", label: "Ordem", type: "number" },
];

const RULE_FIELDS: FieldDef[] = [
  { key: "code", label: "Código", type: "text", placeholder: "Ex.: 1.1 ou G1" },
  { key: "text", label: "Texto da regra", type: "textarea" },
  { key: "sort_order", label: "Ordem", type: "number" },
];

type Draft = {
  kind: "section" | "rule";
  id: string | null;
  values: RecordValues;
};

export function RulesPanel({
  sections,
  rules,
  can,
  onChanged,
}: {
  sections: RuleSection[];
  rules: RuleItem[];
  can: (perm: string) => boolean;
  onChanged: () => void;
}) {
  const save = useServerFn(saveRecord);
  const remove = useServerFn(deleteRecord);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

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

  return (
    <div className="space-y-8">
      <PanelHeader
        title="Regras do servidor"
        description="Organize as seções e cada regra individualmente. Tudo aparece na página /regras."
        action={
          can("rules.create") ? (
            <Button
              onClick={() =>
                setDraft({
                  kind: "section",
                  id: null,
                  values: { title: "", block: "termos", sort_order: sections.length + 1 },
                })
              }
            >
              Nova seção
            </Button>
          ) : undefined
        }
      />

      {BLOCKS.map((block) => {
        const blockSections = sections.filter((s) => s.block === block.key);
        return (
          <div key={block.key} className="space-y-4">
            <h3 className="font-display text-lg uppercase tracking-wide text-primary">{block.label}</h3>
            {blockSections.length === 0 ? (
              <EmptyState label="Nenhuma seção neste bloco." />
            ) : (
              blockSections.map((section) => {
                const items = rules
                  .filter((r) => r.section_id === section.id)
                  .sort((a, b) => a.sort_order - b.sort_order);
                return (
                  <div key={section.id} className="rounded-xl border border-border bg-card/70 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h4 className="font-display text-base uppercase tracking-wide">{section.title}</h4>
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
                                  sort_order: items.length + 1,
                                },
                              })
                            }
                          >
                            + Regra
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
                                  block: section.block,
                                  sort_order: section.sort_order,
                                },
                              })
                            }
                          >
                            Editar seção
                          </Button>
                        )}
                        {can("rules.delete") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => del("rule_sections", section.id, "esta seção e suas regras")}
                          >
                            Excluir seção
                          </Button>
                        )}
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {items.length === 0 && (
                        <li className="text-sm text-muted-foreground">Nenhuma regra nesta seção.</li>
                      )}
                      {items.map((rule) => (
                        <li
                          key={rule.id}
                          className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-4 py-3"
                        >
                          <p className="flex-1 text-sm text-muted-foreground">
                            <strong className="mr-2 text-primary">{rule.code}</strong>
                            {rule.text}
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
                                onClick={() => del("rules", rule.id, `a regra ${rule.code}`)}
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
        );
      })}

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {draft?.id ? "Editar" : "Nova"} {draft?.kind === "section" ? "seção" : "regra"}
            </DialogTitle>
          </DialogHeader>
          {draft && (
            <RecordForm
              fields={draft.kind === "section" ? SECTION_FIELDS : RULE_FIELDS}
              values={draft.values}
              onChange={(values) => setDraft({ ...draft, values: { ...draft.values, ...values } })}
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
