import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import JSZip from "npm:jszip@3.10.1";
import pdfParse from "npm:pdf-parse@1.1.1";
import { Buffer } from "node:buffer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };
const MAX_CHUNK = 1200;
const OVERLAP = 180;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function decodeXml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function cleanText(value: string) {
  return value
    .replace(/\u0000/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function chunkText(text: string) {
  const chunks: string[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    let end = Math.min(text.length, cursor + MAX_CHUNK);
    if (end < text.length) {
      const paragraph = text.lastIndexOf("\n", end);
      const sentence = text.lastIndexOf(". ", end);
      const boundary = Math.max(paragraph, sentence);
      if (boundary > cursor + 600) end = boundary + 1;
    }
    const chunk = text.slice(cursor, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= text.length) break;
    cursor = Math.max(cursor + 1, end - OVERLAP);
  }
  return chunks;
}

async function extractOfficeXml(bytes: ArrayBuffer, extension: string) {
  const zip = await JSZip.loadAsync(bytes);
  const paths = Object.keys(zip.files)
    .filter((path) => extension === "docx" ? path === "word/document.xml" : /^ppt\/slides\/slide\d+\.xml$/.test(path))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const parts: string[] = [];
  for (const path of paths) {
    const xml = await zip.file(path)?.async("string");
    if (!xml) continue;
    const matches = [...xml.matchAll(extension === "docx" ? /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g : /<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)];
    const text = matches.map((match) => decodeXml(match[1])).join(" ").trim();
    if (text) parts.push(text);
  }
  return parts.join("\n\n");
}

async function extractText(bytes: ArrayBuffer, extension: string) {
  if (extension === "txt") return new TextDecoder().decode(bytes);
  if (extension === "pdf") {
    const result = await pdfParse(Buffer.from(bytes));
    return result.text ?? "";
  }
  if (extension === "docx" || extension === "pptx") return extractOfficeXml(bytes, extension);
  throw new Error("UNSUPPORTED_LEGACY_FORMAT");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "server_not_configured" }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return json({ error: "unauthorized" }, 401);

  let body: { documentId?: string };
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  if (!body.documentId) return json({ error: "document_id_required" }, 400);

  const { data: document, error: documentError } = await admin
    .from("documents")
    .select("id,owner_id,title,storage_path")
    .eq("id", body.documentId)
    .single();
  if (documentError || !document) return json({ error: "document_not_found" }, 404);
  if (document.owner_id !== userData.user.id) return json({ error: "forbidden" }, 403);
  if (!document.storage_path) return json({ error: "document_has_no_file" }, 400);

  const extension = (document.title.split(".").pop() ?? "").toLowerCase();
  if (["doc", "ppt"].includes(extension)) {
    await admin.from("documents").update({ status: "CONVERSION_REQUIRED" }).eq("id", document.id);
    return json({ error: "legacy_format_requires_conversion" }, 422);
  }

  await admin.from("documents").update({ status: "PROCESSING" }).eq("id", document.id);

  try {
    const { data: file, error: downloadError } = await admin.storage.from("learning-materials").download(document.storage_path);
    if (downloadError || !file) throw downloadError ?? new Error("DOWNLOAD_FAILED");

    const rawText = await extractText(await file.arrayBuffer(), extension);
    const text = cleanText(rawText);
    if (!text) throw new Error("NO_EXTRACTABLE_TEXT");

    const chunks = chunkText(text);
    if (!chunks.length) throw new Error("NO_CHUNKS");

    await admin.from("document_chunks").delete().eq("document_id", document.id);
    const { error: chunkError } = await admin.from("document_chunks").insert(
      chunks.map((content, index) => ({
        document_id: document.id,
        chunk_index: index,
        content,
        metadata: { source_title: document.title, extraction: extension, char_count: content.length },
      })),
    );
    if (chunkError) throw chunkError;

    await admin.from("documents").update({ status: "CHUNKED" }).eq("id", document.id);
    return json({ documentId: document.id, status: "CHUNKED", chunkCount: chunks.length });
  } catch (error) {
    console.error("document ingestion failed", error);
    await admin.from("documents").update({ status: "PROCESSING_FAILED" }).eq("id", document.id);
    return json({ error: "processing_failed" }, 500);
  }
});
