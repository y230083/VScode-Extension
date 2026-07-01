import * as vscode from 'vscode';

export function getDiagnosticsForEditor(editor: vscode.TextEditor) {
	return vscode.languages.getDiagnostics(
		editor.document.uri
	);
}

export function getFirstDiagnosticMessage(editor: vscode.TextEditor): string | undefined {
	const diagnostics = getDiagnosticsForEditor(editor);

	if (diagnostics.length === 0) {
		return undefined;
	}

	return diagnostics[0].message;
}