import * as vscode from 'vscode';
import OpenAI from 'openai';

import {
	buildHintPrompt
} from './prompt';

import {
	StuckReason,
	HintLevel
} from './types';

export async function generateHint(
	context: vscode.ExtensionContext,
	language: string,
	reason: StuckReason,
	message: string,
	code: string,
	targetLine: number,
	assignment?: string,
	hintLevel?: HintLevel
): Promise<string> {

	const apiKey =
		await context.secrets.get(
			'OPENAI_API_KEY'
		);

	if (!apiKey) {
		return (
			'OpenAI APIキーが設定されていません。'
			+ 'コマンドパレットから '
			+ '「Passive Coding Coach: APIキーを設定」'
			+ 'を実行してください。'
		);
	}

	const client =
		new OpenAI({
			apiKey
		});

	const prompt =
		buildHintPrompt(
			language,
			reason,
			message,
			code,
			targetLine,
			assignment,
			hintLevel
		);

	try {
		const response =
			await client.responses.create({
				model: 'gpt-4.1-mini',
				input: prompt,
				max_output_tokens: 400
			});

		return (
			response.output_text
			||
			'ヒントを生成できませんでした。'
		);
	}
	catch (error) {
		return (
			'OpenAI API呼び出し中に'
			+ 'エラーが発生しました: '
			+ String(error)
		);
	}
}