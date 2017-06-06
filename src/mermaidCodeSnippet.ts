'use strict';

import * as vscode from 'vscode';
import { workspace, window, commands, ExtensionContext } from 'vscode';
import { CodeSnippetInterface } from './codeSnippetInterface';
import { Misc } from './misc';


class ConfigMermaid
{
    public fixedStyle: string = "forest";
    public fixedBackgroundColor: string = "#fafaf0";
}


export class MermaidCodeSnippet implements CodeSnippetInterface
{
    private static _instance:MermaidCodeSnippet;

    private _configMermaid: ConfigMermaid = null;

    private constructor()
    { 
        this._configMermaid = new ConfigMermaid();

        var config = vscode.workspace.getConfiguration('previewSeqDiag');
        if(!!config && !!config.mermaid && config.mermaid.fixedStyle != null)
            this._configMermaid.fixedStyle = config.mermaid.fixedStyle;
        if(!!config && !!config.mermaid && config.mermaid.fixedBackgroundColor != null)
            this._configMermaid.fixedBackgroundColor = config.mermaid.fixedBackgroundColor;
    }

    public static get instance():MermaidCodeSnippet
    {
        if (!this._instance)
            this._instance = new MermaidCodeSnippet();
            
        return this._instance;
    }
    
    public async createCodeSnippet(): Promise<string>
    {
        return this.extractSnippet();
    }

    private async extractSnippet(): Promise<string>
    {
        let editor = vscode.window.activeTextEditor;
        let text = editor.document.getText();
        return this.previewSnippet(text);
    }

    private async errorSnippet(error: string): Promise<string>
    {
        return Misc.getFormattedHtml("",error);
    }

    private async previewSnippet(payLoad: string): Promise<string>
    {
        var styleSwitch = null;
        switch(this._configMermaid.fixedStyle)
        {
            case "dark":
            case "forest":
            case "neutral":
                styleSwitch = "." + this._configMermaid.fixedStyle;
                break;

            default:
                styleSwitch = "";
        }

        return Misc.getFormattedHtml(
            `
            <link href="${Misc.getExtensionRootPath()}/node_modules/mermaid/dist/mermaid${styleSwitch}.min.css" rel="stylesheet" type="text/css">
            <script src="${Misc.getExtensionRootPath()}/node_modules/mermaid/dist/mermaid.min.js">
            <script type="text/javascript">
                mermaid.initialize({startOnLoad:true});
            </script>
            `,
            `
            <div style='color:transparent; background-color:${this._configMermaid.fixedBackgroundColor}'>
                <div class="mermaid">${payLoad}</div>
            </div>
            <a href="https://knsv.github.io/mermaid/live_editor/" style="color:#999999;">If you want to download by SVG, It is good to use this official website.</a>
            `);
    }
}
