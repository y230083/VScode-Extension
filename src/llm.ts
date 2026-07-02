import { buildHintPrompt } from './prompt';

export async function generateHint(
	language: string,
	errorMessage: string
): Promise<string> {
	const prompt = buildHintPrompt(language, errorMessage);

	// 今はAPIには接続せず、仮の返答を返す
	return `
【仮ヒント】
${prompt}

まずは、エラーが出ている行の前後を確認してみましょう。
文字列や括弧が閉じられているかに注目するとよいです。
`;
}