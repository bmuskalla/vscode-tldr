import { MarkdownString, commands } from "vscode";
import { platform } from "os";

export interface TldrFetcher {
  fetch(command: TldrPage): Thenable<string>;
}

export class TldrPage {
  platform: TldrPlatform;
  command: string;

  constructor(platform: TldrPlatform, command:string) {
    this.platform = platform;
    this.command = command;
  }

  toString(): string {
    return this.platform + "/" + this.command;
  }
  
}

export enum TldrPlatform {
  Common = "common",
  Linux = "linux",
  OSX = "osx",
  SunOS = "sunos",
  Windows = "windows"
}

const fetch = require("isomorphic-fetch");

class TldrIndex {
  pages: TldrPage[] = [];

  readonly baseUrl =
    "https://api.github.com/repos/tldr-pages/tldr/contents/pages/";

  constructor() {
    this.initializeData();
  }

  async initializeData() {
    Object.values(TldrPlatform).forEach(async (platform) => {
      console.log("Fetching index for '" + platform + "'");
      await this.fetchPageIndex(platform);
    });
  }

  fetchPageIndex(platformToFetch: TldrPlatform): Promise<void> {
    return fetch(this.baseUrl + platformToFetch)
      .then((response: any) => response.json())
      .then((data: any) => {
        let doc;
        for (doc of data) {
          let commandName = doc.name.split(".")[0];
          let page = new TldrPage(platformToFetch, commandName);
          this.pages.push(page);
        }
      });
  }

  isAvailable(command: string) {
    return this.pages.filter((p: TldrPage) => p.command === command)[0];
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
    let page = this.index.isAvailable(command);
    if (page !== null) {
      return this.fetcher
        .fetch(page)
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
