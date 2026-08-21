import { supabase } from "@/integrations/supabase/client";

export type MediaKind = "image" | "video";

const MAX_MEDIA_SIZE = 50 * 1024 * 1024;

export function mediaKindFromFile(file: File): MediaKind | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

export function mediaKindFromUrl(url: string, fallback: MediaKind = "image"): MediaKind {
  const normalized = url.toLowerCase().split("?")[0] ?? "";
  return /\.(mp4|webm|ogg|mov|m4v)$/.test(normalized) || /youtu\.be\/|youtube\.com\//.test(normalized)
    ? "video"
    : fallback;
}

export async function uploadMediaFile(file: File, folder: "news" | "wallpapers") {
  const kind = mediaKindFromFile(file);
  if (!kind) throw new Error("Escolha uma imagem ou um vídeo válido.");
  if (file.size > MAX_MEDIA_SIZE) throw new Error("O arquivo pode ter no máximo 50 MB.");

  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "bin";
  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 56) || "arquivo";
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${folder}/${id}-${safeName}.${extension}`;

  const { error } = await supabase.storage.from("midia").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(error.message);
  return { url: `/api/public/midia/${path}`, kind };
}
