import * as path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { buildHintPrompt } from './prompt';

const envPath = path.join(__dirname, '..', '.env');

dotenv.config({
	path: envPath
});

const apiKey = process.env.OPENAI_API_KEY;

const client = new OpenAI({
	apiKey: apiKey
});

export async function generateHint(
	language: string,
	errorMessage: string
): Promise<string> {
	if (!apiKey) {
		return 'OpenAI APIキーが設定されていません。.env を確認してください。';
	}

	const prompt = buildHintPrompt(language, errorMessage);

	try {
		const response = await client.responses.create({
			model: 'gpt-4.1-mini',
			input: prompt,
			max_output_tokens: 300
		});

		return response.output_text || 'ヒントを生成できませんでした。';
	} catch (error) {
		return `OpenAI API呼び出し中にエラーが発生しました: ${String(error)}`;
	}
}