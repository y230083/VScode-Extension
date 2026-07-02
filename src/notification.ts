import * as vscode from 'vscode';
import { generateHint } from './llm';

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

			vscode.window.showInformationMessage(hint);
		}
	});
}