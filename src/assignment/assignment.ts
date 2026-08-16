import * as vscode from 'vscode';

function getAssignmentKey(
	document: vscode.TextDocument
): string {
	return `assignment:${document.uri.toString()}`;
}

export async function askAssignment(
	context: vscode.ExtensionContext,
	document: vscode.TextDocument
): Promise<void> {
	const currentAssignment =
		getAssignment(context, document);

	const input = await vscode.window.showInputBox({
		title: 'Passive Coding Coach',
		prompt: 'このファイルの課題内容を入力してください',
		placeHolder:
			'例：再帰を用いて、フィボナッチ数列を計算するプログラムを作成する',
		value: currentAssignment ?? ''
	});

	if (!input) {
		return;
	}

	await context.workspaceState.update(
		getAssignmentKey(document),
		input
	);

	vscode.window.showInformationMessage(
		'このファイルの課題を保存しました。'
	);
}

export async function clearAssignment(
	context: vscode.ExtensionContext,
	document: vscode.TextDocument
): Promise<void> {
	await context.workspaceState.update(
		getAssignmentKey(document),
		undefined
	);

	vscode.window.showInformationMessage(
		'このファイルの課題設定を解除しました。'
	);
}

export function getAssignment(
	context: vscode.ExtensionContext,
	document: vscode.TextDocument
): string | undefined {
	return context.workspaceState.get<string>(
		getAssignmentKey(document)
	);
}