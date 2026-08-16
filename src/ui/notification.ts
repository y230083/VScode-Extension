import * as vscode from 'vscode';
import { generateHint } from '../llm/llm';
import {
	createCacheKey,
	getCachedHint,
	saveHintToCache
} from '../llm/cache';
import { StuckReason } from '../llm/types';

const outputChannel = vscode.window.createOutputChannel('Passive Coding Coach');

export function showHintNotification(
	language: string,
	reason: StuckReason,
	message: string,
	code: string,
	targetLine: number,
	assignment?: string
) {
	vscode.window.showInformationMessage(
		'少し詰まっているかもしれません。',
		'ヒントを見る',
		'無視する'
	).then(async selection => {
		if (selection === 'ヒントを見る') {
			const cacheKey = createCacheKey(language, reason, message, code);

			let hint = getCachedHint(cacheKey);

			if (!hint) {
				hint = await generateHint(
					language,
					reason,
					message,
					code,
					targetLine,
					assignment
				);
				saveHintToCache(cacheKey, hint);
			} else {
				hint = `【キャッシュから表示】\n\n${hint}`;
			}

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