import { TldrFetcher, TldrPage } from "./TldrRepository";
import { Memento } from "vscode";
import { pathToFileURL } from "url";
const fetch = require("isomorphic-fetch");

export class CachingFetcher implements TldrFetcher {
  delegate: TldrFetcher;
  memento: Memento;

  constructor(memento: Memento, delegate: TldrFetcher) {
    this.delegate = delegate;
    this.memento = memento;
  }

  fetch(command: TldrPage): Thenable<string> {
    return this.delegate.fetch(command);
  }
}

export class GithubFetcher implements TldrFetcher {
  readonly baseUrl =
    "https://raw.githubusercontent.com/tldr-pages/tldr/master/pages/";
  fetch(page: TldrPage): Thenable<string> {
    console.log("Fetching " + page);
    let url = this.baseUrl + page.platform + "/" + page.command + ".md";
    let content = fetch(url)
      .then((response: any) => response.text())
      .then((text: any) => text);
    return content;
  }
}
