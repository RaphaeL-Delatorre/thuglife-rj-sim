import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { SavedComponentPreset } from "./editor-types";

const STORAGE_KEY = "thuglife_editor_custom_components_v1";

const DEFAULT_SAVED_COMPONENTS: SavedComponentPreset[] = [
  {
    id: "preset-regra-penal",
    name: "Regra Penal Severa",
    category: "Regras",
    icon: "⚖️",
    html: `<div class="rc-rule-card" style="border:1px solid #ef4444;background:#ef444414;border-radius:0.8rem;padding:1.1rem;margin:1rem 0;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
        <span class="rc-rule-code" style="color:#ef4444;font-weight:800;font-size:1.1rem;">⚖️ 1.1 — METAGAMING</span>
        <span class="rc-badge" style="border-color:#ef4444;background:#ef444426;color:#ef4444;font-size:0.75rem;padding:0.15rem 0.6rem;border-radius:0.35rem;font-weight:700;">PROIBIDO</span>
      </div>
      <p style="margin:0 0 0.6rem;color:var(--foreground);font-size:0.95rem;line-height:1.6;">
        É terminantemente proibido utilizar qualquer informação externa (Discord, lives, chamadas de voz externas) para obter vantagens dentro do roleplay.
      </p>
      <div style="border-top:1px solid #ef444440;padding-top:0.5rem;font-size:0.85rem;color:#f87171;">
        <strong>Penalidade:</strong> Banimento de 7 a 30 dias + Advertência formal.
      </div>
    </div><p><br></p>`,
    createdAt: Date.now(),
  },
  {
    id: "preset-card-policia",
    name: "Protocolo Policial",
    category: "Polícia",
    icon: "🚔",
    html: `<div class="rc-card-box" style="border:1px solid #3b82f6;background:#3b82f612;border-radius:0.8rem;padding:1.2rem;margin:1rem 0;box-shadow:0 0 15px rgba(59,130,246,0.15);">
      <h3 style="color:#3b82f6;font-family:var(--font-display);font-size:1.2rem;margin:0 0 0.5rem;text-transform:uppercase;">
        🚔 PROTOCOLO DE ABORDAGEM POLICIAL
      </h3>
      <p style="margin:0 0 0.6rem;color:var(--foreground);line-height:1.6;">
        Toda abordagem deve ser iniciada com aviso sonoro (sirene) e comando verbal claro. O uso de armamento letal só é autorizado em legítima defesa comprovada.
      </p>
      <ul class="rc-checklist" style="margin:0;">
        <li>Identificação da viatura e dos oficiais</li>
        <li>Revista do suspeito apenas com voz de prisão fundamentada</li>
        <li>Gravação obrigatória de toda a ação</li>
      </ul>
    </div><p><br></p>`,
    createdAt: Date.now(),
  },
  {
    id: "preset-comparativo-acoes",
    name: "Comparativo: Permitido vs Proibido",
    category: "Comparação",
    icon: "⚖️",
    html: `<div class="rc-compare-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;margin:1.5rem 0;">
      <div style="border:1px solid #22c55e;background:#22c55e12;border-radius:0.8rem;padding:1rem;">
        <h4 style="color:#22c55e;font-weight:800;font-size:0.95rem;margin:0 0 0.6rem;display:flex;align-items:center;gap:0.4rem;">
          <span>✓</span> PERMITIDO
        </h4>
        <ul style="list-style:none;padding-left:0;margin:0;font-size:0.88rem;line-height:1.6;color:var(--foreground);">
          <li style="margin-bottom:0.4rem;">• Negociação pacífica de reféns</li>
          <li style="margin-bottom:0.4rem;">• Gravação em primeira pessoa de ações</li>
          <li>• Uso de veículos blindados conforme limite do porte</li>
        </ul>
      </div>
      <div style="border:1px solid #ef4444;background:#ef444412;border-radius:0.8rem;padding:1rem;">
        <h4 style="color:#ef4444;font-weight:800;font-size:0.95rem;margin:0 0 0.6rem;display:flex;align-items:center;gap:0.4rem;">
          <span>✕</span> PROIBIDO
        </h4>
        <ul style="list-style:none;padding-left:0;margin:0;font-size:0.88rem;line-height:1.6;color:var(--foreground);">
          <li style="margin-bottom:0.4rem;">• Disparo sem aviso sonoro (RDM)</li>
          <li style="margin-bottom:0.4rem;">• Atropelamento intencional (VDM)</li>
          <li>• Deslogar no meio de ação de abordagem</li>
        </ul>
      </div>
    </div><p><br></p>`,
    createdAt: Date.now(),
  },
];

