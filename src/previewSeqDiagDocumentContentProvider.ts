'use strict';

import * as vscode from 'vscode';
import { Misc } from './misc';
import { CodeSnippetInterface } from './codeSnippetInterface';
import { DefaultCodeSnippet } from './defaultCodeSnippet';
import { MscgenCodeSnippet } from './mscgenCodeSnippet';
import { MermaidCodeSnippet } from './mermaidCodeSnippet';

const suppotablelanguageId: string[] = ["mermaid","mmd","mscgen","msgenny","xu"];
let latestSnippetResultBuffer: string = null;
let webViewPanel: vscode.WebviewPanel = null;
let extentionPath: string = null;

export class PreviewSeqDiagDocumentContentProvider implements vscode.TextDocumentContentProvider
{
    private _currentSnippet : CodeSnippetInterface = DefaultCodeSnippet.instance;

    // private _onDidChange: vscode.EventEmitter<vscode.Uri> = new vscode.EventEmitter<vscode.Uri>();
	// readonly onDidChange: vscode.Event<vscode.Uri> = this._onDidChange.event;

    public setCurrentWebViewPanel(panel: vscode.WebviewPanel) {
        webViewPanel = panel;
    }

    public getExtensionPath(path: string) {
        extentionPath = path;
    }

    public update(uri: vscode.Uri) {
        if(suppotablelanguageId.indexOf(vscode.window.activeTextEditor.document.languageId) > -1) {
            // this._onDidChange.fire(uri);
            this.refresh();
        }
    }

    public provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken):  vscode.ProviderResult<string> {
        return latestSnippetResultBuffer;
    }

    private refresh() {
        let editor = vscode.window.activeTextEditor;

        if(!editor)
            return latestSnippetResultBuffer;

        switch (editor.document.languageId) {
            case "mermaid":
            case "mmd":
                this._currentSnippet = MermaidCodeSnippet.instance;
                break;

            case "mscgen":
            case "msgenny":
            case "xu":
                this._currentSnippet = MscgenCodeSnippet.instance;
                break;

            default:
                this._currentSnippet = DefaultCodeSnippet.instance;
                break;
        }

        this._currentSnippet
        .createCodeSnippet(editor.document.languageId, extentionPath)
        .then(result=>{
            latestSnippetResultBuffer = result;
            if(webViewPanel)
                webViewPanel.webview.html = result;
        });
    }
}
