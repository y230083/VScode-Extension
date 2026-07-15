import * as vscode from 'vscode';

export interface StuckContext {
	idleSeconds: number;
	diagnostics: vscode.Diagnostic[];
}

export function isStuck(context: StuckContext): boolean {

	// ①10秒以上停止
	if (context.idleSeconds < 10) {
		return false;
	}

	// ②エラーが存在する
	if (context.diagnostics.length === 0) {
		return false;
	}

	return true;
}