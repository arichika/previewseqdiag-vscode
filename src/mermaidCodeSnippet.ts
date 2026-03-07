'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as Path from 'path';
import { CodeSnippetInterface, PreviewRenderContext } from './codeSnippetInterface';
import { Misc } from './misc';
import { MermaidPreviewConfig, resolveMermaidImports, resolveMermaidPreviewConfig } from './previewLogic';

const backgroundColorDefault = "#fafaf6";

export class MermaidCodeSnippet implements CodeSnippetInterface
{
    private static _instance:MermaidCodeSnippet;

    private constructor() {}

    public static get instance():MermaidCodeSnippet
    {
        if (!this._instance){
            this._instance = new MermaidCodeSnippet();
        }
            
        return this._instance;
    }
    
    public async createCodeSnippet(context: PreviewRenderContext): Promise<string>
    {
        const text = this.resolveImports(context.document, context.document.getText());
        return this.previewSnippet(context, text, this.getConfig());
    }

    private getConfig(): MermaidPreviewConfig
    {
        const previewConfig = vscode.workspace.getConfiguration('previewSeqDiag');
        return resolveMermaidPreviewConfig(
            previewConfig.get<string>('mermaid.fixedStyle'),
            previewConfig.get<string>('mermaid.fixedBackgroundColor'),
            backgroundColorDefault,
        );
    }

    private resolveImports(document: vscode.TextDocument, text: string): string
    {
        try {
            return resolveMermaidImports(
                text,
                document.uri.fsPath,
                (fileName) => fs.readFileSync(fileName, 'utf8'),
            );
        }
        catch (err) {
            console.error(err);
            return text;
        }
    }

    private async previewSnippet(context: PreviewRenderContext, payLoad: string, config: MermaidPreviewConfig): Promise<string>
    {
        const jsPath = vscode.Uri.file(Path.join(context.extensionPath, 'dist', 'mermaid', 'mermaid.min.js'));
        const jsSrc = context.webview.asWebviewUri(jsPath);
        return Misc.getFormattedHtml(
            `<script type="module" src="${jsSrc}"></script>
            <script type="text/javascript">mermaid.initialize({startOnLoad:true, theme:"${config.fixedStyle}"});</script>`,
            `<div style="color:transparent;">
                <div class="mermaid psd-svg-container" style="background-color:${config.fixedBackgroundColor}">${payLoad}</div>
                <style>.psd-svg-container svg{height:auto !important;}</style>
            </div>`,
            context.webview,
            context.document.fileName);
    }
}
