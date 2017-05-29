'use strict';

import * as vscode from 'vscode';
import { workspace, window, commands, ExtensionContext } from 'vscode';

import * as Path from 'path';
import * as Rx from 'rx';
import { EventEmitter } from 'events';

import { Misc } from './misc';
import { PreviewSeqDiagDocumentContentProvider } from './previewSeqDiagDocumentContentProvider';


export function activate(context: vscode.ExtensionContext)
{
	const provider = new PreviewSeqDiagDocumentContentProvider();

	const emitter = new EventEmitter();
	const handler = Rx.Observable
		.fromEvent(emitter, 'update')
		.debounce(500 /* ms */)
		.subscribe(
			(e: vscode.TextDocumentChangeEvent) =>
			{
				provider.update(Misc.previewUri);
			});
	
    window.onDidChangeActiveTextEditor(
		(e: vscode.TextEditor) =>
		{
			if (!!e &&　!!e.document && (e === window.activeTextEditor))
			{
				provider.update(Misc.previewUri);
	        }
		});

	workspace.onDidChangeTextDocument(
		(e: vscode.TextDocumentChangeEvent) =>
		{
			if (e.document === vscode.window.activeTextEditor.document)
			{
				emitter.emit('update', e)
			}
		});

	let regCommand = vscode.commands.registerCommand('previewSeqDiag.showPreview',
		() =>
		{
			return showPreview(context);
		});

	let regProvider = vscode.workspace.registerTextDocumentContentProvider(Misc.previewUri.scheme, provider);

	context.subscriptions.push(regCommand, regProvider);
}


function showPreview(context: vscode.ExtensionContext) : void
{
    vscode.commands.executeCommand(
        'vscode.previewHtml',
        Misc.previewUri,
        vscode.ViewColumn.Two,
        'Preview Sequence Diagrams')
		.then(
			(success) =>
			{},
			(reason) =>
			{
				vscode.window.showErrorMessage(reason);
			});
}


export function deactivate()
{
}