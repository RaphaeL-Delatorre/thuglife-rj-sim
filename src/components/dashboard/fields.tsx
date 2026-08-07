import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "list" | "switch";
  placeholder?: string;
};

export type RecordValues = Record<string, unknown>;

export function emptyValues(fields: FieldDef[]): RecordValues {
  const out: RecordValues = {};
  for (const f of fields) {
    out[f.key] = f.type === "number" ? 0 : f.type === "switch" ? true : f.type === "list" ? [] : "";
  }
  return out;
}

export function RecordForm({
  fields,
  values,
  onChange,
}: {
  fields: FieldDef[];
  values: RecordValues;
  onChange: (values: RecordValues) => void;
}) {
  const set = (key: string, value: unknown) => onChange({ ...values, [key]: value });

  return (
    <div className="grid gap-4">
      {fields.map((f) => (
        <div key={f.key} className="grid gap-2">
          <Label htmlFor={f.key} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {f.label}
          </Label>
          {f.type === "textarea" && (
            <Textarea
              id={f.key}
              rows={4}
              value={String(values[f.key] ?? "")}
              placeholder={f.placeholder}
              onChange={(e) => set(f.key, e.target.value)}
            />
          )}
          {f.type === "list" && (
            <Textarea
              id={f.key}
              rows={4}
              placeholder="Uma linha por item"
              value={(Array.isArray(values[f.key]) ? (values[f.key] as string[]) : []).join("\n")}
              onChange={(e) => set(f.key, e.target.value.split("\n").map((v) => v.trim()).filter(Boolean))}
            />
          )}
          {f.type === "number" && (
            <Input
              id={f.key}
              type="number"
              value={Number(values[f.key] ?? 0)}
              onChange={(e) => set(f.key, Number(e.target.value))}
            />
          )}
          {f.type === "switch" && (
            <Switch id={f.key} checked={Boolean(values[f.key])} onCheckedChange={(v) => set(f.key, v)} />
          )}
          {f.type === "text" && (
            <Input
              id={f.key}
              value={String(values[f.key] ?? "")}
              placeholder={f.placeholder}
              onChange={(e) => set(f.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function useRecordEditor(fields: FieldDef[]) {
  const [editing, setEditing] = useState<{ id: string | null; values: RecordValues } | null>(null);
  const openNew = () => setEditing({ id: null, values: emptyValues(fields) });
  const openEdit = (row: RecordValues) => {
    const values: RecordValues = {};
    for (const f of fields) values[f.key] = row[f.key] ?? emptyValues([f])[f.key];
    setEditing({ id: String(row["id"]), values });
  };
  return { editing, setEditing, openNew, openEdit, close: () => setEditing(null) };
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string | undefined;
  action?: React.ReactNode | undefined;

}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl uppercase tracking-wide">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export { Button };
