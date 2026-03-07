'use strict';

import * as vscode from 'vscode';
import { CodeSnippetInterface, PreviewRenderContext } from './codeSnippetInterface';
import { DefaultCodeSnippet } from './defaultCodeSnippet';
import { MermaidCodeSnippet } from './mermaidCodeSnippet';
import { MscgenCodeSnippet } from './mscgenCodeSnippet';

const previewableLanguageIds = new Set(['mermaid', 'mmd', 'mscgen', 'msgenny', 'xu']);
const snippetByLanguage = new Map<string, CodeSnippetInterface>([
    ['mermaid', MermaidCodeSnippet.instance],
    ['mmd', MermaidCodeSnippet.instance],
    ['mscgen', MscgenCodeSnippet.instance],
    ['msgenny', MscgenCodeSnippet.instance],
    ['xu', MscgenCodeSnippet.instance],
]);

export class PreviewSeqDiagPanel
{
    private webViewPanel: vscode.WebviewPanel | null = null;
    private extensionPath = '';

    public setCurrentWebViewPanel(panel: vscode.WebviewPanel | null): void
    {
        this.webViewPanel = panel;
    }

    public setExtensionPath(path: string): void
    {
        this.extensionPath = path;
    }

    public canPreview(editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor): editor is vscode.TextEditor
    {
        return !!editor && previewableLanguageIds.has(editor.document.languageId);
    }

    public async update(editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor): Promise<void>
    {
        if (!this.webViewPanel || !this.canPreview(editor)) {
            return;
        }

        const snippet = snippetByLanguage.get(editor.document.languageId) ?? DefaultCodeSnippet.instance;
        const context: PreviewRenderContext = {
            document: editor.document,
            extensionPath: this.extensionPath,
            webview: this.webViewPanel.webview,
        };

        const html = await snippet.createCodeSnippet(context);
        if (this.webViewPanel) {
            this.webViewPanel.webview.html = html;
        }
    }
}
