export function RichContent({ html, className }: { html: string; className?: string }) {
  if (!html?.trim()) return null;
  return (
    <div
      className={`rich-content ${className ?? ""}`}
      // Conteúdo criado apenas por administradores autenticados do painel.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
