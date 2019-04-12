import * as vscode from "vscode";
import { TldrRepository } from "./TldrRepository";
import { CachingFetcher, GithubFetcher } from "./fetchers";

export function activate(context: vscode.ExtensionContext) {
	let fetcher = new CachingFetcher(new GithubFetcher());
	let repository = new TldrRepository(fetcher);

  context.globalState.update("tldr.pages.apt", repository.getMarkdown("apt"));

	let provider: vscode.HoverProvider = newTldrHoverProvider(context);
  let supportedEditors = [
    "dockerfile",
    "makefile",
    "powershell",
    "shellscript",
    "bat"
	];
	
	registerHoverWithSupportedLanguages(supportedEditors, provider);
}

function newTldrHoverProvider(context: vscode.ExtensionContext): vscode.HoverProvider {
	return {
		provideHover(document, position, token) {
			console.log("gmm");
			const contents = new vscode.MarkdownString(context.globalState.get("tldr.pages.apt"));
			return {
				contents: [contents]
			};
		}
	};
}

function registerHoverWithSupportedLanguages(supportedEditors: string[], provider: vscode.HoverProvider) {
	supportedEditors.forEach(lang => {
		vscode.languages.registerHoverProvider(lang, provider);	
	});
}

export function deactivate() {}
