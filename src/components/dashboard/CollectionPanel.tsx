import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, SquarePen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  EmptyState,
  PanelHeader,
  RecordForm,
  useRecordEditor,
  type FieldDef,
  type RecordValues,
} from "./fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteRecord, saveRecord } from "@/lib/admin.functions";

function CellValue({ columnKey, value }: { columnKey: string; value: unknown }) {
  if (columnKey === "media_url") {
    const url = String(value ?? "");
    if (!url) return <span className="text-xs text-muted-foreground">—</span>;
    return (
      <img
        src={url}
        alt="Prévia da mídia"
        className="h-10 w-16 rounded-md border border-border object-cover"
        loading="lazy"
      />
    );
  }
  if (typeof value === "boolean") {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
          value ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
        }`}
      >
        {value ? "Sim" : "Não"}
      </span>
    );
  }
  if (Array.isArray(value)) return (value as string[]).join(", ");
  const text = String(value ?? "");
  return text || <span className="text-xs text-muted-foreground">—</span>;
}

export function CollectionPanel({
  title,
  description,
  table,
  permPrefix,
  fields,
  rows,
  columns,
  addLabel,
  emptyLabel,
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
  addLabel?: string;
  emptyLabel?: string;
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
    if (!window.confirm("Excluir este registro? Esta ação não pode ser desfeita.")) return;
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
          can(`${permPrefix}.create`) ? (
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" /> {addLabel ?? "Adicionar"}
            </Button>
          ) : undefined
        }
      />

      {rows.length === 0 ? (
        <div className="grid gap-4">
          <EmptyState label={emptyLabel ?? "Nenhum registro cadastrado ainda."} />
          {can(`${permPrefix}.create`) && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={openNew}>
                <Plus className="h-4 w-4" /> {addLabel ?? "Adicionar"} agora
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card/70 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {rows.length} {rows.length === 1 ? "registro" : "registros"}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="px-4 py-2.5 font-semibold">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={String(row["id"])}
                    className="border-b border-border/50 transition-colors last:border-0 hover:bg-secondary/20"
                  >
                    {columns.map((c) => (
                      <td key={c.key} className="max-w-[22rem] truncate px-4 py-2.5 align-middle">
                        <CellValue columnKey={c.key} value={row[c.key]} />
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      {can(`${permPrefix}.edit`) && (
                        <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                          <SquarePen className="h-3.5 w-3.5" /> Editar
                        </Button>
                      )}
                      {can(`${permPrefix}.delete`) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => del(String(row["id"]))}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Excluir
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Editar" : "Novo"} — {title}
            </DialogTitle>
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
