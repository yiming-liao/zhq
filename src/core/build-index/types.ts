import type { Document, DocumentFrequency } from "@/types";

export interface TokenizedDoc {
  id: Document["id"];
  tokens: string[];
}

export interface IndexBuildState {
  documentFrequency: DocumentFrequency;
  tokenized: TokenizedDoc[];
  totalTokens: number;
}
