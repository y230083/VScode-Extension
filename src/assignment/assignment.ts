import * as vscode from 'vscode';

let assignmentText: string | undefined;

export async function askAssignment(): Promise<void> {
	const input = await vscode.window.showInputBox({
		title: 'Passive Coding Coach',
		prompt: '取り組む課題の内容を入力してください',
		placeHolder:
			'例：再帰を用いて、フィボナッチ数列を計算するプログラムを作成する'
	});

	if (!input) {
		vscode.window.showWarningMessage(
			'課題内容が入力されませんでした。'
		);

		return;
	}

	assignmentText = input;

	vscode.window.showInformationMessage(
		`課題を設定しました: ${assignmentText}`
	);
}

export function getAssignment(): string | undefined {
	return assignmentText;
}