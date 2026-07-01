import * as vscode from 'vscode';
import { showHintNotification } from './notification';
import {
	getDiagnosticsForEditor,
	getFirstDiagnosticMessage
} from './diagnostics';
import { IdleDetector } from './idleDetector';

export function startMonitor(context: vscode.ExtensionContext) {
	console.log("Monitor Started");
    const idleDetector = new IdleDetector();

    vscode.workspace.onDidChangeTextDocument(() => {
	    idleDetector.updateEditTime();
    });
    
        const timer =setInterval(() => {
            const editor = vscode.window.activeTextEditor;
    
            if (!editor) {
                return;
            }
    
            const idleSeconds = idleDetector.getIdleSeconds();
    
            if (idleSeconds < 10) {
                return;
            }
    
            const diagnostics = getDiagnosticsForEditor(editor);
    
            if (diagnostics.length === 0) {
                return;
            }
    
            const firstMessage = getFirstDiagnosticMessage(editor);
    
            if (!firstMessage) {
                return;
            }
    
            showHintNotification(firstMessage);
    
            idleDetector.reset();
    
        }, 1000);

        context.subscriptions.push({
            dispose: () => clearInterval(timer)
        });
}