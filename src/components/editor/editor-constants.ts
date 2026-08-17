export const FONTS = [
  { label: "Padrão do site", value: "inherit" },
  { label: "Barlow (Moderna/RP)", value: "Barlow, system-ui, sans-serif" },
  { label: "Anton (Títulos Fortes)", value: "Anton, Impact, 'Arial Black', sans-serif" },
  { label: "Inter (UI Clean)", value: "Inter, system-ui, sans-serif" },
  { label: "Poppins (Geométrica)", value: "Poppins, system-ui, sans-serif" },
  { label: "Montserrat (Elegante)", value: "Montserrat, system-ui, sans-serif" },
  { label: "Roboto (Legível)", value: "Roboto, system-ui, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia (Editorial)", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Courier New (Mono/Código)", value: "'Courier New', monospace" },
  { label: "Impact", value: "Impact, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
];

export const FONT_SIZES = [
  "10px", "11px", "12px", "13px", "14px", "15px", "16px", "18px",
  "20px", "22px", "24px", "28px", "32px", "36px", "40px", "48px", "56px", "64px",
];

export const FONT_WEIGHTS = [
  { label: "Leve (300)", value: "300" },
  { label: "Normal (400)", value: "400" },
  { label: "Médio (500)", value: "500" },
  { label: "Seminegrito (600)", value: "600" },
  { label: "Negrito (700)", value: "700" },
  { label: "Extranegrito (800)", value: "800" },
  { label: "Preto (900)", value: "900" },
];

export const LINE_HEIGHTS = [
  { label: "Apertado (1.0)", value: "1" },
  { label: "Compacto (1.25)", value: "1.25" },
  { label: "Normal (1.5)", value: "1.5" },
  { label: "Relaxado (1.75)", value: "1.75" },
  { label: "Duplo (2.0)", value: "2" },
  { label: "Amplo (2.5)", value: "2.5" },
];

export const LETTER_SPACINGS = [
  { label: "Normal (0)", value: "normal" },
  { label: "Compacto (-0.5px)", value: "-0.5px" },
  { label: "Amplo (1px)", value: "1px" },
  { label: "Expandido (2px)", value: "2px" },
  { label: "Super Expandido (4px)", value: "4px" },
  { label: "Cinematográfico (6px)", value: "6px" },
];

export const BLOCKS = [
  { label: "Parágrafo Normal", value: "p" },
  { label: "Título 1 (H1 Principal)", value: "h1" },
  { label: "Título 2 (H2 Seção)", value: "h2" },
  { label: "Título 3 (H3 Subseção)", value: "h3" },
  { label: "Título 4 (H4 Bloco)", value: "h4" },
  { label: "Título 5 (H5 Destaque)", value: "h5" },
  { label: "Título 6 (H6 Pequeno)", value: "h6" },
  { label: "Bloco de Citação", value: "blockquote" },
  { label: "Bloco de Código", value: "pre" },
];

export const DOCUMENT_PALETTES = [
  { label: "Primária (Roxo)", value: "#8b5cf6" },
  { label: "Secundária (Ciano)", value: "#06b6d4" },
  { label: "Sucesso (Verde)", value: "#22c55e" },
  { label: "Aviso (Amarelo)", value: "#f59e0b" },
  { label: "Perigo (Vermelho)", value: "#ef4444" },
  { label: "Informação (Azul)", value: "#3b82f6" },
  { label: "Dourado (Ouro)", value: "#eab308" },
  { label: "Rosa Neon", value: "#ec4899" },
  { label: "Branco Puro", value: "#ffffff" },
  { label: "Cinza Claro", value: "#e5e5e5" },
  { label: "Cinza Médio", value: "#71717a" },
  { label: "Escuro Puro", value: "#09090b" },
];

export const SWATCH_COLORS = [
  "#ffffff", "#f4f4f5", "#e4e4e7", "#a1a1aa", "#71717a", "#27272a", "#18181b", "#09090b",
  "#ef4444", "#dc2626", "#b91c1c", "#7f1d1d", "#f97316", "#ea580c", "#c2410c", "#7c2d12",
  "#f59e0b", "#d97706", "#b45309", "#78350f", "#eab308", "#ca8a04", "#a16207", "#713f12",
  "#84cc16", "#65a30d", "#4d7c0f", "#365314", "#22c55e", "#16a34a", "#15803d", "#14532d",
  "#10b981", "#059669", "#047857", "#064e3b", "#06b6d4", "#0891b2", "#0e7490", "#164e63",
  "#0ea5e9", "#0284c7", "#0369a1", "#075985", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af",
  "#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6",
  "#a855f7", "#9333ea", "#7e22ce", "#581c87", "#d946ef", "#c026d3", "#a21caf", "#701a75",
  "#ec4899", "#db2777", "#be185d", "#831843", "#f43f5e", "#e11d48", "#be123c", "#881337",
];

export const NEON_PRESETS = [
  { name: "Neon Roxo", color: "#8b5cf6", shadow: "0 0 10px #8b5cf6, 0 0 25px rgba(139,92,246,0.6)" },
  { name: "Neon Azul", color: "#3b82f6", shadow: "0 0 10px #3b82f6, 0 0 25px rgba(59,130,246,0.6)" },
  { name: "Neon Ciano", color: "#06b6d4", shadow: "0 0 10px #06b6d4, 0 0 25px rgba(6,182,212,0.6)" },
  { name: "Neon Verde", color: "#22c55e", shadow: "0 0 10px #22c55e, 0 0 25px rgba(34,197,94,0.6)" },
  { name: "Neon Vermelho", color: "#ef4444", shadow: "0 0 10px #ef4444, 0 0 25px rgba(239,68,68,0.6)" },
  { name: "Neon Rosa", color: "#ec4899", shadow: "0 0 10px #ec4899, 0 0 25px rgba(236,72,153,0.6)" },
  { name: "Neon Dourado", color: "#eab308", shadow: "0 0 10px #eab308, 0 0 25px rgba(234,179,8,0.6)" },
  { name: "Neon Branco", color: "#ffffff", shadow: "0 0 10px #ffffff, 0 0 25px rgba(255,255,255,0.7)" },
];

export const GRADIENT_PRESETS = [
  { label: "Roxo → Rosa", style: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)", from: "#8b5cf6", to: "#ec4899" },
  { label: "Azul → Ciano", style: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", from: "#3b82f6", to: "#06b6d4" },
  { label: "Vermelho → Laranja", style: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)", from: "#ef4444", to: "#f97316" },
  { label: "Dourado → Amarelo", style: "linear-gradient(135deg, #eab308 0%, #fef08a 100%)", from: "#eab308", to: "#fef08a" },
  { label: "Verde → Ciano", style: "linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)", from: "#22c55e", to: "#06b6d4" },
  { label: "Fogo / Chama", style: "linear-gradient(135deg, #dc2626 0%, #f59e0b 100%)", from: "#dc2626", to: "#f59e0b" },
  { label: "Cyberpunk", style: "linear-gradient(135deg, #06b6d4 0%, #d946ef 100%)", from: "#06b6d4", to: "#d946ef" },
  { label: "Cinza Metálico", style: "linear-gradient(135deg, #f4f4f5 0%, #71717a 100%)", from: "#f4f4f5", to: "#71717a" },
];

export const EMOJI_CATEGORIES: { name: string; icon: string; emojis: string[] }[] = [
  {
    name: "RP & Alertas",
    icon: "⚠️",
    emojis: ["⚠️", "🚨", "🔴", "🟢", "🟡", "🔵", "🛑", "⛔", "🚫", "📌", "📍", "🎯", "💥", "🔥", "✨", "💎", "⭐", "🏆", "📜", "⚖️", "🔒", "🔓", "🛡️", "⚔️", "👁️", "💬", "📢", "🧠", "💀", "☠️", "🩸", "🎭"],
  },
  {
    name: "Polícia & Lei",
    icon: "👮",
    emojis: ["👮", "👮‍♂️", "👮‍♀️", "🚓", "🚔", "🕵️", "🕵️‍♂️", "🕵️‍♀️", "🚁", "🔫", "⛓️", "🏛️", "📋", "📂", "🔍", "🔎", "📡", "📻", "🚨", "🪪", "💼"],
  },
  {
    name: "Hospital & Médico",
    icon: "🏥",
    emojis: ["🏥", "🚑", "🩺", "💉", "🩹", "💊", "🧑‍⚕️", "👨‍⚕️", "👩‍⚕️", "🧬", "🩻", "🫀", "🫁", "🩸", "🧼", "♿", "🌡️"],
  },
  {
    name: "Ilegal & Crime",
    icon: "💀",
    emojis: ["💀", "☠️", "🔫", "🧨", "💣", "🔪", "🗡️", "🥷", "🕶️", "🥊", "💰", "💵", "💸", "💳", "🏦", "🏴‍☠️", "🎭", "🚬", "🍻", "🏎️", "🏍️", "🛥️", "📦"],
  },
  {
    name: "Veículos & Transportes",
    icon: "🚗",
    emojis: ["🚗", "🚘", "🏎️", "🚙", "🚚", "🚛", "🏍️", "🛵", "🚲", "🚁", "✈️", "🛥️", "🚤", "🚢", "⛽", "🚦", "🛑", "🚧", "🔧", "🛞"],
  },
  {
    name: "Economia & Dinheiro",
    icon: "💰",
    emojis: ["💰", "💵", "💸", "💳", "🪙", "🏦", "💎", "📈", "📉", "🛒", "🏷️", "💼", "🧾", "🪙", "🤑", "📊"],
  },
  {
    name: "Símbolos & Status",
    icon: "✅",
    emojis: ["✅", "☑️", "✔️", "❌", "✖️", "❎", "❓", "❗", "‼️", "❕", "❔", "➕", "➖", "✖️", "➗", "🔘", "⚪", "⚫", "🔴", "🔵", "🟣", "🟢", "🟡", "🟠", "🟤", "⬛", "⬜", "🔺", "🔻", "🔶", "🔷"],
  },
  {
    name: "Pessoas & Reações",
    icon: "😀",
    emojis: ["😀", "😎", "🤝", "🙏", "👊", "👍", "👎", "👏", "🙌", "👋", "💪", "🫡", "🤔", "🧐", "🤫", "🤐", "😐", "😑", "😏", "🙄", "😬", "😮", "😴"],
  },
];

export const SPECIAL_CHARACTERS_CATEGORIES: { name: string; chars: string[] }[] = [
  {
    name: "Setas & Ponteiros",
    chars: ["→", "←", "↑", "↓", "↔", "↕", "➔", "➜", "➤", "➥", "➦", "➧", "➨", "➲", "➳", "»", "«", "▶", "▷", "▸", "▹", "►", "▻", "▼", "▽", "▾", "▿", "▲", "△", "▴", "▵", "⇠", "⇢", "⇡", "⇣", "⇒", "⇐", "⇑", "⇓", "⇔"],
  },
  {
    name: "Marcadores & Símbolos",
    chars: ["•", "·", "⊛", "◉", "○", "◌", "◍", "◎", "●", "◘", "◦", "☉", "⁃", "⁌", "⁍", "◆", "◇", "◈", "★", "☆", "✦", "✧", "■", "□", "☐", "☑", "☒", "✓", "✔", "✕", "✖", "❥", "❧", "☙", "☸", "✤", "✱", "✲"],
  },
  {
    name: "Jurídico & Marcas",
    chars: ["§", "¶", "©", "®", "™", "℠", "№", "℗", "†", "‡", "•", "‰", "‱", "µ", "°", "℃", "℉", "ª", "º"],
  },
  {
    name: "Matemática & Moedas",
    chars: ["±", "≠", "≤", "≥", "≈", "∞", "÷", "×", "√", "∑", "∏", "∫", "∂", "∆", "∇", "∈", "∉", "⊂", "⊃", "R$", "$", "€", "£", "¥", "₿", "¢"],
  },
  {
    name: "Linhas & Molduras",
    chars: ["─", "━", "│", "┃", "┌", "┐", "└", "┘", "┏", "┓", "┗", "┛", "├", "┤", "┬", "┴", "┼", "┣", "┫", "┳", "┻", "╋", "═", "║", "╔", "╗", "╚", "╝", "╠", "╣", "╦", "╩", "╬", "░", "▒", "▓", "█"],
  },
];

export const SLASH_COMMANDS = [
  { key: "titulo", label: "Título Decorado", desc: "Insere um cabeçalho estilizado com ícone", icon: "📜" },
  { key: "aviso", label: "Aviso / Importante", desc: "Caixa de alerta amarela com ícone de atenção", icon: "⚠️" },
  { key: "proibido", label: "Bloco Proibido", desc: "Caixa de restrição em vermelho com símbolo", icon: "🚫" },
  { key: "permitido", label: "Bloco Permitido", desc: "Caixa de permissão em verde com check", icon: "✅" },
  { key: "regra", label: "Item de Regra", desc: "Regra numerada com código, título e penalidade", icon: "⚖️" },
  { key: "penalidade", label: "Cartão de Penalidade", desc: "Cartão com tipo de banimento ou punição", icon: "🛑" },
  { key: "comparacao", label: "Tabela Comparativa", desc: "Permitido vs Proibido em duas colunas", icon: "⚖️" },
  { key: "card", label: "Card Temático", desc: "Card estilizado com moldura e glow", icon: "📦" },
  { key: "acordeon", label: "Seção Expansível", desc: "Bloco recolhível que abre ao clicar", icon: "📑" },
  { key: "tabela", label: "Tabela Visual", desc: "Tabela de dados e limites personalizável", icon: "▦" },
  { key: "estatistica", label: "Número em Destaque", desc: "Bloco com número grande colorido (ex: Bandidos vs Polícia)", icon: "#" },
  { key: "divisor", label: "Divisor Luminoso", desc: "Linha decorativa com ícone ou gradiente", icon: "━" },
  { key: "citacao", label: "Citação / Nota", desc: "Bloco de citação com autor", icon: "💬" },
  { key: "imagem", label: "Imagem", desc: "Insere imagem com moldura e legenda", icon: "🖼️" },
  { key: "video", label: "Vídeo", desc: "Vídeo do YouTube ou MP4 incorporado", icon: "🎬" },
  { key: "badge", label: "Etiqueta / Badge", desc: "Pequena etiqueta destacada", icon: "🏷️" },
];
