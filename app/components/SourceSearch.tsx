"use client";

import { FormEvent, useState } from "react";
import { searchMyDocumentChunks, type SourceChunk } from "../../src/services/retrieval";

function sourceTitle(chunk: SourceChunk) {
  const title = chunk.metadata.source_title;
  return typeof title === "string" && title.trim() ? title : "Learning material";
}

export function SourceSearch({ copy }: { copy: Record<string, string> }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SourceChunk[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value || searching) return;

    setSearching(true);
    setError("");
    try {
      const matches = await searchMyDocumentChunks(value, 8);
      setResults(matches);
      setSearched(true);
    } catch {
      setResults([]);
      setSearched(true);
      setError(copy.sourceSearchFailed);
    } finally {
      setSearching(false);
    }
  }

  return (
    <section className="sourceSearchCard" aria-labelledby="source-search-title">
      <div className="sourceSearchIntro">
        <div>
          <h2 id="source-search-title">{copy.sourceSearch}</h2>
          <p>{copy.sourceSearchHint}</p>
        </div>
      </div>

      <form className="sourceSearchForm" onSubmit={submit} role="search">
        <label className="srOnly" htmlFor="source-query">{copy.sourceSearch}</label>
        <input
          id="source-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.sourceQueryPlaceholder}
          autoComplete="off"
        />
        <button className="primaryButton compactButton" type="submit" disabled={!query.trim() || searching}>
          {searching ? copy.searchingSources : copy.searchSources}
        </button>
      </form>

      {error ? <p className="authMessage" role="status">{error}</p> : null}

      <div className="sourceResults" aria-live="polite">
        {results.map((chunk) => (
          <article className="sourceResult" key={chunk.id}>
            <div className="sourceResultMeta">
              <strong>{sourceTitle(chunk)}</strong>
              <span>{copy.sourceChunk} {chunk.chunkIndex + 1}</span>
            </div>
            <p>{chunk.content}</p>
          </article>
        ))}
        {searched && !searching && !error && results.length === 0 ? (
          <p className="muted emptyState">{copy.noSourceResults}</p>
        ) : null}
      </div>
    </section>
  );
}
