import * as vscode from 'vscode';

export function showHintNotification(errorMessage: string) {
	vscode.window.showInformationMessage(
		'少し詰まっているかもしれません。',
		'ヒントを見る',
		'無視する'
	).then(selection => {
		if (selection === 'ヒントを見る') {
			vscode.window.showInformationMessage(
				`エラー内容: ${errorMessage}`
			);
		}
	});
}