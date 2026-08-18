import * as vscode from 'vscode';

import {
	EditStatistics
} from './editTracker';

import {
	StuckReason,
	HintLevel
} from '../llm/types';

import {
	Config
} from '../config/config';

export interface StuckContext {
	idleSeconds: number;
	diagnostics: vscode.Diagnostic[];
	editStatistics: EditStatistics;

	hintLevel: HintLevel;

	requiredIdleSeconds: number;
}

export interface StuckResult {
	reason: StuckReason;
	hintLevel?: HintLevel;
}

export function detectStuckReason(
	context: StuckContext
): StuckResult | undefined {
	const hasError =
		context.diagnostics.length > 0;

	const hasRepeatedNearbyEdits =
		context.editStatistics.maxNearbyEditCount >= 5;

	if (
		context.idleSeconds >= Config.IDLE_SECONDS &&
		hasError
	) {
		return {
			reason: 'error'
		};
	}

	if (
		context.idleSeconds >= Config.IDLE_SECONDS &&
		hasRepeatedNearbyEdits
	) {
		return {
			reason: 'repeated-edit'
		};
	}

	if (
		context.idleSeconds >=
		context.requiredIdleSeconds
	) {
		return {
			reason: 'long-idle',
			hintLevel: context.hintLevel
		};
	}

	return undefined;
}