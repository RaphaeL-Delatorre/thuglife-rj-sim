import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PanelHeader } from "./fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteRole, saveRole } from "@/lib/admin.functions";
import { ALL_PERMISSIONS, PERMISSION_GROUPS } from "@/lib/permissions";

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
};

type Draft = { id: string | null; name: string; description: string; permissions: string[] };

export function RolesPanel({
  roles,
  can,
  onChanged,
}: {
  roles: Role[];
  can: (perm: string) => boolean;
  onChanged: () => void;
}) {
  const save = useServerFn(saveRole);
  const remove = useServerFn(deleteRole);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (perm: string) => {
    if (!draft) return;
    const has = draft.permissions.includes(perm);
    setDraft({
      ...draft,
      permissions: has ? draft.permissions.filter((p) => p !== perm) : [...draft.permissions, perm],
    });
  };

  const submit = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      await save({
        data: { id: draft.id, name: draft.name, description: draft.description, permissions: draft.permissions },
      });
      toast.success("Cargo salvo.");
      setDraft(null);
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar cargo.");
    } finally {
      setBusy(false);
    }
  };

  const del = async (role: Role) => {
    if (!window.confirm(`Excluir o cargo "${role.name}"?`)) return;
    try {
      await remove({ data: { id: role.id } });
      toast.success("Cargo excluído.");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir cargo.");
    }
  };

  const isFull = draft?.permissions.includes("*") ?? false;

  return (
    <div className="space-y-5">
      <PanelHeader
        title="Cargos e permissões"
        description="Defina exatamente o que cada cargo pode criar, editar ou excluir no site."
        action={
          can("roles.create") ? (
            <Button onClick={() => setDraft({ id: null, name: "", description: "", permissions: [] })}>
              Novo cargo
            </Button>
          ) : undefined
        }
      />

      {roles.length === 0 ? (
        <EmptyState label="Nenhum cargo cadastrado." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((role) => (
            <div key={role.id} className="rounded-xl border border-border bg-card/70 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg uppercase tracking-wide">{role.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{role.description || "Sem descrição."}</p>
                </div>
                {role.is_system && (
                  <span className="rounded-md border border-primary/60 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary">
                    Sistema
                  </span>
                )}
              </div>
              <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
                {role.permissions.includes("*")
                  ? "Todas as permissões do site"
                  : `${role.permissions.length} permissões`}
              </p>
              <div className="mt-4 flex gap-2">
                {can("roles.edit") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setDraft({
                        id: role.id,
                        name: role.name,
                        description: role.description,
                        permissions: role.permissions,
                      })
                    }
                  >
                    Editar
                  </Button>
                )}
                {can("roles.delete") && !role.is_system && (
                  <Button variant="ghost" size="sm" onClick={() => del(role)}>
                    Excluir
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Editar cargo" : "Novo cargo"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="role-name">Nome do cargo</Label>
                <Input
                  id="role-name"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role-desc">Descrição</Label>
                <Textarea
                  id="role-desc"
                  rows={2}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-3 rounded-lg border border-primary/50 bg-primary/5 p-4">
                <Checkbox
                  checked={isFull}
                  onCheckedChange={(v) =>
                    setDraft({ ...draft, permissions: v ? ["*"] : [] })
                  }
                />
                <span className="text-sm font-semibold">Acesso total (todas as permissões do site)</span>
              </label>

              {!isFull && (
                <div className="grid gap-5">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDraft({ ...draft, permissions: [...ALL_PERMISSIONS] })}
                    >
                      Marcar todas
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDraft({ ...draft, permissions: [] })}
                    >
                      Limpar
                    </Button>
                  </div>
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.label} className="rounded-lg border border-border p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">{group.label}</h4>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {group.items.map((item) => (
                          <label key={item.key} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={draft.permissions.includes(item.key)}
                              onCheckedChange={() => toggle(item.key)}
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={busy}>
              {busy ? "Salvando..." : "Salvar cargo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
