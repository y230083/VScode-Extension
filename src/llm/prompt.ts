import {
	StuckReason,
	HintLevel
} from './types';

export function buildHintPrompt(
	language: string,
	reason: StuckReason,
	message: string,
	code: string,
	targetLine: number,
	assignment?: string,
	hintLevel?: HintLevel
): string {

	let situation: string;

	if (reason === 'error') {
		situation = `
コードにエラーが検出されています。

エラー内容:
${message}

エラーの原因だけでなく、
課題を達成するために必要な修正の方向も考えてください。
`;
	}

	else if (
		reason === 'repeated-edit'
	) {
		situation = `
エラーは検出されていません。

しかし、学習者は同じ箇所の近辺を
短時間に何度も編集しています。

実装方法について迷っている可能性があります。
`;
	}

	else {
		situation = `
エラーは検出されていません。

しかし、一定時間コードの編集が止まっています。

学習者が次に何を書けばよいのか、
または課題をどう進めればよいのか
迷っている可能性があります。
`;
	}


	let hintInstruction = `
答えを直接示さず、
学習者が自分で考えられるヒントを出してください。
`;

	if (
		reason === 'long-idle'
		&& hintLevel === 'light'
	) {
		hintInstruction = `
これは1段階目のヒントです。

かなり軽いヒントにしてください。

- 答えにつながる具体的なコードは書かない
- 課題に必要な考え方を思い出させる
- 「何を考えるべきか」を示す
- 学習者自身が次の一歩に気づける程度にする
`;
	}

	else if (
		reason === 'long-idle'
		&& hintLevel === 'medium'
	) {
		hintInstruction = `
これは2段階目のヒントです。

1段階目より具体的にしてください。

- 現在のコードのどの部分に注目するか明確にする
- 必要な処理や考え方をかなり具体的に説明する
- 関数名や考えるべき条件などは示してよい
- ただし完成コードは提示しない
`;
	}

	else if (
		reason === 'long-idle'
		&& hintLevel === 'strong'
	) {
		hintInstruction = `
これは3段階目のヒントです。

学習者が長時間行き詰まっています。
かなり答えに近いヒントを出してください。

- 処理の流れを具体的に説明する
- 必要であれば疑似コードを提示してよい
- 条件分岐や関数呼び出しの形もかなり具体的に示してよい
- ただし、課題の完成コードを丸ごと提示することは避ける
`;
	}


	return `
あなたはプログラミング初学者を
支援する先生です。

【課題】
${assignment ?? '課題内容は設定されていません。'}

【現在の状況】
${situation}

【ヒントの強さ】
${hintLevel ?? '通常'}

${hintInstruction}

【プログラミング言語】
${language}

【注目している行】
${targetLine}行目付近

【現在のコード】
\`\`\`${language}
${code}
\`\`\`

必ず守るルール:

- 課題の目的を最優先にする
- 現在できている部分も評価する
- 不足している考え方を探す
- 初学者にも分かる日本語を使う
- 一度に複数の課題を与えすぎない
- 次に試すことは1つに絞る

出力形式:

【課題との関係】
現在どこまでできているか

【確認するポイント】
見るべき箇所

【ヒント】
現在のヒントレベルに応じた内容

【次に試すこと】
次の行動を1つ
`;
}