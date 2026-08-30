import { createClient } from "../lib/supabase/client";

const bucket = "learning-materials";
const maxFileSize = 25 * 1024 * 1024;
const allowedTypes = new Set([
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export type LearningDocument = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
};

function safeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "learning-material";
}

function mapDocument(document: { id: string; title: string; status: string; created_at: string }): LearningDocument {
  return {
    id: document.id,
    title: document.title,
    status: document.status,
    createdAt: document.created_at,
  };
}

export function validateLearningMaterial(file: File) {
  if (!allowedTypes.has(file.type)) return "UNSUPPORTED_TYPE" as const;
  if (file.size > maxFileSize) return "FILE_TOO_LARGE" as const;
  return null;
}

export async function uploadLearningMaterial(file: File): Promise<LearningDocument> {
  const validationError = validateLearningMaterial(file);
  if (validationError) throw new Error(validationError);

  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("AUTH_REQUIRED");

  const objectPath = `${authData.user.id}/${crypto.randomUUID()}/${safeFilename(file.name)}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(objectPath, file, {
    upsert: false,
    contentType: file.type,
  });
  if (uploadError) throw uploadError;

  const { data: document, error: insertError } = await supabase
    .from("documents")
    .insert({
      owner_id: authData.user.id,
      title: file.name,
      storage_path: objectPath,
      status: "UPLOADED",
    })
    .select("id,title,status,created_at")
    .single();

  if (insertError) {
    await supabase.storage.from(bucket).remove([objectPath]);
    throw insertError;
  }

  return mapDocument(document);
}

export async function processLearningMaterial(documentId: string): Promise<LearningDocument> {
  const supabase = createClient();
  const { error: functionError } = await supabase.functions.invoke("ingest-document", {
    body: { documentId },
  });

  const { data: document, error: readError } = await supabase
    .from("documents")
    .select("id,title,status,created_at")
    .eq("id", documentId)
    .single();

  if (readError || !document) throw readError ?? functionError ?? new Error("DOCUMENT_NOT_FOUND");
  if (functionError && !["CONVERSION_REQUIRED", "PROCESSING_FAILED"].includes(document.status)) throw functionError;
  return mapDocument(document);
}

export async function listLearningMaterials(): Promise<LearningDocument[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("id,title,status,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapDocument);
}
