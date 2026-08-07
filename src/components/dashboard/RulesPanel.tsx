import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PanelHeader, RecordForm, type FieldDef, type RecordValues } from "./fields";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteRecord, saveRecord } from "@/lib/admin.functions";

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

type Draft = {
  kind: "section" | "rule";
  id: string | null;
  values: RecordValues;
};

type Group = { key: string; label: string; categoryId: string | null; block: string };

export function RulesPanel({
  sections,
  rules,
  categories,
  can,
  onChanged,
}: {
  sections: RuleSection[];
  rules: RuleItem[];
  categories: RuleCategory[];
  can: (perm: string) => boolean;
  onChanged: () => void;
}) {
  const save = useServerFn(saveRecord);
  const remove = useServerFn(deleteRecord);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  const sectionFields: FieldDef[] = [
    { key: "title", label: "Título da seção", type: "text", placeholder: "Ex.: 1. Negociações e Sequestros" },
    { key: "icon", label: "Ícone / emoji", type: "text", placeholder: "Ex.: 🎯" },
    {
      key: "category_id",
      label: "Página (categoria)",
      type: "select",
      options: [
        { label: "Página geral /regras", value: "" },
        ...categories.map((c) => ({ label: c.name, value: c.id })),
      ],
      hint: "Escolha em qual página esta seção aparece.",
    },
    {
      key: "block",
      label: "Bloco na página geral",
      type: "select",
      options: [
        { label: "Termos e Condições de Uso", value: "termos" },
        { label: "Regras Gerais do Roleplay", value: "gerais" },
      ],
    },
    { key: "body_html", label: "Conteúdo formatado da seção", type: "richtext" },
    { key: "sort_order", label: "Ordem", type: "number" },
  ];

  const submit = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      const values = { ...draft.values };
      if (draft.kind === "section" && !values["category_id"]) values["category_id"] = null;
      await save({
        data: {
          table: draft.kind === "section" ? "rule_sections" : "rules",
          id: draft.id,
          values,
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

  const groups: Group[] = [
    { key: "termos", label: "Página geral · Termos e Condições de Uso", categoryId: null, block: "termos" },
    { key: "gerais", label: "Página geral · Regras Gerais do Roleplay", categoryId: null, block: "gerais" },
    ...categories.map((c) => ({
      key: c.id,
      label: `Página /regras/${c.slug} · ${c.name}`,
      categoryId: c.id,
      block: "termos",
    })),
  ];

  const newSection = (group: Group, count: number) =>
    setDraft({
      kind: "section",
      id: null,
      values: {
        title: "",
        icon: "",
        category_id: group.categoryId ?? "",
        block: group.block,
        body_html: "",
        sort_order: count + 1,
      },
    });

  return (
    <div className="space-y-10">
      <PanelHeader
        title="Regras do servidor"
        description="Cada categoria é uma página própria. Organize as seções e escreva o conteúdo com o editor completo."
      />

      {groups.map((group) => {
        const groupSections = sections
          .filter((s) =>
            group.categoryId
              ? s.category_id === group.categoryId
              : !s.category_id && s.block === group.block,
          )
          .sort((a, b) => a.sort_order - b.sort_order);

        return (
          <div key={group.key} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2">
              <h3 className="font-display text-lg uppercase tracking-wide text-primary">{group.label}</h3>
              {can("rules.create") && (
                <Button size="sm" onClick={() => newSection(group, groupSections.length)}>
                  Nova seção
                </Button>
              )}
            </div>

            {groupSections.length === 0 ? (
              <EmptyState label="Nenhuma seção aqui ainda." />
            ) : (
              groupSections.map((section) => {
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
                                  icon: section.icon ?? "",
                                  category_id: section.category_id ?? "",
                                  block: section.block,
                                  body_html: section.body_html ?? "",
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
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {draft?.id ? "Editar" : "Nova"} {draft?.kind === "section" ? "seção" : "regra"}
            </DialogTitle>
          </DialogHeader>
          {draft && (
            <RecordForm
              fields={draft.kind === "section" ? sectionFields : RULE_FIELDS}
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
