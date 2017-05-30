'use strict';

import * as vscode from 'vscode';
import { workspace, window, commands, ExtensionContext } from 'vscode';
import { CodeSnippetInterface } from './codeSnippetInterface';
import { Misc } from './misc';


class ConfigMscgen
{
    public fixedNamedStyle: string = "cygne";
}

export class MscgenCodeSnippet implements CodeSnippetInterface
{
    private static _instance:MscgenCodeSnippet;

    private _configMscgen: ConfigMscgen;

    private constructor()
    {
        this._configMscgen = new ConfigMscgen();

        var config = vscode.workspace.getConfiguration('previewSeqDiag');

        if(!!config && !!config.mscgen)
            this._configMscgen.fixedNamedStyle = !(config.mscgen.fixedNamedStyle == null) ? config.mscgen.fixedNamedStyle: "cygne";
    }

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
            <script 
                style='color:transparent;' 
                type='text/x-${languageId}' 
                data-named-style='${this._configMscgen.fixedNamedStyle}' 
                data-regular-arc-text-vertical-alignment='above'>
                ${payLoad}
            </script>
            <hr color='#999' />
            <a href="https://mscgen.js.org/" style="color:#999999;">If you want to download by SVG or PNG, It is good to use this official website.</a>
            `);
    }
}
