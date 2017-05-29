'use strict';

import * as vscode from 'vscode';
import { workspace, window, commands, ExtensionContext } from 'vscode';
import { CodeSnippetInterface } from './codeSnippetInterface';
import { Misc } from './misc';


export class MermaidCodeSnippet implements CodeSnippetInterface
{
    private static _instance:MermaidCodeSnippet;

    private constructor()
    { }

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
        return Misc.getFormattedHtml(`
            <link href="${Misc.getExtensionRootPath()}/node_modules/mermaid/dist/mermaid.css" rel="stylesheet" id="baseCss">
            <script src="${Misc.getExtensionRootPath()}/node_modules/mermaid/dist/mermaid.min.js">
            <script type="text/javascript">
                mermaid.initialize({startOnLoad:true});
            </script>
            `,`
            <script type="text/javascript">
                if(document.body.className === 'vscode-dark') {
                    document.getElementById('baseCss').href = "${Misc.getExtensionRootPath()}/node_modules/mermaid/dist/mermaid.dark.css";
                } else if(document.body.className === 'vscode-light') {
                    document.getElementById('baseCss').href = "${Misc.getExtensionRootPath()}/node_modules/mermaid/dist/mermaid.forest.css";
                }
            </script>
            <hr color="#999" />
            <div class="mermaid">
                ${payLoad}
            </div>
            `);
    }
}
