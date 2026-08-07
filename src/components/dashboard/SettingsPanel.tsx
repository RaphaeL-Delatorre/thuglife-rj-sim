import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { PanelHeader } from "./fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveSettings } from "@/lib/admin.functions";

const FIELDS: { key: string; label: string; type: "text" | "textarea" }[] = [
  { key: "siteName", label: "Nome do site (topo)", type: "text" },
  { key: "discordUrl", label: "Link do Discord", type: "text" },
  { key: "connectUrl", label: "Link de conexão (FiveM)", type: "text" },
  { key: "heroBadge", label: "Selo do topo", type: "text" },
  { key: "heroKicker", label: "Linha acima do título", type: "text" },
  { key: "heroTitle", label: "Título principal", type: "text" },
  { key: "heroSubtitle", label: "Subtítulo do topo", type: "textarea" },
  { key: "heroDescription", label: "Descrição do topo", type: "textarea" },
  { key: "newsTitle", label: "Título da seção de notícias", type: "text" },
  { key: "newsSubtitle", label: "Subtítulo da seção de notícias", type: "textarea" },
  { key: "playTitle", label: "Título da seção Jogar", type: "text" },
  { key: "playSubtitle", label: "Subtítulo da seção Jogar", type: "textarea" },
  { key: "faqTitle", label: "Título das dúvidas frequentes", type: "text" },
  { key: "rulesTitle", label: "Título da página de regras", type: "text" },
  { key: "rulesIntro", label: "Introdução da página de regras", type: "textarea" },
  { key: "rulesImportant", label: "Aviso importante das regras", type: "textarea" },
];

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

  const submit = async () => {
    setBusy(true);
    try {
      await save({ data: { values } });
      toast.success("Site atualizado.");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Textos e links do site"
        description="Tudo que aparece nos títulos, botões e seções principais."
        action={canEdit ? <Button onClick={submit} disabled={busy}>{busy ? "Salvando..." : "Salvar alterações"}</Button> : undefined}
      />
      <div className="grid gap-5 md:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key} className="grid gap-2">
            <Label htmlFor={f.key} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {f.label}
            </Label>
            {f.type === "textarea" ? (
              <Textarea
                id={f.key}
                rows={3}
                disabled={!canEdit}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              />
            ) : (
              <Input
                id={f.key}
                disabled={!canEdit}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
