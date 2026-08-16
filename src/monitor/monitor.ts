import * as vscode from 'vscode';

import { showHintNotification } from '../ui/notification';

import {
	getDiagnosticsForEditor,
	getFirstDiagnosticMessage
} from './diagnostics';

import { IdleDetector } from './idleDetector';
import { Config } from '../config/config';
import { getCodeContext } from './codeContext';
import { isStuck } from './stuckDetector';
import { NotificationCooldown } from './notificationCooldown';
import { EditTracker } from './editTracker';
import { getAssignment } from '../assignment/assignment';
import { StuckReason } from '../llm/types';


export function startMonitor(
	context: vscode.ExtensionContext
): void {
	console.log('Monitor Started');

	const idleDetector = new IdleDetector();

	const cooldown = new NotificationCooldown(
		Config.NOTIFICATION_COOLDOWN_MS
	);

	const editTracker = new EditTracker();

	const editSubscription =
		vscode.workspace.onDidChangeTextDocument(event => {
			
			if (event.document.uri.scheme !== 'file') {
				return;
			}

			idleDetector.updateEditTime();
			editTracker.recordEdit(event);
		});

	context.subscriptions.push(editSubscription);

	const timer = setInterval(() => {
		const editor =
			vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		if (editor.document.uri.scheme !== 'file') {
			return;
		}

		const diagnostics =
			getDiagnosticsForEditor(editor);

		const idleSeconds =
			idleDetector.getIdleSeconds();

		const editStatistics =
			editTracker.getStatistics();

		if (!isStuck({
			idleSeconds,
			diagnostics,
			editStatistics
		})) {
			return;
		}

		const hasError =
			diagnostics.length > 0;

		let message: string;
		let targetLine: number;
		let code: string;
		let notificationType: string;

		const reason: StuckReason = hasError
		? 'error'
		: 'repeated-edit';

		if (hasError) {
			message =
				getFirstDiagnosticMessage(editor)
				?? 'コードにエラーがあります。';

			targetLine =
				diagnostics[0].range.start.line + 1;

			code = getCodeContext(
				editor,
				diagnostics[0]
			);

			notificationType = 'error';
		}

		else {
			message =
				'同じ箇所を短時間に繰り返し編集しています。';

			targetLine =
				editStatistics.mostEditedLine
				?? editor.selection.active.line + 1;

			code = getCodeAroundLine(
				editor,
				targetLine,
				10
			);

			notificationType = 'repeated-edit';
		}

		const notificationKey = [
			notificationType,
			editor.document.uri.toString(),
			message,
			targetLine
		].join('::');

		if (!cooldown.canNotify(notificationKey)) {
			return;
		}

		console.log('行き詰まりを検出しました');
		console.log('通知種類:', notificationType);
		console.log('停止時間:', idleSeconds);
		console.log('編集統計:', editStatistics);
		console.log('対象行:', targetLine);
		
		const assignment = getAssignment();

		showHintNotification(
			editor.document.languageId,
			reason,
			message,
			code,
			targetLine,
			assignment
		);

		cooldown.update(notificationKey);
		idleDetector.reset();
		editTracker.reset();

	}, Config.CHECK_INTERVAL_MS);

	
	context.subscriptions.push({
		dispose: () => clearInterval(timer)
	});
}

/**
 * 
 *
 * @param editor 
 * @param targetLine 
 * @param surroundingLines 
 */
function getCodeAroundLine(
	editor: vscode.TextEditor,
	targetLine: number,
	surroundingLines: number
): string {
	const zeroBasedTargetLine =
		Math.max(0, targetLine - 1);

	const startLine = Math.max(
		0,
		zeroBasedTargetLine - surroundingLines
	);

	const endLine = Math.min(
		editor.document.lineCount - 1,
		zeroBasedTargetLine + surroundingLines
	);

	const endCharacter =
		editor.document.lineAt(endLine).text.length;

	const range = new vscode.Range(
		startLine,
		0,
		endLine,
		endCharacter
	);

	return editor.document.getText(range);
}