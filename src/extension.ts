'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { PreviewSeqDiagPanel } from './previewSeqDiagPanel';

export function activate(context: vscode.ExtensionContext) {

	const previewPanel = new PreviewSeqDiagPanel();
	previewPanel.setExtensionPath(context.extensionPath);
	let updateTimer: ReturnType<typeof setTimeout> | undefined;

	const scheduleUpdate = () => {
		if (updateTimer) {
			clearTimeout(updateTimer);
		}

		updateTimer = setTimeout(() => {
			void previewPanel.update();
		}, 500);
	};

	let showPreview = vscode.commands.registerCommand('previewSeqDiag.showPreview', () => {
		const panel = vscode.window.createWebviewPanel(
			'previewSeqDiag',
			'Preview Sequence Diagrams',
			vscode.ViewColumn.Two,
			{
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.file(path.join(context.extensionPath, 'dist/mermaid')),
					vscode.Uri.file(path.join(context.extensionPath, 'dist/mscgenjs-inpage')),
				]
			}
		);
		previewPanel.setCurrentWebViewPanel(panel);
		panel.onDidDispose(() => {
			previewPanel.setCurrentWebViewPanel(null);
		}, null, context.subscriptions);
		void previewPanel.update();
	});

	context.subscriptions.push(showPreview);
	
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor === vscode.window.activeTextEditor) {
				void previewPanel.update(editor);
			}
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument((e) => {
			if (e.document === vscode.window.activeTextEditor?.document) {
				scheduleUpdate();
			}
		})
	);

	context.subscriptions.push(
		new vscode.Disposable(() => {
			if (updateTimer) {
				clearTimeout(updateTimer);
			}
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
