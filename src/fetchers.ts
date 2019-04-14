import { TldrFetcher } from "./TldrRepository";
import { Memento } from "vscode";
const fetch = require("isomorphic-fetch");

export class CachingFetcher implements TldrFetcher {
  delegate: TldrFetcher;
  memento: Memento;

  constructor(memento: Memento, delegate: TldrFetcher) {
    this.delegate = delegate;
    this.memento = memento;
  }

  fetch(command: string): Thenable<string> {
    return this.delegate.fetch(command);
  }
}

export class GithubFetcher implements TldrFetcher {
  readonly baseUrl =
    "https://raw.githubusercontent.com/tldr-pages/tldr/master/pages/";
  fetch(command: string): Thenable<string> {
    console.log("fetching " + command);
    let url = this.baseUrl + "common/" + command + ".md";
    let content = fetch(url)
      .then((response: any) => response.text())
      .then((text: any) => text);
    return content;
  }
}