interface CustomComponentsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (html: string) => void;
  selectedHtml?: string;
}

export function CustomComponentsManager({
  isOpen,
  onClose,
  onInsert,
  selectedHtml,
}: CustomComponentsManagerProps) {
  const [components, setComponents] = useState<SavedComponentPreset[]>([]);
  const [savingNew, setSavingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Geral");
  const [newIcon, setNewIcon] = useState("⭐");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setComponents(JSON.parse(stored));
      } else {
        setComponents(DEFAULT_SAVED_COMPONENTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAVED_COMPONENTS));
      }
    } catch {
      setComponents(DEFAULT_SAVED_COMPONENTS);
    }
  }, []);

  const saveToStorage = (list: SavedComponentPreset[]) => {
    setComponents(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  };

  const handleSaveCurrent = () => {
    if (!newName.trim()) {
      toast.error("Insira o nome do componente.");
      return;
    }
    const htmlToSave = selectedHtml?.trim()
      ? selectedHtml
      : `<div class="rc-card-box" style="border:1px solid #8b5cf6;background:#8b5cf615;border-radius:0.8rem;padding:1.2rem;margin:1rem 0;">
          <h3 style="color:#8b5cf6;font-size:1.1rem;margin:0 0 0.5rem;font-weight:700;">${newIcon} ${newName}</h3>
          <p style="margin:0;color:var(--foreground);">Conteúdo do componente personalizado.</p>
        </div><p><br></p>`;

    const newPreset: SavedComponentPreset = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      category: newCategory.trim() || "Geral",
      icon: newIcon || "⭐",
      html: htmlToSave,
      createdAt: Date.now(),
    };

    const updated = [newPreset, ...components];
    saveToStorage(updated);
    toast.success("Componente salvo em 'Meus Componentes'!");
    setSavingNew(false);
    setNewName("");
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Excluir o componente "${name}"?`)) return;
    const updated = components.filter((c) => c.id !== id);
    saveToStorage(updated);
    toast.success("Componente excluído.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-popover/95 backdrop-blur border border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 font-display uppercase tracking-wide">
              <span>⭐</span> Meus Componentes e Estilos Salvos
            </DialogTitle>
            <Button
              type="button"
              size="sm"
              onClick={() => setSavingNew((s) => !s)}
              className="text-xs font-bold uppercase tracking-wider"
            >
              {savingNew ? "Ver Biblioteca" : "+ Salvar Seleção Atual"}
            </Button>
          </div>
        </DialogHeader>

        {savingNew ? (
          <div className="space-y-4 py-2 border-t border-border mt-2">
            <p className="text-xs text-muted-foreground">
              Salve o bloco selecionado atualmente no editor como um componente reutilizável:
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">Ícone / Emoji</Label>
                <Input
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  placeholder="Ex: ⚖️"
                  className="h-9"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">Nome do Componente</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Regra Especial de Assalto"
                  className="h-9"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Categoria</Label>
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Ex: Regras, Polícia, Alertas, etc."
                className="h-9"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSavingNew(false)}>
                Cancelar
              </Button>
              <Button type="button" size="sm" onClick={handleSaveCurrent}>
                Salvar Componente
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {components.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/60 p-3.5 hover:border-primary/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-xs">
                        <span>{c.icon}</span>
                        <span className="truncate">{c.name}</span>
                      </span>
                      <span className="text-[10px] text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                        {c.category}
                      </span>
                    </div>
                    <div
                      className="mt-2 text-[11px] text-muted-foreground line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: c.html.replace(/<style[\s\S]*?<\/style>/gi, "").slice(0, 150),
                      }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.name)}
                      className="text-[11px] text-destructive hover:underline"
                    >
                      Excluir
                    </button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        onInsert(c.html);
                        onClose();
                      }}
                      className="h-7 text-xs font-bold"
                    >
                      + Inserir no Editor
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
