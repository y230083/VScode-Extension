import * as vscode from 'vscode';
import { EditStatistics } from './editTracker';

export interface StuckContext {
	idleSeconds: number;
	diagnostics: vscode.Diagnostic[];
	editStatistics: EditStatistics;
}

export function isStuck(context: StuckContext): boolean {
	
	if (context.idleSeconds < 10) {
		return false;
	}

	const hasError =
		context.diagnostics.length > 0;

	const hasRepeatedNearbyEdits =
		context.editStatistics.maxNearbyEditCount >= 5;

	return hasError || hasRepeatedNearbyEdits;
}