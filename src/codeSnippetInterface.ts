'use strict';

import * as vscode from 'vscode';

export interface PreviewRenderContext
{
    document: vscode.TextDocument;
    extensionPath: string;
    webview: vscode.Webview;
}

export interface CodeSnippetInterface
{
    createCodeSnippet(context: PreviewRenderContext): Promise<string>;
}
