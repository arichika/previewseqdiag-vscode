'use strict';

import * as vscode from 'vscode';
import { workspace, window, commands, ExtensionContext } from 'vscode';

import { Misc } from './misc';
import { CodeSnippetInterface } from './codeSnippetInterface';
import { DefaultCodeSnippet } from './defaultCodeSnippet';
import { MscgenCodeSnippet } from './mscgenCodeSnippet';
import { MermaidCodeSnippet } from './mermaidCodeSnippet';

const suppotablelanguageId: string[] = ["mermaid","mmd","mscgen","msgenny","xu"];
let latestSnippetResultBuffer: string = null;

export class PreviewSeqDiagDocumentContentProvider implements vscode.TextDocumentContentProvider
{
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

    get onDidChange(): vscode.Event<vscode.Uri>
    {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri)
    {
        if(suppotablelanguageId.indexOf(vscode.window.activeTextEditor.document.languageId) > -1)
        {
                this._onDidChange.fire(uri);
        }
    }


    private _currentSnippet : CodeSnippetInterface = DefaultCodeSnippet.instance;

    public async provideTextDocumentContent(uri: vscode.Uri): Promise<string>
    {
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

        latestSnippetResultBuffer = await this._currentSnippet.createCodeSnippet(editor.document.languageId);

        return latestSnippetResultBuffer;
    }
}
