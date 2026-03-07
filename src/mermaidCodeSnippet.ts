'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as Path from 'path';
import { CodeSnippetInterface, PreviewRenderContext } from './codeSnippetInterface';
import { Misc } from './misc';


type StyleName = "dark" | "forest" | "neutral";
namespace StyleName{
    export const dark = "dark";
    export const forest = "forest";
    export const neutral = "neutral";
}

const backgroundColorDefault = "#fafaf6";

interface ConfigMermaid
{
    fixedStyle: StyleName;
    fixedBackgroundColor: string;
}

const mermaidStyles = new Set<StyleName>([
    StyleName.dark,
    StyleName.forest,
    StyleName.neutral,
]);

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

    private getConfig(): ConfigMermaid
    {
        const previewConfig = vscode.workspace.getConfiguration('previewSeqDiag');
        const configuredStyle = previewConfig.get<string>('mermaid.fixedStyle');
        const configuredBackgroundColor = previewConfig.get<string>('mermaid.fixedBackgroundColor');

        return {
            fixedStyle: mermaidStyles.has(configuredStyle as StyleName)
                ? configuredStyle as StyleName
                : StyleName.forest,
            fixedBackgroundColor: configuredBackgroundColor ?? backgroundColorDefault,
        };
    }

    private resolveImports(document: vscode.TextDocument, text: string): string
    {
        const directory = Path.dirname(document.uri.fsPath);

        try {
            return text.replace(/%%[ \t]+import[ \t]?:[ \t]?(.+)/g, (_, subsequenceFile) => {
                const fileName = Path.join(directory, subsequenceFile.trim());
                return fs
                    .readFileSync(fileName, 'utf8')
                    .replace(/sequenceDiagram/g, '');
            });
        }
        catch (err) {
            console.error(err);
            return text;
        }
    }

    private async previewSnippet(context: PreviewRenderContext, payLoad: string, config: ConfigMermaid): Promise<string>
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
