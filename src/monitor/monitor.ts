import * as vscode from 'vscode';

import {
	showHintNotification
} from '../ui/notification';

import {
	getDiagnosticsForEditor,
	getFirstDiagnosticMessage
} from './diagnostics';

import {
	IdleDetector
} from './idleDetector';

import {
	Config
} from '../config/config';

import {
	getCodeContext
} from './codeContext';

import {
	detectStuckReason
} from './stuckDetector';

import {
	NotificationCooldown
} from './notificationCooldown';

import {
	EditTracker
} from './editTracker';

import {
	getAssignment
} from '../assignment/assignment';

import {
	HintProgress
} from './hintProgress';


export function startMonitor(
	context: vscode.ExtensionContext
): void {

	console.log('Monitor Started');

	const idleDetector =
		new IdleDetector();

	const editTracker =
		new EditTracker();

	const cooldown =
		new NotificationCooldown(
			Config.NOTIFICATION_COOLDOWN_MS
		);

	const hintProgressMap =
		new Map<string, HintProgress>();

	const assignmentStartTimeMap =
		new Map<string, number>();

	const editSubscription =
		vscode.workspace.onDidChangeTextDocument(
			event => {

				if (
					event.document.uri.scheme
					!== 'file'
				) {
					return;
				}

				idleDetector.updateEditTime();

				editTracker.recordEdit(event);
			}
		);

	context.subscriptions.push(
		editSubscription
	);

	const timer = setInterval(() => {

		const editor =
			vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		if (
			editor.document.uri.scheme
			!== 'file'
		) {
			return;
		}

		const assignment =
			getAssignment(
				context,
				editor.document
			);

		if (!assignment) {
			return;
		}

		const fileKey =
			editor.document.uri.toString();

		if (
			!assignmentStartTimeMap.has(
				fileKey
			)
		) {
			assignmentStartTimeMap.set(
				fileKey,
				Date.now()
			);
		}

		let hintProgress =
			hintProgressMap.get(fileKey);

		if (!hintProgress) {

			hintProgress =
				new HintProgress();

			hintProgressMap.set(
				fileKey,
				hintProgress
			);
		}

		const hintLevel =
			hintProgress.getLevel();

		const requiredIdleSeconds =
			hintProgress
				.getRequiredIdleSeconds();

		const editStatistics =
			editTracker.getStatistics();

		const assignmentStartTime =
			assignmentStartTimeMap.get(
				fileKey
			)!;

		const idleSeconds =
			editStatistics.totalEditCount > 0
				? idleDetector.getIdleSeconds()
				: (
					Date.now()
					- assignmentStartTime
				) / 1000;

		const diagnostics =
			getDiagnosticsForEditor(
				editor
			);

		const stuckResult =
			detectStuckReason({
				idleSeconds,
				diagnostics,
				editStatistics,
				hintLevel,
				requiredIdleSeconds
			});

		if (!stuckResult) {
			return;
		}


		const reason =
			stuckResult.reason;

		let message: string;
		let targetLine: number;
		let code: string;

		if (reason === 'error') {

			message =
				getFirstDiagnosticMessage(
					editor
				)
				?? 'コードにエラーがあります。';


			targetLine =
				diagnostics[0]
					.range
					.start
					.line + 1;


			code =
				getCodeContext(
					editor,
					diagnostics[0]
				);
		}

		else if (
			reason === 'repeated-edit'
		) {

			message =
				'同じ箇所を短時間に繰り返し編集しています。';


			targetLine =
				editStatistics
					.mostEditedLine
				??
				editor.selection
					.active
					.line + 1;


			code =
				getCodeAroundLine(
					editor,
					targetLine,
					10
				);
		}

		else {

			message =
				'一定時間コードの編集が止まっています。';


			targetLine =
				editor.selection
					.active
					.line + 1;


			code =
				getCodeAroundLine(
					editor,
					targetLine,
					10
				);
		}

		const notificationKey = [
			reason,
			fileKey,
			message,
			targetLine,

			reason === 'long-idle'
				? hintLevel
				: ''
		].join('::');

		if (
			!cooldown.canNotify(
				notificationKey
			)
		) {
			return;
		}

		console.log(
			'行き詰まり理由:',
			reason
		);

		console.log(
			'停止時間:',
			idleSeconds
		);

		console.log(
			'ヒントレベル:',
			hintLevel
		);

		console.log(
			'必要停止時間:',
			requiredIdleSeconds
		);

		console.log(
			'編集統計:',
			editStatistics
		);

		showHintNotification(
			context,
			editor.document.languageId,
			reason,
			message,
			code,
			targetLine,
			assignment,
			reason === 'long-idle'
				? hintLevel
				: undefined
		);

		if (
			reason === 'long-idle'
		) {
			hintProgress.advance();
		}

		cooldown.update(
			notificationKey
		);

		idleDetector.reset();

		editTracker.reset();

		if (
			reason === 'long-idle'
		) {
			assignmentStartTimeMap.set(
				fileKey,
				Date.now()
			);
		}

	},
	Config.CHECK_INTERVAL_MS);

	context.subscriptions.push({
		dispose: () =>
			clearInterval(timer)
	});
}

function getCodeAroundLine(
	editor: vscode.TextEditor,
	targetLine: number,
	surroundingLines: number
): string {

	const zeroBasedTargetLine =
		Math.max(
			0,
			targetLine - 1
		);


	const startLine =
		Math.max(
			0,
			zeroBasedTargetLine
				- surroundingLines
		);


	const endLine =
		Math.min(
			editor.document.lineCount - 1,
			zeroBasedTargetLine
				+ surroundingLines
		);


	const endCharacter =
		editor.document
			.lineAt(endLine)
			.text
			.length;


	const range =
		new vscode.Range(
			startLine,
			0,
			endLine,
			endCharacter
		);


	return editor.document
		.getText(range);
}