import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PanelHeader, RecordForm, type FieldDef, type RecordValues } from "./fields";
import type { RuleCategory, RuleItem, RuleSection } from "./RulesPanel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteRecord, saveRecord } from "@/lib/admin.functions";

const MENU_FIELDS: FieldDef[] = [
  { key: "title", label: "Título do menu", type: "text", placeholder: "Ex.: 1. Tempo de Comparecimento" },
  { key: "icon", label: "Ícone / emoji", type: "text", placeholder: "Ex.: ⏰" },
  {
    key: "body_html",
    label: "Conteúdo do menu",
    type: "richtext",
    hint: "Aparece ao abrir o menu na página da categoria.",
  },
  { key: "sort_order", label: "Ordem", type: "number" },
];

const ITEM_FIELDS: FieldDef[] = [
  { key: "code", label: "Código", type: "text", placeholder: "Ex.: 1.1" },
  { key: "text", label: "Texto simples (usado na busca e como reserva)", type: "textarea" },
  { key: "html", label: "Conteúdo formatado", type: "richtext" },
  { key: "sort_order", label: "Ordem", type: "number" },
];

type Draft = { kind: "menu" | "item"; id: string | null; values: RecordValues };

export function CategoryMenusPanel({
  categories,
  sections,
  rules,
  can,
  onChanged,
}: {
  categories: RuleCategory[];
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
          table: draft.kind === "menu" ? "rule_sections" : "rules",
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
        title="Menus das categorias"
        description="Cada menu é uma sanfona que abre na página da categoria. Adicione menus e, dentro deles, os itens/regras."
      />

      {categories.length === 0 && <EmptyState label="Cadastre uma categoria primeiro." />}

      {categories.map((category) => {
        const menus = sections
          .filter((s) => s.category_id === category.id)
          .sort((a, b) => a.sort_order - b.sort_order);

        return (
          <div key={category.id} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2">
              <h3 className="font-display text-lg uppercase tracking-wide text-primary">
                {category.name} <span className="text-muted-foreground">/regras/{category.slug}</span>
              </h3>
              {can("rules.create") && (
                <Button
                  size="sm"
                  onClick={() =>
                    setDraft({
                      kind: "menu",
                      id: null,
                      values: {
                        title: "",
                        icon: "",
                        category_id: category.id,
                        block: "termos",
                        body_html: "",
                        sort_order: menus.length + 1,
                      },
                    })
                  }
                >
                  + Novo menu
                </Button>
              )}
            </div>

            {menus.length === 0 ? (
              <EmptyState label="Nenhum menu nesta categoria ainda." />
            ) : (
              menus.map((menu) => {
                const items = rules
                  .filter((r) => r.section_id === menu.id)
                  .sort((a, b) => a.sort_order - b.sort_order);
                return (
                  <div key={menu.id} className="rounded-xl border border-border bg-card/70 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h4 className="font-display text-base uppercase tracking-wide">
                        {menu.icon && <span className="mr-2">{menu.icon}</span>}
                        {menu.title}
                      </h4>
                      <div className="flex gap-1">
                        {can("rules.create") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDraft({
                                kind: "item",
                                id: null,
                                values: {
                                  section_id: menu.id,
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
                                kind: "menu",
                                id: menu.id,
                                values: {
                                  title: menu.title,
                                  icon: menu.icon ?? "",
                                  category_id: category.id,
                                  block: menu.block,
                                  body_html: menu.body_html ?? "",
                                  sort_order: menu.sort_order,
                                },
                              })
                            }
                          >
                            Editar menu
                          </Button>
                        )}
                        {can("rules.delete") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => del("rule_sections", menu.id, "este menu e seus itens")}
                          >
                            Excluir menu
                          </Button>
                        )}
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {items.length === 0 && (
                        <li className="text-sm text-muted-foreground">Nenhum item neste menu.</li>
                      )}
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-4 py-3"
                        >
                          <p className="flex-1 text-sm text-muted-foreground">
                            {item.code && <strong className="mr-2 text-primary">{item.code}</strong>}
                            {item.text ||
                              (item.html ? item.html.replace(/<[^>]*>/g, " ").slice(0, 120) : "—")}
                          </p>
                          <div className="flex gap-1">
                            {can("rules.edit") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setDraft({
                                    kind: "item",
                                    id: item.id,
                                    values: {
                                      section_id: item.section_id,
                                      code: item.code,
                                      text: item.text,
                                      html: item.html ?? "",
                                      sort_order: item.sort_order,
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
                                onClick={() => del("rules", item.id, `o item ${item.code}`)}
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
              {draft?.id ? "Editar" : "Novo"} {draft?.kind === "menu" ? "menu" : "item"}
            </DialogTitle>
          </DialogHeader>
          {draft && (
            <RecordForm
              fields={draft.kind === "menu" ? MENU_FIELDS : ITEM_FIELDS}
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
