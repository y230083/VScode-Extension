import * as path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

import {
	buildHintPrompt
} from './prompt';

import {
	StuckReason,
	HintLevel
} from './types';


const envPath = path.join(
	__dirname,
	'..',
	'.env'
);

dotenv.config({
	path: envPath
});

const apiKey =
	process.env.OPENAI_API_KEY;


export async function generateHint(
	language: string,
	reason: StuckReason,
	message: string,
	code: string,
	targetLine: number,
	assignment?: string,
	hintLevel?: HintLevel
): Promise<string> {

	if (!apiKey) {
		return (
			'OpenAI APIキーが設定されていません。'
			+ '.env を確認してください。'
		);
	}

	const client = new OpenAI({
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