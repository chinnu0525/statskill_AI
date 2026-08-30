"use client";

import { ChangeEvent, useEffect, useState } from "react";
import {
  listLearningMaterials,
  processLearningMaterial,
  uploadLearningMaterial,
  validateLearningMaterial,
  type LearningDocument,
} from "../../src/services/documents";

export function DocumentUpload({ copy }: { copy: Record<string, string> }) {
  const [documents, setDocuments] = useState<LearningDocument[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    listLearningMaterials().then(setDocuments).catch(() => setDocuments([]));
  }, []);

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setStatus("");
    if (!file) return;
    const validation = validateLearningMaterial(file);
    if (validation === "FILE_TOO_LARGE") setStatus(copy.fileTooLarge);
    if (validation === "UNSUPPORTED_TYPE") setStatus(copy.unsupportedFile);
  }

  function replaceDocument(next: LearningDocument) {
    setDocuments((current) => current.map((item) => item.id === next.id ? next : item));
  }

  async function upload() {
    if (!selectedFile || validateLearningMaterial(selectedFile)) return;
    setUploading(true);
    setStatus("");
    try {
      const document = await uploadLearningMaterial(selectedFile);
      setDocuments((current) => [document, ...current]);
      setSelectedFile(null);
      const input = window.document.getElementById("learning-material-file") as HTMLInputElement | null;
      if (input) input.value = "";

      const processed = await processLearningMaterial(document.id);
      replaceDocument(processed);
      setStatus(processed.status === "CHUNKED" ? copy.uploadComplete : `${copy.uploadComplete} ${processed.status}`);
    } catch {
      setStatus(copy.uploadFailed);
      listLearningMaterials().then(setDocuments).catch(() => undefined);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="materialsCard" aria-labelledby="materials-title">
      <div className="materialsIntro">
        <div>
          <h2 id="materials-title">{copy.learningMaterials}</h2>
          <p>{copy.learningMaterialsHint}</p>
        </div>
        <div className="uploadControls">
          <label className="fileButton" htmlFor="learning-material-file">{copy.chooseFile}</label>
          <input
            id="learning-material-file"
            className="srOnly"
            type="file"
            accept=".pdf,.txt,.doc,.docx,.ppt,.pptx"
            onChange={chooseFile}
          />
          <button className="primaryButton compactButton" type="button" onClick={upload} disabled={!selectedFile || uploading}>
            {uploading ? copy.uploading : copy.upload}
          </button>
        </div>
      </div>

      {selectedFile ? <p className="selectedFile">{selectedFile.name}</p> : null}
      {status ? <p className="authMessage" role="status">{status}</p> : null}

      <div className="documentList">
        {documents.length ? documents.slice(0, 5).map((document) => (
          <div className="documentRow" key={document.id}>
            <span>{document.title}</span>
            <span className="statusPill">{document.status}</span>
          </div>
        )) : <p className="muted emptyState">{copy.noMaterials}</p>}
      </div>
    </section>
  );
}
