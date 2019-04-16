'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as Path from 'path';
import { workspace, window, commands, ExtensionContext } from 'vscode';
import { CodeSnippetInterface } from './codeSnippetInterface';
import { Misc } from './misc';


type StyleName = "dark" | "forest" | "neutral";
namespace StyleName{
    export const Dark = "dark"
    export const Forest = "forest"
    export const Neutral = "neutral"
}

const BackgroundColorDefault = "#fafaf6";

class ConfigMermaid
{
    public fixedStyle: StyleName;
    public fixedBackgroundColor: string;
}


export class MermaidCodeSnippet implements CodeSnippetInterface
{
    private static _instance:MermaidCodeSnippet;

    private _configMermaid: ConfigMermaid = null;

    private constructor()
    { 
        this._configMermaid = new ConfigMermaid();

        // defaults
        this._configMermaid.fixedStyle = StyleName.Forest;
        this._configMermaid.fixedBackgroundColor = BackgroundColorDefault;

        var config = vscode.workspace.getConfiguration('previewSeqDiag');
        if(!!config && !!config.mermaid)
        {
            // fixedStyle
            switch(config.mermaid.fixedStyle)
            {
                case StyleName.Dark:
                case StyleName.Forest:
                case StyleName.Neutral:
                    this._configMermaid.fixedStyle = config.mscgen.fixedNamedStyle;
                    break;

                default:
                    break;
            }

            // fixedBackgroundColor
            if(config.mermaid.fixedBackgroundColor != null)
                this._configMermaid.fixedBackgroundColor = config.mermaid.fixedBackgroundColor;
        }
    }

    public static get instance():MermaidCodeSnippet
    {
        if (!this._instance)
            this._instance = new MermaidCodeSnippet();
            
        return this._instance;
    }
    
    public async createCodeSnippet(languageId: string, extentiponPath:string): Promise<string>
    {
        return this.extractSnippet(languageId, extentiponPath);
    }

    private async extractSnippet(languageId: string, extentiponPath:string): Promise<string>
    {
        let editor = vscode.window.activeTextEditor;
        let text = editor.document.getText();

        try {
            text = text.replace(/%%[ \t]+import[ \t]?:[ \t]?(.+)/g, (match, subsequenceFile) => {
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

        return this.previewSnippet(languageId, extentiponPath, text);
    }

    private async errorSnippet(error: string): Promise<string>
    {
        return Misc.getFormattedHtml("",error);
    }

    private async previewSnippet(languageId: string, extentiponPath:string, payLoad: string): Promise<string>
    {
        return Misc.getFormattedHtml(
            `
            <link href="vscode-resource:${extentiponPath}/node_modules/mermaid/dist/mermaid.${this._configMermaid.fixedStyle}.min.css" rel="stylesheet" type="text/css">
            <script src="vscode-resource:${extentiponPath}/node_modules/mermaid/dist/mermaid.min.js">
            <script type="text/javascript">
                mermaid.initialize({startOnLoad:true});
            </script>
            `,
            `
            <div style='color:transparent; background-color:${this._configMermaid.fixedBackgroundColor}'>
                <div class="mermaid">${payLoad}</div>
            </div>
            <div>
                <a href="https://knsv.github.io/mermaid/live_editor/" style="color:#999999;">mermaid Official site.</a>
            </div>
            `);
    }
}
