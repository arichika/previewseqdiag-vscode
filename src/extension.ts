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

	const emitter = new EventEmitter();
	const handler = Rx.Observable
		.fromEvent(emitter, 'update')
		.debounce(500 /* ms */)
		.subscribe(
			(e: vscode.TextDocumentChangeEvent) => {
				provider.update(Misc.previewUri);
			}
		);
	
	window.onDidChangeActiveTextEditor(
		(e: vscode.TextEditor) => {
			if (!!e && !!e.document && (e === window.activeTextEditor)) {
				provider.update(Misc.previewUri);
			}
		}
	);

	workspace.onDidChangeTextDocument(
		(e: vscode.TextDocumentChangeEvent) => {
			if (e.document === vscode.window.activeTextEditor.document) {
				emitter.emit('update', e);
			}
		}
	);

	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(Misc.previewUri.scheme, provider)
	);

	vscode.commands.registerCommand('previewSeqDiag.showPreview', () => {
		const panel = vscode.window.createWebviewPanel(
			'previewSeqDiag',
			'Preview Sequence Diagrams',
			vscode.ViewColumn.Two,
			{
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.file(path.join(context.extensionPath, 'node_modules/mermaid/dist')),
					vscode.Uri.file(path.join(context.extensionPath, 'node_modules/mscgenjs-inpage/dist')),
				]
			}
		);
		provider.getExtensionPath(context.extensionPath);
		provider.setCurrentWebViewPanel(panel);
		provider.update(Misc.previewUri);
	});
}


export function deactivate() { }