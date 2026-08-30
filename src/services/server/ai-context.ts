import type { SupabaseClient } from "@supabase/supabase-js";
import type { GroundingContextChunk } from "../../domain/ai";

export type OwnedDocument = {
  id: string;
  title: string;
  status: string;
};

type ChunkRow = {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  metadata: Record<string, unknown> | null;
};

function mapChunk(row: ChunkRow, fallbackTitle: string): GroundingContextChunk {
  const metadataTitle = row.metadata?.source_title;
  return {
    id: row.id,
    documentId: row.document_id,
    chunkIndex: Number(row.chunk_index),
    content: row.content,
    sourceTitle: typeof metadataTitle === "string" && metadataTitle.trim() ? metadataTitle : fallbackTitle,
  };
}

function selectDistributedChunks(chunks: GroundingContextChunk[], maxChunks = 24, maxChars = 32000) {
  if (!chunks.length) return [];
  if (chunks.length <= maxChunks && chunks.reduce((sum, chunk) => sum + chunk.content.length, 0) <= maxChars) return chunks;

  const selected: GroundingContextChunk[] = [];
  const used = new Set<number>();
  const targetCount = Math.min(maxChunks, chunks.length);

  for (let index = 0; index < targetCount; index += 1) {
    const position = targetCount === 1 ? 0 : Math.round((index * (chunks.length - 1)) / (targetCount - 1));
    if (used.has(position)) continue;
    used.add(position);
    selected.push(chunks[position]);
  }

  const withinBudget: GroundingContextChunk[] = [];
  let chars = 0;
  for (const chunk of selected) {
    if (withinBudget.length && chars + chunk.content.length > maxChars) continue;
    withinBudget.push(chunk);
    chars += chunk.content.length;
  }
  return withinBudget;
}

export async function loadQuizGroundingContext(admin: SupabaseClient, userId: string, documentId: string) {
  const { data: document, error: documentError } = await admin
    .from("documents")
    .select("id,title,status")
    .eq("id", documentId)
    .eq("owner_id", userId)
    .single();

  if (documentError || !document) throw new AiContextError("DOCUMENT_NOT_FOUND", 404);
  if (document.status !== "CHUNKED") throw new AiContextError("DOCUMENT_NOT_READY", 409);

  const { data: rows, error: chunkError } = await admin
    .from("document_chunks")
    .select("id,document_id,chunk_index,content,metadata")
    .eq("document_id", documentId)
    .order("chunk_index", { ascending: true });
  if (chunkError) throw chunkError;

  const chunks = selectDistributedChunks((rows ?? []).map((row) => mapChunk(row as ChunkRow, document.title)));
  if (!chunks.length) throw new AiContextError("DOCUMENT_HAS_NO_CONTEXT", 422);
  return { document: document as OwnedDocument, chunks };
}

export async function loadTutorGroundingContext(admin: SupabaseClient, userId: string, question: string, limit = 8) {
  const { data: documents, error: documentError } = await admin
    .from("documents")
    .select("id,title")
    .eq("owner_id", userId)
    .eq("status", "CHUNKED");
  if (documentError) throw documentError;
  if (!documents?.length) return [];

  const titleById = new Map(documents.map((document) => [document.id, document.title]));
  const documentIds = documents.map((document) => document.id);
  const { data: rows, error: chunkError } = await admin
    .from("document_chunks")
    .select("id,document_id,chunk_index,content,metadata")
    .in("document_id", documentIds)
    .textSearch("search_vector", question, { config: "simple", type: "websearch" })
    .limit(Math.min(Math.max(limit, 1), 12));
  if (chunkError) throw chunkError;

  return (rows ?? []).map((row) => mapChunk(row as ChunkRow, titleById.get(row.document_id) ?? "Learning material"));
}

export class AiContextError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "AiContextError";
  }
}
