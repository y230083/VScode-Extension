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
import {
	NotificationCooldown
} from './notificationCooldown';

export function startMonitor(context: vscode.ExtensionContext) {
	console.log("Monitor Started");
    const idleDetector = new IdleDetector();
    const cooldown = new NotificationCooldown(Config.NOTIFICATION_COOLDOWN_MS);

    vscode.workspace.onDidChangeTextDocument(() => {
	    idleDetector.updateEditTime();
    });
    
        const timer =setInterval(() => {
            const editor = vscode.window.activeTextEditor;
    
            if (!editor) {
                return;
            }

            const diagnostics = getDiagnosticsForEditor(editor);
            
            const idleSeconds = idleDetector.getIdleSeconds();
            if (!isStuck({
                idleSeconds,
                diagnostics
            })) {
                return;
            }

            const firstMessage = getFirstDiagnosticMessage(editor);
    
            if (!firstMessage) {
                return;
            }
            
            const code = getCodeContext(
                editor,
                diagnostics[0]
            );

            const errorLine = diagnostics[0].range.start.line + 1;
            
            showHintNotification(
                editor.document.languageId,
                firstMessage,
                code,
                errorLine
            );

            const notificationKey =`${editor.document.languageId}::${firstMessage}::${errorLine}`;
            if (!cooldown.canNotify(notificationKey)) {
                return;
            }
            
            cooldown.update(notificationKey);
            idleDetector.reset();
    
        }, Config.CHECK_INTERVAL_MS);

        context.subscriptions.push({
            dispose: () => clearInterval(timer)
        });
}