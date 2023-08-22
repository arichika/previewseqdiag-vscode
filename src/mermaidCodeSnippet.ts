'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as Path from 'path';
import { workspace, window, commands, ExtensionContext } from 'vscode';
import { CodeSnippetInterface } from './codeSnippetInterface';
import { Misc } from './misc';


type StyleName = "dark" | "forest" | "neutral";
namespace StyleName{
    export const dark = "dark";
    export const forest = "forest";
    export const neutral = "neutral";
}

const backgroundColorDefault = "#fafaf6";

class ConfigMermaid
{
    public fixedStyle: StyleName = StyleName.forest;
    public fixedBackgroundColor: string = backgroundColorDefault;
}


export class MermaidCodeSnippet implements CodeSnippetInterface
{
    private static _instance:MermaidCodeSnippet;

    private _configMermaid: ConfigMermaid;

    private constructor()
    { 
        this._configMermaid = new ConfigMermaid();

        // defaults
        this._configMermaid.fixedStyle = StyleName.forest;
        this._configMermaid.fixedBackgroundColor = backgroundColorDefault;

        var config = vscode.workspace.getConfiguration('previewSeqDiag');
        if(!!config && !!config.mermaid)
        {
            // fixedStyle
            switch(config.mermaid.fixedStyle)
            {
                case StyleName.dark:
                case StyleName.forest:
                case StyleName.neutral:
                    this._configMermaid.fixedStyle = config.mscgen.fixedNamedStyle;
                    break;

                default:
                    break;
            }

            // fixedBackgroundColor
            if(config.mermaid.fixedBackgroundColor !== null){
                this._configMermaid.fixedBackgroundColor = config.mermaid.fixedBackgroundColor;
            }
        }
    }

    public static get instance():MermaidCodeSnippet
    {
        if (!this._instance){
            this._instance = new MermaidCodeSnippet();
        }
            
        return this._instance;
    }
    
    public async createCodeSnippet(languageId: string, extentiponPath:string, webview: vscode.Webview): Promise<string>
    {
        return this.extractSnippet(languageId, extentiponPath, webview);
    }

    private async extractSnippet(languageId: string, extentiponPath:string, webview: vscode.Webview): Promise<string>
    {
        let editor = vscode.window.activeTextEditor;
        let text = editor?.document.getText() || "";

        try {
            text = text.replace(/%%[ \t]+import[ \t]?:[ \t]?(.+)/g, (match, subsequenceFile) => {

                if(!editor){
                    return "";
                }

                let dirname = editor.document.uri.fsPath
                    .toString()
                    .split(Path.sep);

                dirname.pop();

                const fileName = dirname.join(Path.sep) + Path.sep + subsequenceFile.trim();
                const importSequence = fs
                    .readFileSync(fileName, 'utf8')
                    .replace(/sequenceDiagram/g, '');
                return importSequence;
            });
        }
        catch (err) {
            console.error(err);
        }

        return this.previewSnippet(languageId, extentiponPath, text, webview);
    }

    private async errorSnippet(error: string, webview: vscode.Webview): Promise<string>
    {
        return Misc.getFormattedHtml("",error, webview);
    }

    private async previewSnippet(languageId: string, extentiponPath:string, payLoad: string, webview: vscode.Webview): Promise<string>
    {
        var jsPath = vscode.Uri.file(Path.join(extentiponPath, 'dist','mermaid', 'mermaid.min.js'));
        const jsSrc = webview.asWebviewUri(jsPath);
        return Misc.getFormattedHtml(
            `<script type="module" src="${jsSrc}"></script>
            <script type="text/javascript">mermaid.initialize({startOnLoad:true});</script>`,
            `<div style="color:transparent;">
                <div class="mermaid psd-svg-container" style="background-color:${this._configMermaid.fixedBackgroundColor}">${payLoad}</div>
                <style>.psd-svg-container svg{height:auto !important;}</style>
            </div>`,
            webview);
    }
}
