'use strict';

import * as vscode from 'vscode';
import { workspace, window, commands, ExtensionContext } from 'vscode';
import { CodeSnippetInterface } from './codeSnippetInterface';
import { Misc } from './misc';


export class MscgenCodeSnippet implements CodeSnippetInterface
{
    private static _instance:MscgenCodeSnippet;

    private constructor()
    { }

    public static get instance():MscgenCodeSnippet
    {
        if (!this._instance)
            this._instance = new MscgenCodeSnippet();
            
        return this._instance;
    }
    
    public async createCodeSnippet(languageId: string): Promise<string>
    {
        return this.extractSnippet(languageId);
    }

    private async extractSnippet(languageId: string): Promise<string>
    {
        let editor = vscode.window.activeTextEditor;
        let text = editor.document.getText();
        return this.previewSnippet(languageId, text);
    }

    private async errorSnippet(error: string): Promise<string>
    {
        return Misc.getFormattedHtml("",error);
    }

    private async previewSnippet(languageId: string,payLoad: string): Promise<string>
    {
        return Misc.getFormattedHtml(`
            <script>
                var mscgen_js_config = {}
            </script>
            <script src='${Misc.getExtensionRootPath()}/node_modules/mscgenjs-inpage/dist/mscgen-inpage.js'></script>
            `,`
            <hr color='#999' />
            <!-- lazy, classic, cygne, pegasse, fountainpen -->
            <script
                 type='text/x-${languageId}'
                 data-named-style='cygne'
                 data-regular-arc-text-vertical-alignment='above'>
                ${payLoad}
            </script>
            `);
    }
}
