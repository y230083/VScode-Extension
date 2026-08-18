import * as vscode from 'vscode';
import { startMonitor } from './monitor/monitor';
import { askAssignment,clearAssignment } from './assignment/assignment';

export function activate(
	context: vscode.ExtensionContext
) {
	const disposable = vscode.commands.registerCommand(
		'passive-coding-coach.showStatus',
		() => {
			vscode.window.showInformationMessage(
				'Passive Coding Coach は正常に動作しています。'
			);
		}
	);

	context.subscriptions.push(disposable);

	const editor = vscode.window.activeTextEditor;

	if (editor) {
		askAssignment(
			context,
			editor.document
		);
	}

	const assignmentCommand =
		vscode.commands.registerCommand(
			'passive-coding-coach.setAssignment',
			async () => {
				const editor =
					vscode.window.activeTextEditor;

				if (!editor) {
					vscode.window.showWarningMessage(
						'課題を設定するファイルを開いてください。'
					);

					return;
				}

				await askAssignment(
					context,
					editor.document
				);
			}
		);

	const clearAssignmentCommand =
		vscode.commands.registerCommand(
			'passive-coding-coach.clearAssignment',
			async () => {
				const editor =
					vscode.window.activeTextEditor;

				if (!editor) {
					vscode.window.showWarningMessage(
						'課題設定を解除するファイルを開いてください。'
					);
					return;
				}

				await clearAssignment(
					context,
					editor.document
				);
			}
		);

	context.subscriptions.push(clearAssignmentCommand);

	context.subscriptions.push(assignmentCommand);

	startMonitor(context);
}

export function deactivate() {}