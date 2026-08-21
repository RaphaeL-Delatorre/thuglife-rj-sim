import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, LayoutPanelTop, Palette, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { PanelHeader } from "./fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveSettings } from "@/lib/admin.functions";
import { uploadMediaFile } from "@/lib/media";

type Section = "Identidade" | "Topo" | "Seções e regras";
type SettingField = { key: string; label: string; type: "text" | "textarea"; section: Section };

const FIELDS: SettingField[] = [
  { key: "siteName", label: "Nome do site", type: "text", section: "Identidade" },
  { key: "discordUrl", label: "Link do Discord", type: "text", section: "Identidade" },
  { key: "connectUrl", label: "Link de conexão (FiveM)", type: "text", section: "Identidade" },
  { key: "heroBadge", label: "Selo do topo", type: "text", section: "Topo" },
  { key: "heroKicker", label: "Linha acima do título", type: "text", section: "Topo" },
  { key: "heroTitle", label: "Título principal", type: "text", section: "Topo" },
  { key: "heroSubtitle", label: "Subtítulo do topo", type: "textarea", section: "Topo" },
  { key: "heroDescription", label: "Descrição do topo", type: "textarea", section: "Topo" },
  {
    key: "newsTitle",
    label: "Título da seção de notícias",
    type: "text",
    section: "Seções e regras",
  },
  {
    key: "newsSubtitle",
    label: "Subtítulo da seção de notícias",
    type: "textarea",
    section: "Seções e regras",
  },
  { key: "playTitle", label: "Título da seção Jogar", type: "text", section: "Seções e regras" },
  {
    key: "playSubtitle",
    label: "Subtítulo da seção Jogar",
    type: "textarea",
    section: "Seções e regras",
  },
  {
    key: "faqTitle",
    label: "Título das dúvidas frequentes",
    type: "text",
    section: "Seções e regras",
  },
  {
    key: "rulesTitle",
    label: "Título da página de regras",
    type: "text",
    section: "Seções e regras",
  },
  {
    key: "rulesIntro",
    label: "Introdução da página de regras",
    type: "textarea",
    section: "Seções e regras",
  },
  {
    key: "rulesImportant",
    label: "Aviso importante das regras",
    type: "textarea",
    section: "Seções e regras",
  },
];

const SECTIONS: { name: Section; description: string; icon: typeof Settings2 }[] = [
  {
    name: "Identidade",
    description: "Nome do projeto e destinos dos botões principais.",
    icon: Settings2,
  },
  { name: "Topo", description: "Conteúdo que aparece logo ao abrir o site.", icon: LayoutPanelTop },
  { name: "Seções e regras", description: "Textos de apoio das áreas públicas.", icon: Palette },
];

