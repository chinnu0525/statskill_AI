import { createClient } from "../lib/supabase/client";

export type SourceChunk = {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  metadata: Record<string, unknown>;
  rank: number;
};

function mapChunk(item: any, rank = 0): SourceChunk {
  return {
    id: String(item.id ?? ""),
    documentId: String(item.document_id ?? ""),
    chunkIndex: Number(item.chunk_index ?? 0),
    content: String(item.content ?? ""),
    metadata: item.metadata && typeof item.metadata === "object" ? item.metadata : {},
    rank: Number(item.rank ?? rank),
  };
}

export async function searchMyDocumentChunks(query: string, limit = 8): Promise<SourceChunk[]> {
  const searchQuery = query.trim();
  if (!searchQuery) return [];

  const supabase = createClient();
  const { data, error } = await supabase.rpc("search_my_document_chunks", {
    search_query: searchQuery,
    match_limit: Math.min(Math.max(limit, 1), 20),
  });
  if (error) throw error;

  return (data ?? []).map((item: any) => mapChunk(item));
}

export async function listMyDocumentChunks(documentId: string, limit = 8): Promise<SourceChunk[]> {
  const id = documentId.trim();
  if (!id) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("document_chunks")
    .select("id,document_id,chunk_index,content,metadata")
    .eq("document_id", id)
    .order("chunk_index", { ascending: true })
    .limit(Math.min(Math.max(limit, 1), 20));
  if (error) throw error;

  return (data ?? []).map((item: any) => mapChunk(item));
}
