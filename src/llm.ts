import { buildHintPrompt } from './prompt';

export async function generateHint(
	language: string,
	errorMessage: string
): Promise<string> {

	const prompt = buildHintPrompt(language, errorMessage);

	console.log(prompt);   

	return `
文字列の開始位置と終了位置を確認してみましょう。

括弧や引用符が対応しているかも確認すると解決につながるかもしれません。
`;
}