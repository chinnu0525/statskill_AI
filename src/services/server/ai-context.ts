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

type TutorSearchRow = ChunkRow & {
  rank: number | null;
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

export async function loadQuizGroundingContext(client: SupabaseClient, documentId: string) {
  const { data: document, error: documentError } = await client
    .from("documents")
    .select("id,title,status")
    .eq("id", documentId)
    .single();

  if (documentError || !document) throw new AiContextError("DOCUMENT_NOT_FOUND", 404);
  if (document.status !== "CHUNKED") throw new AiContextError("DOCUMENT_NOT_READY", 409);

  const { data: rows, error: chunkError } = await client
    .from("document_chunks")
    .select("id,document_id,chunk_index,content,metadata")
    .eq("document_id", documentId)
    .order("chunk_index", { ascending: true });
  if (chunkError) throw chunkError;

  const chunks = selectDistributedChunks((rows ?? []).map((row) => mapChunk(row as ChunkRow, document.title)));
  if (!chunks.length) throw new AiContextError("DOCUMENT_HAS_NO_CONTEXT", 422);
  return { document: document as OwnedDocument, chunks };
}

export async function loadTutorGroundingContext(
  client: SupabaseClient,
  question: string,
  limit = 8,
): Promise<GroundingContextChunk[]> {
  const boundedLimit = Math.min(Math.max(limit, 1), 12);
  const { data: rows, error } = await client.rpc("search_my_document_chunks", {
    search_query: question,
    match_limit: boundedLimit,
  });
  if (error) throw error;

  return (rows ?? []).map((rawRow: TutorSearchRow) => mapChunk(rawRow, "Learning material"));
}

export class AiContextError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "AiContextError";
  }
}
