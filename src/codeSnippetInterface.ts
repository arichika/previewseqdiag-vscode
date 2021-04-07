'use strict';

import * as vscode from 'vscode';

export interface CodeSnippetInterface
{
    createCodeSnippet(languageId:string, extentiponPath:string, webview: vscode.Webview): Promise<string>;
}