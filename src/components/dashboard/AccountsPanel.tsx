import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PanelHeader } from "./fields";
import type { Role } from "./RolesPanel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAccount, deleteAccount, updateAccount } from "@/lib/admin.functions";

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  role_id: string | null;
  created_at: string;
};

const NO_ROLE = "none";

export function AccountsPanel({
  profiles,
  roles,
  can,
  onChanged,
}: {
  profiles: Profile[];
  roles: Role[];
  can: (perm: string) => boolean;
  onChanged: () => void;
}) {
  const create = useServerFn(createAccount);
  const update = useServerFn(updateAccount);
  const remove = useServerFn(deleteAccount);
  const [newAccount, setNewAccount] = useState<{ name: string; password: string; roleId: string } | null>(null);
  const [editAccount, setEditAccount] = useState<
    { id: string; displayName: string; roleId: string; password: string } | null
  >(null);
  const [busy, setBusy] = useState(false);

  const roleName = (id: string | null) => roles.find((r) => r.id === id)?.name ?? "Sem cargo";

  const submitNew = async () => {
    if (!newAccount) return;
    setBusy(true);
    try {
      const res = await create({
        data: {
          name: newAccount.name,
          password: newAccount.password,
          roleId: newAccount.roleId === NO_ROLE ? null : newAccount.roleId,
        },
      });
      toast.success(`Conta criada: ${res.email}`);
      setNewAccount(null);
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar conta.");
    } finally {
      setBusy(false);
    }
  };

  const submitEdit = async () => {
    if (!editAccount) return;
    setBusy(true);
    try {
      await update({
        data: {
          id: editAccount.id,
          roleId: editAccount.roleId === NO_ROLE ? null : editAccount.roleId,
          displayName: editAccount.displayName,
          ...(editAccount.password ? { password: editAccount.password } : {}),
        },
      });
      toast.success("Conta atualizada.");
      setEditAccount(null);
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar conta.");
    } finally {
      setBusy(false);
    }
  };

  const del = async (profile: Profile) => {
    if (!window.confirm(`Excluir a conta ${profile.email}?`)) return;
    try {
      await remove({ data: { id: profile.id } });
      toast.success("Conta excluída.");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir conta.");
    }
  };

  const previewEmail = newAccount?.name
    ? `${newAccount.name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "")}@thuglife.com`
    : "";

  return (
    <div className="space-y-5">
      <PanelHeader
        title="Contas administrativas"
        description="O e-mail é gerado automaticamente a partir do nome informado."
        action={
          can("accounts.create") ? (
            <Button onClick={() => setNewAccount({ name: "", password: "", roleId: NO_ROLE })}>Nova conta</Button>
          ) : undefined
        }
      />

      {profiles.length === 0 ? (
        <EmptyState label="Nenhuma conta cadastrada." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card/70">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 font-semibold">Cargo</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3">{p.display_name || "—"}</td>
                  <td className="px-4 py-3">{p.email}</td>
                  <td className="px-4 py-3">{roleName(p.role_id)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {can("accounts.edit") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditAccount({
                            id: p.id,
                            displayName: p.display_name,
                            roleId: p.role_id ?? NO_ROLE,
                            password: "",
                          })
                        }
                      >
                        Editar
                      </Button>
                    )}
                    {can("accounts.delete") && (
                      <Button variant="ghost" size="sm" onClick={() => del(p)}>
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

      <Dialog open={newAccount !== null} onOpenChange={(open) => !open && setNewAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova conta</DialogTitle>
          </DialogHeader>
          {newAccount && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="acc-name">Nome</Label>
                <Input
                  id="acc-name"
                  value={newAccount.name}
                  placeholder="Ex.: Rafael"
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                />
                {previewEmail && <p className="text-xs text-muted-foreground">E-mail de login: {previewEmail}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="acc-pass">Senha</Label>
                <Input
                  id="acc-pass"
                  type="password"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Cargo</Label>
                <Select
                  value={newAccount.roleId}
                  onValueChange={(v) => setNewAccount({ ...newAccount, roleId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_ROLE}>Sem cargo</SelectItem>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewAccount(null)}>
              Cancelar
            </Button>
            <Button onClick={submitNew} disabled={busy}>
              {busy ? "Criando..." : "Criar conta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editAccount !== null} onOpenChange={(open) => !open && setEditAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar conta</DialogTitle>
          </DialogHeader>
          {editAccount && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome de exibição</Label>
                <Input
                  id="edit-name"
                  value={editAccount.displayName}
                  onChange={(e) => setEditAccount({ ...editAccount, displayName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Cargo</Label>
                <Select
                  value={editAccount.roleId}
                  onValueChange={(v) => setEditAccount({ ...editAccount, roleId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_ROLE}>Sem cargo</SelectItem>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-pass">Nova senha (opcional)</Label>
                <Input
                  id="edit-pass"
                  type="password"
                  value={editAccount.password}
                  onChange={(e) => setEditAccount({ ...editAccount, password: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAccount(null)}>
              Cancelar
            </Button>
            <Button onClick={submitEdit} disabled={busy}>
              {busy ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
