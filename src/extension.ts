import * as vscode from "vscode";
import { TldrRepository, TldrFetcher } from "./TldrRepository";
import { CachingFetcher, GithubFetcher } from "./fetchers";

export function activate(context: vscode.ExtensionContext) {
  let fetcher = new CachingFetcher(context.globalState, new GithubFetcher());
  let repository = new TldrRepository(fetcher);

  let provider: vscode.HoverProvider = newTldrHoverProvider(repository);
  let supportedLanguageModes = [
    "dockerfile",
    "makefile",
    "powershell",
    "shellscript",
    "bat"
  ];

  registerHoverWithSupportedLanguages(
    context,
    supportedLanguageModes,
    provider
  );
}

function newTldrHoverProvider(
  repository: TldrRepository
): vscode.HoverProvider {
  return {
    provideHover(document, position, token) {
      let currentTokenRange = document.getWordRangeAtPosition(position);
      if (currentTokenRange !== undefined && currentTokenRange.isSingleLine) {
        let currentToken = document.getText(currentTokenRange);
        const pageMarkdown = repository.getMarkdown(currentToken);
        return pageMarkdown.then(
          markdown => new vscode.Hover(markdown),
          rejected => null
        );
      }
    }
  };
}

function registerHoverWithSupportedLanguages(
  context: vscode.ExtensionContext,
  supportedEditors: string[],
  provider: vscode.HoverProvider
) {
  supportedEditors.forEach(lang => {
    const selectors = [
      { scheme: "untitled", language: lang },
      { scheme: "file", language: lang }
    ];
    let disposable = vscode.languages.registerHoverProvider(
      selectors,
      provider
    );
    context.subscriptions.push(disposable);
  });
}

export function deactivate() {}
