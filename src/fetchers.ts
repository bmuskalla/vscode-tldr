import { TldrFetcher, TldrPage } from "./TldrRepository";
import { Memento } from "vscode";
import { pathToFileURL } from "url";
const fetch = require("isomorphic-fetch");

export class CachingFetcher implements TldrFetcher {
  static readonly cacheKeyPrefix = "tldrfetcher.cache.";
  delegate: TldrFetcher;
  memento: Memento;

  constructor(memento: Memento, delegate: TldrFetcher) {
    this.delegate = delegate;
    this.memento = memento;
  }

  fetch(command: TldrPage): Thenable<string> {
    const cacheKey = CachingFetcher.cacheKeyPrefix + command.command;
    let cachedPage = this.memento.get(cacheKey);
    if (cachedPage === undefined) {
      return this.delegate.fetch(command).then(page => {
        this.memento.update(cacheKey, page);
        return page;
      });
    }
    return Promise.resolve(String(cachedPage));
  }
}

export class GithubFetcher implements TldrFetcher {
  readonly baseUrl =
    "https://raw.githubusercontent.com/tldr-pages/tldr/master/pages/";
  fetch(page: TldrPage): Thenable<string> {
    let url = this.baseUrl + page.platform + "/" + page.command + ".md";
    let content = fetch(url)
      .then((response: any) => response.text())
      .then((text: any) => text);
    return content;
  }
}
