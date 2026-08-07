import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PanelHeader, RecordForm, useRecordEditor, type FieldDef, type RecordValues } from "./fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteRecord, saveRecord } from "@/lib/admin.functions";

export function CollectionPanel({
  title,
  description,
  table,
  permPrefix,
  fields,
  rows,
  columns,
  can,
  onChanged,
}: {
  title: string;
  description?: string;
  table: string;
  permPrefix: string;
  fields: FieldDef[];
  rows: RecordValues[];
  columns: { key: string; label: string }[];
  can: (perm: string) => boolean;
  onChanged: () => void;
}) {
  const save = useServerFn(saveRecord);
  const remove = useServerFn(deleteRecord);
  const { editing, setEditing, openNew, openEdit, close } = useRecordEditor(fields);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      await save({ data: { table, id: editing.id, values: editing.values } });
      toast.success("Salvo com sucesso.");
      close();
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar.");
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: string) => {
    if (!window.confirm("Excluir este registro?")) return;
    try {
      await remove({ data: { table, id } });
      toast.success("Excluído.");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir.");
    }
  };

  return (
    <div className="space-y-5">
      <PanelHeader
        title={title}
        description={description}
        action={
          can(`${permPrefix}.create`) ? <Button onClick={openNew}>Adicionar</Button> : undefined
        }
      />

      {rows.length === 0 ? (
        <EmptyState label="Nenhum registro cadastrado ainda." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card/70">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 font-semibold">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row["id"])} className="border-b border-border/60 last:border-0">
                  {columns.map((c) => (
                    <td key={c.key} className="max-w-[22rem] truncate px-4 py-3 align-top">
                      {Array.isArray(row[c.key])
                        ? (row[c.key] as string[]).join(", ")
                        : typeof row[c.key] === "boolean"
                          ? row[c.key]
                            ? "Sim"
                            : "Não"
                          : String(row[c.key] ?? "")}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {can(`${permPrefix}.edit`) && (
                      <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                        Editar
                      </Button>
                    )}
                    {can(`${permPrefix}.delete`) && (
                      <Button variant="ghost" size="sm" onClick={() => del(String(row["id"]))}>
                        Excluir
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar" : "Adicionar"} — {title}</DialogTitle>
          </DialogHeader>
          {editing && (
            <RecordForm
              fields={fields}
              values={editing.values}
              onChange={(values) => setEditing({ ...editing, values })}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={close}>
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
