import { MarkdownString } from "vscode";

export interface TldrFetcher {
  fetch(command: string): string;
}

export class TldrRepository {
  fetcher: TldrFetcher;

  constructor(fetcher: TldrFetcher) {
    this.fetcher = fetcher;
  }

  getMarkdown(command: string): MarkdownString {
    return new MarkdownString(this.fetcher.fetch(command));
  }
}
