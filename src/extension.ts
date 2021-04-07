'use strict';

import * as vscode from 'vscode';
import { workspace, window, commands, ExtensionContext } from 'vscode';
import * as path from 'path';
import * as Rx from 'rx';
import { EventEmitter } from 'events';
import { Misc } from './misc';
import { PreviewSeqDiagDocumentContentProvider } from './previewSeqDiagDocumentContentProvider';

export function activate(context: vscode.ExtensionContext) {

	const provider = new PreviewSeqDiagDocumentContentProvider();

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
		provider.getExtensionPath(context.extensionPath);
		provider.setCurrentWebViewPanel(panel);
		provider.update(Misc.previewUri);
	});

	context.subscriptions.push(showPreview);

	const emitter = new EventEmitter();
	const _ = Rx.Observable
		.fromEvent(emitter, 'update')
		.debounce(500 /* ms */)
		.subscribe(
			(_) => {
				provider.update(Misc.previewUri);
			}
		);
	
	window.onDidChangeActiveTextEditor(
		(e) => {
			if (!!e && !!e.document && (e === window.activeTextEditor)) {
				provider.update(Misc.previewUri);
			}
		}
	);

	workspace.onDidChangeTextDocument(
		(e) => {
			if (e.document === vscode.window.activeTextEditor?.document) {
				emitter.emit('update', e);
			}
		}
	);

	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(Misc.previewUri.scheme, provider)
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
