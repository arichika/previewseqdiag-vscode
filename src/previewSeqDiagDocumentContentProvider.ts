'use strict';

import * as vscode from 'vscode';
import { Misc } from './misc';
import { CodeSnippetInterface } from './codeSnippetInterface';
import { DefaultCodeSnippet } from './defaultCodeSnippet';
import { MscgenCodeSnippet } from './mscgenCodeSnippet';
import { MermaidCodeSnippet } from './mermaidCodeSnippet';

const suppotablelanguageId: string[] = ["mermaid","mmd","mscgen","msgenny","xu"];

export class PreviewSeqDiagDocumentContentProvider implements vscode.TextDocumentContentProvider
{
    latestSnippetResultBuffer: string = "";
    webViewPanel: vscode.WebviewPanel | null = null;
    extentionPath: string = "";
    
    private _currentSnippet : CodeSnippetInterface = DefaultCodeSnippet.instance;

    // private _onDidChange: vscode.EventEmitter<vscode.Uri> = new vscode.EventEmitter<vscode.Uri>();
	// readonly onDidChange: vscode.Event<vscode.Uri> = this._onDidChange.event;

    public setCurrentWebViewPanel(panel: vscode.WebviewPanel) {
        this.webViewPanel = panel;
    }

    public getExtensionPath(path: string) {
        this.extentionPath = path;
    }

    public update(uri: vscode.Uri) {
        if(vscode.window.activeTextEditor) {
            if(suppotablelanguageId.indexOf(vscode.window.activeTextEditor.document.languageId) > -1) {
                // this._onDidChange.fire(uri);
                this.refresh();
            }
        }
    }

    public provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken):  vscode.ProviderResult<string> {
        return this.latestSnippetResultBuffer;
    }

    private refresh() {
        let editor = vscode.window.activeTextEditor;

        if(!editor){
            return this.latestSnippetResultBuffer;
        }

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

        if(this.webViewPanel && this.webViewPanel.webview){
            this._currentSnippet
            .createCodeSnippet(editor.document.languageId, this.extentionPath, this.webViewPanel.webview)
            .then(result=>{
                this.latestSnippetResultBuffer = result;
                if(this.webViewPanel && this.webViewPanel.webview){
                    this.webViewPanel.webview.html = result;
                }
            })
            .catch();
        }
    }
}
