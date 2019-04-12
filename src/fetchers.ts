import { TldrFetcher } from "./TldrRepository";

export class CachingFetcher implements TldrFetcher {
  delegate: TldrFetcher;

  constructor(delegate: TldrFetcher) {
    this.delegate = delegate;
  }

  fetch(command: string): string {
    return this.delegate.fetch(command);
  }
}

export class GithubFetcher implements TldrFetcher {
  fetch(command: string): string {
    console.log("showing " + command);
    var markdown = `# apt

        > Package management utility for Debian based distributions.
                    
        - Update the list of available packages and versions (it's recommended to run this before other \`apt\` commands):`;
    return markdown;
  }
}
