import * as vscode from 'vscode';
import { generateHint } from './llm';

const outputChannel = vscode.window.createOutputChannel('Passive Coding Coach');

export function showHintNotification(
	language: string,
	errorMessage: string
) {
	vscode.window.showInformationMessage(
		'少し詰まっているかもしれません。',
		'ヒントを見る',
		'無視する'
	).then(async selection => {
		if (selection === 'ヒントを見る') {
			const hint = await generateHint(language, errorMessage);

			outputChannel.clear();
			outputChannel.appendLine('=== Passive Coding Coach ===');
			outputChannel.appendLine('');
			outputChannel.appendLine(hint);
			outputChannel.show();

			vscode.window.showInformationMessage(
				'ヒントを出力チャンネルに表示しました。'
			);
		}
	});
}