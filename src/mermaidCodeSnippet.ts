'use strict';

import * as vscode from 'vscode';
import { workspace, window, commands, ExtensionContext } from 'vscode';
import { CodeSnippetInterface } from './codeSnippetInterface';
import { Misc } from './misc';


class ConfigMermaid
{
    public fixedStyle: string = null;
    public fixedBackgroundColor: string = null;
}


export class MermaidCodeSnippet implements CodeSnippetInterface
{
    private static _instance:MermaidCodeSnippet;

    private _configMermaid: ConfigMermaid = null;

    private constructor()
    { 
        this._configMermaid = new ConfigMermaid();

        var config = vscode.workspace.getConfiguration('previewSeqDiag');
        if(!!config && !!config.mermaid)
            this._configMermaid.fixedStyle = !(config.mermaid.fixedStyle == null) ? config.mermaid.fixedStyle : null;
        if(!!config && !!config.mermaid)
            this._configMermaid.fixedBackgroundColor = !(config.mermaid.fixedBackgroundColor == null) ? config.mermaid.fixedBackgroundColor : null;
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
        var styleSwitchScript = null;
        switch(this._configMermaid.fixedStyle)
        {
            case "dark":
            case "forest":
                styleSwitchScript = `
                    <script type="text/javascript">
                            document.getElementById('baseCss').href = "${Misc.getExtensionRootPath()}/node_modules/mermaid/dist/mermaid.${this._configMermaid.fixedStyle}.css";
                    </script>`;
                break;

            case null:
                styleSwitchScript = `
                    <script type="text/javascript">
                        if(document.body.className === 'vscode-dark') {
                            document.getElementById('baseCss').href = "${Misc.getExtensionRootPath()}/node_modules/mermaid/dist/mermaid.dark.css";
                        } else if(document.body.className === 'vscode-light') {
                            document.getElementById('baseCss').href = "${Misc.getExtensionRootPath()}/node_modules/mermaid/dist/mermaid.forest.css";
                        }
                    </script>`;
                break;

            default:
                styleSwitchScript = ``;
        }

        return Misc.getFormattedHtml(`
            <link href="${Misc.getExtensionRootPath()}/node_modules/mermaid/dist/mermaid.css" rel="stylesheet" id="baseCss">
            <script src="${Misc.getExtensionRootPath()}/node_modules/mermaid/dist/mermaid.min.js">
            <script type="text/javascript">
                mermaid.initialize({startOnLoad:true});
            </script>
            `,
            styleSwitchScript + `
            <div class="mermaid"
                style='color:transparent; background-color:${this._configMermaid.fixedBackgroundColor}'>
                ${payLoad}
            </div>
            <hr color="#999" />
            <a href="https://knsv.github.io/mermaid/live_editor/" style="color:#999999;">If you want to download by SVG, It is good to use this official website.</a>
            `);
    }
}
