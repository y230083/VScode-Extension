import * as vscode from 'vscode';
import {
	startMonitor,
	clearFileMonitorState
} from './monitor/monitor';
import { askAssignment,clearAssignment } from './assignment/assignment';

export function activate(
	context: vscode.ExtensionContext
) {
	console.log('=== activate START ===');
	const disposable = vscode.commands.registerCommand(
		'passive-coding-coach.showStatus',
		() => {
			vscode.window.showInformationMessage(
				'Passive Coding Coach は正常に動作しています。'
			);
		}
	);

	context.subscriptions.push(disposable);


	const setApiKeyCommand =
		vscode.commands.registerCommand(
			'passive-coding-coach.setApiKey',
			async () => {
				const apiKey =
					await vscode.window.showInputBox({
						title: 'Passive Coding Coach',
						prompt: 'OpenAI APIキーを入力してください',
						password: true,
						ignoreFocusOut: true
					});

				if (!apiKey) {
					return;
				}

				await context.secrets.store(
					'OPENAI_API_KEY',
					apiKey
				);

				vscode.window.showInformationMessage(
					'OpenAI APIキーを保存しました。'
				);
			}
		);

	context.subscriptions.push(
		setApiKeyCommand
	);

	const deleteApiKeyCommand =
		vscode.commands.registerCommand(
			'passive-coding-coach.deleteApiKey',
			async () => {
				const apiKey =
					await context.secrets.get(
						'OPENAI_API_KEY'
					);

				if (!apiKey) {
					vscode.window.showInformationMessage(
						'保存されているAPIキーはありません。'
					);
					return;
				}

				const selection =
					await vscode.window.showWarningMessage(
						'保存されているOpenAI APIキーを削除しますか？',
						{ modal: true },
						'削除する'
					);

				if (selection !== '削除する') {
					return;
				}

				await context.secrets.delete(
					'OPENAI_API_KEY'
				);

				vscode.window.showInformationMessage(
					'OpenAI APIキーを削除しました。'
				);
			}
		);

	context.subscriptions.push(
		deleteApiKeyCommand
	);

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

				clearFileMonitorState(
					editor.document
				);
			}
		);

	context.subscriptions.push(clearAssignmentCommand);

	context.subscriptions.push(assignmentCommand);

	console.log('=== before startMonitor ===');

	startMonitor(context);

	console.log('=== after startMonitor ===');
	console.log('=== activate END ===');
}

export function deactivate() {}