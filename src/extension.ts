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

/**
 * This is the default word RegExp as defined here https://github.com/microsoft/vscode/blob/89e4d3eddcf035fa1a7b24ecebd3f32e48bd4697/src/vs/editor/common/model/wordHelper.ts#L15
 * but with the hyphen character removed from the separators. This way, the hyphen is considered part of the word.
 */
const defaultWordRegExpWithoutHyphenSeparator = /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g;

/**
 * These languages all use the default word pattern, which has a hyphen character as a separator. This causes hyphens to be considered not part of the word.
 * Currently, all the languages this extension supports except for Powershell use the default word pattern.
 * The Powershell extension provides its own word pattern which does not have the hyphen character as a separator.
 * See https://github.com/PowerShell/vscode-powershell/blob/fcc13c17bfedd500b155cccda1865f1bac63f545/src/main.ts#L76
 */
const languagesWithDefaultWordPattern = new Set([
  "dockerfile",
  "makefile",
  "shellscript",
  "bat"
]);

function newTldrHoverProvider(
  repository: TldrRepository
): vscode.HoverProvider {
  return {
    provideHover(document, position, token) {
      let currentTokenRange = document.getWordRangeAtPosition(
        position,
        // Use our own word pattern in place of the default
        languagesWithDefaultWordPattern.has(document.languageId)
          ? defaultWordRegExpWithoutHyphenSeparator
          : undefined
      );
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
