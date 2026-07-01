// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { showHintNotification } from './notification';
import { getDiagnosticsForEditor, getFirstDiagnosticMessage } from './diagnostics';
import { startMonitor } from './monitor';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('passive-coding-coach.helloWorld', () => {
		vscode.window.showInformationMessage('Passive Coding Coach は動作中です');
	});

	context.subscriptions.push(disposable);

	startMonitor(context);

}

// This method is called when your extension is deactivated
export function deactivate() {}
