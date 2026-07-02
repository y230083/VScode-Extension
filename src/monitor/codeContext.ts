import * as vscode from 'vscode';

export function getCodeContext(
	editor: vscode.TextEditor,
	diagnostic: vscode.Diagnostic,
	contextLines: number = 10
): string {
	const document = editor.document;

	const errorLine = diagnostic.range.start.line;

	const startLine = Math.max(0, errorLine - contextLines);
	const endLine = Math.min(
		document.lineCount - 1,
		errorLine + contextLines
	);

	const lines: string[] = [];

	for (let i = startLine; i <= endLine; i++) {
		const lineText = document.lineAt(i).text;
		const lineNumber = i + 1;

		lines.push(`${lineNumber}: ${lineText}`);
	}

	return lines.join('\n');
}