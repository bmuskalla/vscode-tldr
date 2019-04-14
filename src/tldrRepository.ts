import { MarkdownString } from "vscode";

export interface TldrFetcher {
  fetch(command: string): Thenable<string>;
}

const fetch = require("isomorphic-fetch");
class TldrIndex {
  
  pages: string[] = [];

  readonly baseUrl =
    "https://api.github.com/repos/tldr-pages/tldr/contents/pages/";

  constructor() {
    this.initializeData();
  }

  async initializeData() {
    await this.fetchPageIndex("common");
  }

  fetchPageIndex(platform: string): Promise<void> {
    return fetch(this.baseUrl + platform)
      .then((response: any) => response.json())
      .then((data: any) => {
        let doc;
        for (doc of data) {
          this.pages.push(doc.name.split(".")[0]);
        }
      });
  }

  isAvailable(command: string) {
    return this.pages.includes(command);
  }
}
export class TldrRepository {
  fetcher: TldrFetcher;
  index: TldrIndex;

  constructor(fetcher: TldrFetcher) {
    this.fetcher = fetcher;
    this.index = new TldrIndex();
  }

  getMarkdown(command: string): Thenable<MarkdownString> {
    if (this.index.isAvailable(command)) {
      return this.fetcher
        .fetch(command)
        .then(text => new MarkdownString(this.format(text)));
    } else {
      return Promise.reject("not available");
    }
  }

  format(contents: string): string {
    contents = contents.replace("\n> ", "\n");
    let headline = contents.indexOf("\n");
    return contents.substring(headline);
  }

}
