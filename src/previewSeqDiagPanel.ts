'use strict';

import * as vscode from 'vscode';
import { CodeSnippetInterface, PreviewRenderContext } from './codeSnippetInterface';
import { DefaultCodeSnippet } from './defaultCodeSnippet';
import { MermaidCodeSnippet } from './mermaidCodeSnippet';
import { MscgenCodeSnippet } from './mscgenCodeSnippet';
import { getSnippetKind, isPreviewableLanguage } from './previewLogic';

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
        return !!editor && isPreviewableLanguage(editor.document.languageId);
    }

    public async update(editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor): Promise<void>
    {
        if (!this.webViewPanel || !this.canPreview(editor)) {
            return;
        }

        const snippet = this.getSnippet(editor.document.languageId);
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

    private getSnippet(languageId: string): CodeSnippetInterface
    {
        switch (getSnippetKind(languageId)) {
            case 'mermaid':
                return MermaidCodeSnippet.instance;

            case 'mscgen':
                return MscgenCodeSnippet.instance;

            default:
                return DefaultCodeSnippet.instance;
        }
    }
}
