import { useRef, useState } from "react";
import { toast } from "sonner";

import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { mediaKindFromUrl, uploadMediaFile, type MediaKind } from "@/lib/media";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "list" | "switch" | "richtext" | "select" | "media";
  placeholder?: string;
  options?: { label: string; value: string }[];
  hint?: string;
  mediaTypeKey?: string;
};

export type RecordValues = Record<string, unknown>;

function youtubeEmbedUrl(url: string) {
  const match = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function MediaField({
  field,
  values,
  onChange,
}: {
  field: FieldDef;
  values: RecordValues;
  onChange: (url: string, kind: MediaKind) => void;
}) {
  const pickerRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const url = String(values[field.key] ?? "");
  const storedKind = String(values[field.mediaTypeKey ?? ""] ?? "");
  const kind: MediaKind = storedKind === "video" ? "video" : mediaKindFromUrl(url);
  const embed = kind === "video" ? youtubeEmbedUrl(url) : null;

  const chooseFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const media = await uploadMediaFile(file, "news");
      onChange(media.url, media.kind);
      toast.success("Arquivo enviado e pronto para publicar.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar o arquivo.");
    } finally {
      setUploading(false);
      if (pickerRef.current) pickerRef.current.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Input
          id={field.key}
          type="url"
          value={url}
          placeholder="Cole o link de uma imagem, vídeo ou YouTube"
          onChange={(event) =>
            onChange(event.target.value, mediaKindFromUrl(event.target.value, kind))
          }
        />
        <input
          ref={pickerRef}
          className="hidden"
          type="file"
          accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
          onChange={(event) => void chooseFile(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => pickerRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Enviando..." : "Escolher arquivo"}
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Aceita imagem, vídeo MP4/WebM ou link do YouTube.
        </p>
        <div className="flex rounded-md border border-border p-0.5 text-xs font-semibold">
          {(["image", "video"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(url, option)}
              className={`rounded px-2 py-1 transition-colors ${kind === option ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {option === "image" ? "Imagem" : "Vídeo"}
            </button>
          ))}
        </div>
      </div>
      {url && (
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-background/40">
          {kind === "image" ? (
            <img src={url} alt="Prévia da mídia" className="h-40 w-full object-cover" />
          ) : embed ? (
            <div className="aspect-video w-full bg-black">
              <iframe
                src={embed}
                title="Prévia do vídeo"
                className="h-full w-full border-0"
                allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              src={url}
              className="h-40 w-full bg-black object-cover"
              controls
              playsInline
              preload="metadata"
            />
          )}
        </div>
      )}
    </div>
  );
}

export function emptyValues(fields: FieldDef[]): RecordValues {
  const out: RecordValues = {};
  for (const f of fields) {
    out[f.key] = f.type === "number" ? 0 : f.type === "switch" ? true : f.type === "list" ? [] : "";
    if (f.type === "media" && f.mediaTypeKey) out[f.mediaTypeKey] = "image";
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
          <Label
            htmlFor={f.key}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
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
              onChange={(e) =>
                set(
                  f.key,
                  e.target.value
                    .split("\n")
                    .map((v) => v.trim())
                    .filter(Boolean),
                )
              }
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
            <Switch
              id={f.key}
              checked={Boolean(values[f.key])}
              onCheckedChange={(v) => set(f.key, v)}
            />
          )}
          {f.type === "select" && (
            <select
              id={f.key}
              value={String(values[f.key] ?? "")}
              onChange={(e) => set(f.key, e.target.value || null)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            >
              {(f.options ?? []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
          {f.type === "richtext" && (
            <RichTextEditor
              value={String(values[f.key] ?? "")}
              onChange={(html) => set(f.key, html)}
            />
          )}
          {f.type === "media" && (
            <MediaField
              field={f}
              values={values}
              onChange={(url, kind) =>
                onChange({
                  ...values,
                  [f.key]: url,
                  ...(f.mediaTypeKey ? { [f.mediaTypeKey]: kind } : {}),
                })
              }
            />
          )}
          {f.type === "text" && (
            <Input
              id={f.key}
              value={String(values[f.key] ?? "")}
              placeholder={f.placeholder}
              onChange={(e) => set(f.key, e.target.value)}
            />
          )}
          {f.hint && <p className="text-[11px] text-muted-foreground">{f.hint}</p>}
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
    for (const f of fields) {
      values[f.key] = row[f.key] ?? emptyValues([f])[f.key];
      if (f.type === "media" && f.mediaTypeKey)
        values[f.mediaTypeKey] = row[f.mediaTypeKey] ?? "image";
    }
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
