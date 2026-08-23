import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ExportImportDialogProps {
  isOpen: boolean;
  mode: "export" | "import";
  htmlContent: string;
  onClose: () => void;
  onImportContent: (newHtml: string) => void;
}

export function ExportImportDialog({
  isOpen,
  mode,
  htmlContent,
  onClose,
  onImportContent,
}: ExportImportDialogProps) {
  const [format, setFormat] = useState<"html" | "markdown" | "json">("html");
  const [importText, setImportText] = useState("");

  const convertHtmlToMarkdown = (html: string) => {
    let md = html;
    md = md.replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n");
    md = md.replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n");
    md = md.replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n");
    md = md.replace(/<h4>(.*?)<\/h4>/gi, "#### $1\n\n");
    md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
    md = md.replace(/<b>(.*?)<\/b>/gi, "**$1**");
    md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*");
    md = md.replace(/<i>(.*?)<\/i>/gi, "*$1*");
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
    md = md.replace(/<li>(.*?)<\/li>/gi, "- $1\n");
    md = md.replace(/<p>(.*?)<\/p>/gi, "$1\n\n");
    md = md.replace(/<br\s*[\/]?>/gi, "\n");
    md = md.replace(/<hr[^>]*>/gi, "\n---\n\n");
    md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, "> $1\n\n");
    md = md.replace(/<[^>]+>/g, ""); // strip remaining tags
    return md.trim();
  };

  const getExportData = () => {
    if (format === "html") {
      return htmlContent;
    }
    if (format === "markdown") {
      return convertHtmlToMarkdown(htmlContent);
    }
    if (format === "json") {
      return JSON.stringify(
        {
          version: "1.0",
          type: "thuglife-rj-sim-document",
          timestamp: Date.now(),
          html: htmlContent,
        },
        null,
        2
      );
    }
    return htmlContent;
  };

  const handleCopy = () => {
    const data = getExportData();
    navigator.clipboard.writeText(data);
    toast.success("Conteúdo copiado para a área de transferência!");
  };

  const handleDownload = () => {
    const data = getExportData();
    const ext = format === "html" ? "html" : format === "markdown" ? "md" : "json";
    const blob = new Blob([data], {
      type:
        format === "html"
          ? "text/html"
          : format === "markdown"
            ? "text/markdown"
            : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `documento-regras.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Arquivo .${ext} baixado com sucesso!`);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Documento de Regras</title>
          <style>
            body { font-family: Poppins, sans-serif; line-height: 1.6; color: #111; max-width: 800px; margin: 40px auto; padding: 0 20px; }
            h1, h2, h3, h4 { color: #8b5cf6; text-transform: uppercase; }
            .rc-frame, .rc-callout { border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 15px 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ccc; padding: 8px 12px; }
            th { background: #f4f4f4; }
          </style>
        </head>
        <body>
          <div class="rich-content">
            ${htmlContent}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePerformImport = () => {
    if (!importText.trim()) {
      toast.error("Insira o conteúdo a importar.");
      return;
    }

    try {
      if (format === "json") {
        const parsed = JSON.parse(importText);
        if (parsed.html) {
          onImportContent(parsed.html);
          toast.success("Documento JSON importado com sucesso!");
          onClose();
          return;
        }
      }

      if (format === "markdown") {
        // Simple MD to HTML conversion
        let converted = importText;
        converted = converted.replace(/^# (.*$)/gim, "<h1>$1</h1>");
        converted = converted.replace(/^## (.*$)/gim, "<h2>$1</h2>");
        converted = converted.replace(/^### (.*$)/gim, "<h3>$1</h3>");
        converted = converted.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
        converted = converted.replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>");
        converted = converted.replace(/\*(.*)\*/gim, "<em>$1</em>");
        converted = converted.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>');
        converted = converted.replace(/\n\n/gim, "</p><p>");
        converted = `<p>${converted}</p>`;
        onImportContent(converted);
        toast.success("Markdown importado com sucesso!");
        onClose();
        return;
      }

      // Default HTML
      onImportContent(importText);
      toast.success("HTML importado com sucesso!");
      onClose();
    } catch {
      toast.error("Erro ao importar o conteúdo. Verifique o formato.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-popover/95 backdrop-blur border border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display uppercase tracking-wide">
            {mode === "export" ? "📤 Exportar Documento" : "📥 Importar Documento"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Format selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Formato:
            </span>
            <div className="flex rounded-md bg-secondary/60 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setFormat("html")}
                className={`rounded px-3 py-1 font-semibold transition-colors ${
                  format === "html"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                HTML
              </button>
              <button
                type="button"
                onClick={() => setFormat("markdown")}
                className={`rounded px-3 py-1 font-semibold transition-colors ${
                  format === "markdown"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Markdown
              </button>
              <button
                type="button"
                onClick={() => setFormat("json")}
                className={`rounded px-3 py-1 font-semibold transition-colors ${
                  format === "json"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                JSON Estruturado
              </button>
            </div>
          </div>

          {mode === "export" ? (
            <div className="space-y-3">
              <Textarea
                readOnly
                value={getExportData()}
                rows={10}
                className="font-mono text-xs leading-relaxed bg-background/80"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="text-xs"
                >
                  🖨️ Imprimir / Gerar PDF
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                  >
                    Copiar Código
                  </Button>
                  <Button type="button" size="sm" onClick={handleDownload}>
                    Baixar Arquivo
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Cole o código {format.toUpperCase()} abaixo para substituir ou inserir no editor:
              </p>
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`Cole aqui o código ${format.toUpperCase()}...`}
                rows={10}
                className="font-mono text-xs leading-relaxed bg-background/80"
              />
              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="button" size="sm" onClick={handlePerformImport}>
                  Importar para o Editor
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
