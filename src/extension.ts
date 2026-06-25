// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('passive-coding-coach.helloWorld', () => {
		vscode.window.showInformationMessage('Passive Coding Coach は動作中です');
	});

	context.subscriptions.push(disposable);

	let lastEditTime = Date.now();

	vscode.workspace.onDidChangeTextDocument(() => {
		lastEditTime = Date.now();
	});

	setInterval(() => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		const idleSeconds = (Date.now() - lastEditTime) / 1000;

		if (idleSeconds < 10) {
			return;
		}

		const diagnostics = vscode.languages.getDiagnostics(
			editor.document.uri
		);

		if (diagnostics.length === 0) {
			return;
		}

		const firstMessage = diagnostics[0].message;

		vscode.window.showInformationMessage(
			`少し詰まっているかもしれません。エラー: ${firstMessage}`
		);

		lastEditTime = Date.now();

	}, 1000);
}

// This method is called when your extension is deactivated
export function deactivate() {}
