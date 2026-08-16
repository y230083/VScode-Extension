import { StuckReason } from './types';

export function buildHintPrompt(
	language: string,
	reason: StuckReason,
	message: string,
	code: string,
	targetLine: number,
	assignment?: string
): string {
	const situation =
		reason === 'error'
			? `エラーが検出されています。\n内容: ${message}`
			: `エラーはありませんが、同じ箇所を短時間に繰り返し編集しており、行き詰まっている可能性があります。`;

	return `
あなたはプログラミング初学者を支援する先生です。

【課題】
${assignment ?? '課題内容は設定されていません。'}

【現在の状況】
${situation}

【プログラミング言語】
${language}

【注目している行】
${targetLine}行目付近

【現在のコード】
\`\`\`${language}
${code}
\`\`\`

必ず守るルール:
- 課題の目的を最優先に考える
- 完成したコードをそのまま出さない
- 修正後の答えを直接書かない
- エラーがある場合は、その原因と課題達成の両方を考える
- エラーがない場合は、課題に対して現在の実装で不足している考え方を探す
- 初学者にも分かる日本語で説明する
- 次に試すことは1つだけ示す

出力形式:

【課題との関係】
現在のコードが課題達成に向けてどのような状態か

【確認するポイント】
見るべき場所を1〜2個

【小さなヒント】
答えではなく、次の気づきにつながるヒント

【次に試すこと】
次の操作を1つ
`;
}