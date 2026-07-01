import * as vscode from 'vscode';
import { showHintNotification } from './notification';
import {
	getDiagnosticsForEditor,
	getFirstDiagnosticMessage
} from './diagnostics';

export function startMonitor(context: vscode.ExtensionContext) {
	console.log("Monitor Started");
    let lastEditTime = Date.now();
    
        vscode.workspace.onDidChangeTextDocument(() => {
            lastEditTime = Date.now();
        });
    
        const timer =setInterval(() => {
            const editor = vscode.window.activeTextEditor;
    
            if (!editor) {
                return;
            }
    
            const idleSeconds = (Date.now() - lastEditTime) / 1000;
    
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
    
            lastEditTime = Date.now();
    
        }, 1000);

        context.subscriptions.push({
            dispose: () => clearInterval(timer)
        });
}