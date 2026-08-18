import * as vscode from 'vscode';

import {
	generateHint
} from '../llm/llm';

import {
	StuckReason,
	HintLevel
} from '../llm/types';

import {
	createCacheKey,
	getCachedHint,
	saveHintToCache
} from '../llm/cache';

const outputChannel =
	vscode.window.createOutputChannel(
		'Passive Coding Coach'
	);

export function showHintNotification(
	language: string,
	reason: StuckReason,
	message: string,
	code: string,
	targetLine: number,
	assignment?: string,
	hintLevel?: HintLevel
) {
	vscode.window.showInformationMessage(
		'少し詰まっているかもしれません。',
		'ヒントを見る',
		'無視する'
	).then(async selection => {

		if (
			selection !== 'ヒントを見る'
		) {
			return;
		}

		const cacheKey =
			createCacheKey(
				language,
				reason,
				message,
				code,
				hintLevel
			);

		let hint =
			getCachedHint(cacheKey);

		if (!hint) {
			hint =
				await generateHint(
					language,
					reason,
					message,
					code,
					targetLine,
					assignment,
					hintLevel
				);

			saveHintToCache(
				cacheKey,
				hint
			);
		}
		else {
			hint =
				`【キャッシュから表示】\n\n${hint}`;
		}

		outputChannel.clear();

		outputChannel.appendLine(
			'=== Passive Coding Coach ==='
		);

		if (
			reason === 'long-idle'
			&& hintLevel
		) {
			outputChannel.appendLine(
				`Hint Level: ${hintLevel}`
			);
		}

		outputChannel.appendLine('');
		outputChannel.appendLine(hint);

		outputChannel.show();
	});
}