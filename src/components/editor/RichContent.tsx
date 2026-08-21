function stabilizeTextEffects(html: string) {
  return html.replace(/text-shadow\s*:\s*([^;"']+)/gi, (declaration, value: string) => {
    if (value.trim().toLowerCase() === "none") return declaration;
    const blurValues = [...value.matchAll(/(-?\d+(?:\.\d+)?)px/g)].map((match) => Number(match[1]));
    if (!blurValues.some((blur) => Math.abs(blur) > 14)) return declaration;
    const color = value.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|var\([^)]*\)/i)?.[0] ?? "currentColor";
    return `text-shadow:0 0 1px ${color}, 0 0 10px ${color}`;
  });
}

export function RichContent({ html, className }: { html: string; className?: string }) {
  if (!html?.trim()) return null;
  return (
    <div
      className={`rich-content ${className ?? ""}`}
      // Conteúdo criado apenas por administradores autenticados do painel.
      dangerouslySetInnerHTML={{ __html: stabilizeTextEffects(html) }}
    />
  );
}