function wallpaperList(value: string) {
  return value
    .split(/\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function WallpaperManager({
  values,
  canEdit,
  onChange,
}: {
  values: Record<string, string>;
  canEdit: boolean;
  onChange: (values: Record<string, string>) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const wallpapers = useMemo(() => wallpaperList(values["wallpapers"] ?? ""), [values]);
  const rawInterval = Number(values["wallpaperInterval"]);
  const interval =
    Number.isFinite(rawInterval) && rawInterval > 0 ? Math.min(120, Math.floor(rawInterval)) : 3;

  const setWallpapers = (next: string[]) => onChange({ ...values, wallpapers: next.join("\n") });
  const upload = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) {
      toast.error("Para o fundo, escolha arquivos de imagem.");
      return;
    }
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of images) {
        const media = await uploadMediaFile(file, "wallpapers");
        uploaded.push(media.url);
      }
      setWallpapers([...wallpapers, ...uploaded]);
      toast.success(
        uploaded.length === 1
          ? "Imagem adicionada à rotação de fundos."
          : `${uploaded.length} imagens adicionadas à rotação de fundos.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar as imagens.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card/75 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-5">
        <div className="flex gap-3">
          <div className="rounded-lg bg-primary/15 p-2.5 text-primary">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-xl uppercase tracking-wide">Imagens de fundo</h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Envie arquivos do computador ou cole links. As imagens se alternam sozinhas na página
              pública.
            </p>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <Label
            htmlFor="wallpaperInterval"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Trocar a cada
          </Label>
          <div className="mt-1 flex items-center gap-2">
            <Input
              id="wallpaperInterval"
              type="number"
              min="1"
              max="120"
              className="w-24"
              disabled={!canEdit}
              value={interval}
              onChange={(event) => onChange({ ...values, wallpaperInterval: event.target.value })}
            />
            <span className="text-sm text-muted-foreground">segundos</span>
          </div>
          <div className="mt-2 flex gap-1.5">
            {[3, 5, 10, 15, 30].map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={!canEdit}
                onClick={() => onChange({ ...values, wallpaperInterval: String(preset) })}
                className={`rounded-md border px-2 py-1 text-[11px] font-bold transition-colors disabled:opacity-50 ${
                  interval === preset
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
                }`}
              >
                {preset}s
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-[1fr_1.15fr]">
        <div className="grid content-start gap-2">
          <Label
            htmlFor="wallpapers"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Links das imagens
          </Label>
          <Textarea
            id="wallpapers"
            rows={7}
            disabled={!canEdit}
            value={values["wallpapers"] ?? ""}
            placeholder={"Uma URL de imagem por linha\nhttps://exemplo.com/foto.jpg"}
            onChange={(event) => onChange({ ...values, wallpapers: event.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Uma imagem por linha. Links e arquivos enviados podem ser combinados.
          </p>
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept="image/*"
            multiple
            disabled={!canEdit || uploading}
            onChange={(event) => void upload(event.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            className="mt-1 w-fit"
            disabled={!canEdit || uploading}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
            {uploading ? "Enviando imagens..." : "Escolher imagens do computador"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Você pode selecionar várias imagens de uma vez.
          </p>
        </div>
        <div className="grid content-start gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Prévia da rotação ({wallpapers.length} {wallpapers.length === 1 ? "imagem" : "imagens"})
          </p>
          {wallpapers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nenhuma imagem cadastrada. O site usará os fundos padrão.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {wallpapers.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="group relative overflow-hidden rounded-lg border border-border bg-background"
                >
                  <img
                    src={url}
                    alt={`Fundo ${index + 1}`}
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute left-1.5 top-1.5 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-bold">
                    {index + 1}
                  </span>
                  {canEdit && (
                    <button
                      type="button"
                      aria-label={`Remover fundo ${index + 1}`}
                      className="absolute right-1.5 top-1.5 rounded bg-background/90 px-2 py-1 text-xs font-bold opacity-0 shadow transition-opacity hover:text-destructive group-hover:opacity-100 focus:opacity-100"
                      onClick={() =>
                        setWallpapers(wallpapers.filter((_, itemIndex) => itemIndex !== index))
                      }
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function SettingsPanel({
  settings,
  canEdit,
  onChanged,
}: {
  settings: Record<string, string>;
  canEdit: boolean;
  onChanged: () => void;
}) {
  const save = useServerFn(saveSettings);
  const [values, setValues] = useState<Record<string, string>>(settings);
  const [busy, setBusy] = useState(false);

  useEffect(() => setValues(settings), [settings]);

  const submit = async () => {
    setBusy(true);
    try {
      await save({ data: { values } });
      toast.success("Configurações publicadas no site.");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar.");
    } finally {
      setBusy(false);
    }
  };

  const dirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(settings),
    [values, settings],
  );

  return (
    <div className="space-y-6 pb-24">
      <PanelHeader
        title="Configurações do site"
        description="Ajuste textos, links e aparência da página inicial. Salve para publicar as alterações."
        action={
          canEdit ? (
            <Button onClick={submit} disabled={busy}>
              {busy ? "Publicando..." : "Salvar e publicar"}
            </Button>
          ) : undefined
        }
      />
      <WallpaperManager values={values} canEdit={canEdit} onChange={setValues} />
      <div className="grid gap-5 xl:grid-cols-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <section
              key={section.name}
              className="overflow-hidden rounded-2xl border border-border bg-card/75 shadow-[var(--shadow-card)]"
            >
              <div className="flex gap-3 border-b border-border px-5 py-5">
                <div className="rounded-lg bg-primary/15 p-2.5 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl uppercase tracking-wide">{section.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
              <div className="grid gap-4 p-5">
                {FIELDS.filter((field) => field.section === section.name).map((field) => (
                  <div key={field.key} className="grid gap-2">
                    <Label
                      htmlFor={field.key}
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {field.label}
                    </Label>
                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.key}
                        rows={3}
                        disabled={!canEdit}
                        value={values[field.key] ?? ""}
                        onChange={(event) =>
                          setValues({ ...values, [field.key]: event.target.value })
                        }
                      />
                    ) : (
                      <Input
                        id={field.key}
                        disabled={!canEdit}
                        value={values[field.key] ?? ""}
                        onChange={(event) =>
                          setValues({ ...values, [field.key]: event.target.value })
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      {canEdit && dirty && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-primary/40 bg-card/95 py-3 shadow-[0_-10px_40px_-20px_oklch(0_0_0/0.9)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3 px-5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Você tem alterações não publicadas.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setValues(settings)} disabled={busy}>
                Descartar
              </Button>
              <Button onClick={submit} disabled={busy}>
                {busy ? "Publicando..." : "Salvar e publicar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
